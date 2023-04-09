import { Kafka } from "kafkajs"
import type { KafkaConfig, SASLOptions } from 'kafkajs'
import type { Logger } from "pino"
import { readFileSync } from "fs"
import type { KafkaInstance } from "../types.js"

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

  if (username && password) {
    const sasl: SASLOptions = { username, password, mechanism: saslMechanism as any }
    config.sasl = sasl
  }

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