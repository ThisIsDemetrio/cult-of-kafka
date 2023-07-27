import type { Message, Producer } from "kafkajs";
import type { Logger } from "pino";

type ParsedMessage = {
    key: string | Record<string, unknown>
    value?: string | Record<string, unknown>
}

export async function sendKafkaMessages(logger: Logger, producer: Producer, topic: string, messages: ParsedMessage[] | ParsedMessage): Promise<void> {
    // TODO: Safety check on messages, skipping invalid messages, received handling of errors
    const messagesToSend: Message[] = (Array.isArray(messages) ? messages: [messages]).map((parsedMessage: ParsedMessage) => (
        {
            key: typeof parsedMessage.key === 'string' ? parsedMessage.key : JSON.stringify(parsedMessage.key), 
            value: typeof parsedMessage.value === 'string' ? parsedMessage.value : JSON.stringify(parsedMessage.value), 
        }
    ))

    // TODO: Prompt

    logger.debug({ description: 'Sending messages', topic, messagesToSend })

    await producer.send({
        topic,
        messages: messagesToSend
    })

    logger.debug({ description: 'Messages sent', topic, messagesToSend })
}