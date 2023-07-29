export function printTopicList(topics: string[]): void {
    topics = topics.sort()
    console.log('--------')
    console.log('List of existing topics')
    console.log('--------')
    for (const topic of topics) {
        console.log(`- ${topic}`)
    }
    console.log('--------')
}