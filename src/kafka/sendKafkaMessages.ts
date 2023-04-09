import type { Message, Producer } from "kafkajs";
import type { Logger } from "pino";

export async function sendKafkaMessages(logger: Logger, producer: Producer, topic: string, messages: Message[] | Message): Promise<void> {
    const messagesToSend = Array.isArray(messages) ? messages: [messages]

    logger.debug({ description: 'Sending messages', topic, messages })
    await producer.send({
        topic,
        messages: messagesToSend
    })

    logger.debug({ description: 'Messages sent', topic, messages })
}