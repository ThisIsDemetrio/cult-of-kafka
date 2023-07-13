import type { Admin } from "kafkajs"
import type { Logger } from "pino"

export async function listTopics(logger: Logger, kafkaAdmin: Admin): Promise<string[]> {
    logger.debug('Requesting list of topics')
    const result = await kafkaAdmin.listTopics()
    logger.debug(`Request completed: ${result.length} found.`)
    logger.trace(`Topics found: ${result.join(' - ')}`)

    return result
}