import type { Admin } from "kafkajs"
import type { Logger } from "pino"

export async function deleteTopic(logger: Logger, kafkaAdmin: Admin, topicName: string): Promise<void> {
    logger.debug(`Deleting topic ${topicName}`)
    await kafkaAdmin.deleteTopics({topics: [topicName]})
    logger.debug('Topic deleted')
} 