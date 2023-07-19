import type { Admin, ITopicConfig } from "kafkajs"
import type { Logger } from "pino"

export async function createTopic(logger: Logger, kafkaAdmin: Admin, topicConfig: ITopicConfig): Promise<boolean> {
    logger.debug({ description: `Creating topic ${topicConfig.topic}`, ...topicConfig })

    const result = await kafkaAdmin.createTopics({
        waitForLeaders: true,
        topics: [topicConfig]
    })

    logger.debug('Topic creation result', { result })

    return result
} 