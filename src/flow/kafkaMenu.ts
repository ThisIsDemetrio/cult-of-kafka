import type { ITopicConfig } from "kafkajs"

import { createTopic } from "../kafka/createTopic.js"
import { deleteTopic } from "../kafka/deleteTopic.js"
import { listTopics } from "../kafka/listTopics.js"
import { printTopicList } from "../kafka/printTopicList.js"
import type { InquirerSelectChoices, MenuContext } from "../types.js"

export async function kafkaMenu(context: MenuContext): Promise<void> {
    const { inquirer, kafka: { admin: kafkaAdmin }, logger } = context

    const choicesData: InquirerSelectChoices[] = [
        {
            name: 'List all topics',
            callback: async (): Promise<boolean> => {
                const result = await listTopics(logger, kafkaAdmin)
                printTopicList(result)
                return true
            }
        },
        {
            name: 'Create a topic',
            callback: async (): Promise<boolean> => {
                const topicName = await inquirer.input('What is the name of the topic you want to create?')
                if (!topicName) {
                    return true
                }

                const topicConfig: ITopicConfig = { topic: topicName }
                const askForAdditionalInfo = await inquirer.confirm('You want to add additional configuration to this topic?')
                if (askForAdditionalInfo) {
                    topicConfig.replicationFactor = Number(await inquirer.input('How many replicas?', 1))
                    topicConfig.numPartitions = Number(await inquirer.input('How many partitions?', 10))

                    const retention = await inquirer.input('Topic retention time? (in milliseconds', 360000)
                    topicConfig.configEntries = [{ name: 'retention.ms', value: retention }]
                } else {
                    topicConfig.replicationFactor = 1
                    topicConfig.numPartitions = 10
                    topicConfig.configEntries = [{ name: 'retention.ms', value: '360000' }]
                }


                await createTopic(logger, kafkaAdmin, topicConfig)
                console.log(`Topic ${topicConfig.topic} successfully created`)
                return true
            }
        },
        {
            name: 'Delete a topic',
            callback: async (): Promise<boolean> => {
                const topicList = await listTopics(logger, kafkaAdmin)
                const topicToDelete = await inquirer.autocomplete('Which topic do you want to delete?', topicList)
                if (await inquirer.confirm(`Are you sure to delete ${topicToDelete}?`)) {
                    await deleteTopic(logger, kafkaAdmin, topicToDelete)
                }
                return true
            }
        },
        {
            name: 'Go back'
        }
    ]

    await inquirer.select('Ok, let\'s manage your Kafka instance. What would you like to do?', choicesData)
}
