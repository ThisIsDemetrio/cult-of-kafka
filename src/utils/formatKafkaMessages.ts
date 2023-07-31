import type { Message } from "kafkajs";


const safeParseToString = (value: unknown): string => typeof value === 'string' ? value : JSON.stringify(value)

export const isValidMessageContent = (value: unknown): value is string | object => {
    return ['string', 'object'].includes(typeof value) && !Array.isArray(value) 
}

export function formatMessage(rawMessage: Record<string, unknown>): Message {
    const { key, value, timestamp, partition, headers } = rawMessage

    const parsedKey = key ? safeParseToString(key) : undefined
    const parsedValue = value ? safeParseToString(value) : null

    const parsedHeaders = Object.keys(headers as never || {}).length > 0 ? headers as Record<string, never> : undefined
    const parsedPartition = isNaN(+(partition as never)) ? undefined : parseInt(partition as never)

    return {
        key: parsedKey,
        value: parsedValue,
        headers: parsedHeaders,
        partition: parsedPartition,
        timestamp: timestamp?.toString() || undefined
    }
}

export function formatAndValidateMessages(rawMessages: unknown): { messages: Message[], invalidMessages: unknown[] } {
    const messages: Message[] = []
    const invalidMessages: unknown[] = []

    for (const rawMessage of Array.isArray(rawMessages) ? rawMessages : [rawMessages]) {
        const { key, value, timestamp, partition, headers } = rawMessage

        if (!isValidMessageContent(value)) {
            invalidMessages.push(rawMessage)
            continue
        }

        const parsedKey = key ? safeParseToString(key) : undefined
        const parsedValue = value ? safeParseToString(value) : null

        messages.push({
            key: parsedKey,
            value: parsedValue,
            headers,
            partition,
            timestamp
        })    
    }

    return { messages, invalidMessages }
}