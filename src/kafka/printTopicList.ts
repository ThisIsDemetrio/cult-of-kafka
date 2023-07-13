export function printTopicList(topics: string[]): void {
    topics = topics.sort()
    for (const topic of topics) {
        console.log(`- ${topic}`)
    }
}