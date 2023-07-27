import { Kafka, logLevel } from "kafkajs"
import type { KafkaConfig, SASLMechanism, SASLOptions  } from 'kafkajs'
import type { Logger, pino } from "pino"
import { readFileSync } from "fs"
import type { KafkaInstance } from "../types.js"

//#region internal logic

const logLevelMapping: Record<pino.LevelWithSilent, logLevel> = {
  silent: logLevel.NOTHING,
  fatal: logLevel.ERROR,
  error: logLevel.ERROR,
  warn: logLevel.WARN,
  info: logLevel.INFO,
  debug: logLevel.DEBUG,
  trace: logLevel.DEBUG
}

const isValidSaslMechanism = (value: string): value is SASLMechanism => 
["plain", "scram-sha-256", "scram-sha-512", "aws", "oauthbearer"].includes(value)

function getSASLOptions (logger: Logger): SASLOptions | undefined {
    const {
        KAFKA_SASL_MECHANISM: mechanism = 'plain',
        // required options for user/pass authentication
        KAFKA_SASL_USERNAME: username = '',
        KAFKA_SASL_PASSWORD: password = '',
        // required options for AWS authentication
        KAFKA_AWS_ACCESS_KEY_ID: accessKeyId = '',
        KAFKA_AWS_AUTH_IDENTITY: authorizationIdentity = '',
        KAFKA_AWS_SECRET_ACCESS_KEY: secretAccessKey = '',
        KAFKA_AWS_SESSION_TOKEN: sessionToken,
        // required options for OAuthBearer authentication
        KAFKA_OAUTH_PROVIDER_PATH: oAuthBearerFilePath
    } = process.env

    logger.debug(
        'Calculating SASL Authentication Options',
        { mechanism, username, password }
    )

    if (!isValidSaslMechanism(mechanism)) {
      throw new Error(`The saslMechanism of type ${mechanism} is not supported.`)
    }

    switch (mechanism) {
        case 'plain':
          // No need of options in case of a plain auth
          return
        case 'scram-sha-256':
        case 'scram-sha-512': {
            logger.debug(
                'SASL Authentication Options ready',
                { mechanism, username, password }
            )

            return { username, password, mechanism }
        }
        case 'aws':
            return { mechanism, accessKeyId, authorizationIdentity, secretAccessKey, sessionToken}
        case 'oauthbearer':{
            if (!oAuthBearerFilePath) {
                throw new Error(`OAuthBearer provider is supposed to be included in ${oAuthBearerFilePath} but has not been found`) 
            }
            
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const oAuthBearerProvider = require(oAuthBearerFilePath)
            return { mechanism, oauthBearerProvider: async () => await oAuthBearerProvider() }
        }
    }
}

//#region 

export async function createNewKafkaInstance(logger: Logger): Promise<KafkaInstance> {
  const {
    KAFKA_BROKERS_LIST: brokerList = '',
    KAFKA_SSL_ENABLED,
    KAFKA_SASL_USERNAME: username = '',
    KAFKA_SASL_PASSWORD: password = '',
    KAFKA_SASL_MECHANISM: saslMechanism = 'plain',
    KAFKA_CA_CERT_PATH: certificatePath = '',
  } = process.env

  const sslAuthEnabled = KAFKA_SSL_ENABLED === 'true'

  if (!brokerList) {
    throw new Error(`"${brokerList}" is not a valid list of Kafka brokers.`)
  }

  logger.debug(
    'Attempt to start Kafka instance with the following configuration',
    { brokerList, saslMechanism, sslAuthEnabled, username, password, certificatePath }
  )

  const ssl = certificatePath ? { ca: readFileSync(certificatePath, 'utf-8') } : sslAuthEnabled

  const config: KafkaConfig = {
    brokers: brokerList.split(','),
    clientId: 'kafka.cult-of-kafka.client',
    ssl,
  }
  
  config.sasl = getSASLOptions(logger)
  config.logLevel = logLevelMapping[logger.level]

  const kafka = new Kafka(config)

  const admin = kafka.admin()
  const consumer = kafka.consumer({ groupId: 'cult-of-kafka-group-id' })
  const producer = kafka.producer()

  await admin.connect()
  await consumer.connect()
  await producer.connect()

  process.on('exit', () => {
    logger.debug('Executing Kafka instance shutdown...')

    admin.disconnect()
    producer.disconnect()
    consumer.disconnect()
  })

  return { admin, consumer, producer }
}