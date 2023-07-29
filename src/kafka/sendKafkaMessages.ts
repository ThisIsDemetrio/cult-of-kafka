import type { Message, Producer } from "kafkajs";
import type { Logger } from "pino";

export async function sendKafkaMessages(logger: Logger, producer: Producer, topic: string, messages: Message[]): Promise<void> {
    console.log('--------')
    console.log(`Sending ${messages.length} messages...`)

    logger.debug({ description: 'Sending messages', topic, messages })

    const recordMetadata = await producer.send({topic, messages})

    logger.debug({ description: 'Messages sent', topic, recordMetadata })
}