import type { Message } from "kafkajs";


const safeParseToString = (value: string | object): string => typeof value === 'string' ? value : JSON.stringify(value)

export const isValidMessageContent = (value: unknown): value is string | object => {
    return ['string', 'object'].includes(typeof value) && !Array.isArray(value) 
}

export function formatMessages(rawMessages: unknown): Message[] {
    const result: Message[] = []

    for (const rawMessage of Array.isArray(rawMessages) ? rawMessages : [rawMessages]) {
        const { key, value, timestamp, partition, headers } = rawMessage

        const parsedKey = key ? safeParseToString(key) : undefined
        const parsedValue = value ? safeParseToString(value) : null

        result.push({
            key: parsedKey,
            value: parsedValue,
            headers,
            partition,
            timestamp
        })    
    }

    return result
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