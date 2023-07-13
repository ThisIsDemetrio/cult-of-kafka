import fs from 'fs'

import { kafkaMenu } from "./kafkaMenu"
import type { InquirerSelectChoices, MenuContext } from "../types"
import { listTopics } from "../kafka/listTopics"
import { sendKafkaMessages } from "../kafka/sendKafkaMessages"
import { readTopic } from "../kafka/readTopic"

export async function initialMenu(context: MenuContext): Promise<void> {
    const { 
        inquirer, 
        kafka: { 
            admin: kafkaAdmin,
            producer: kafkaProducer 
        }, 
        logger
    } = context

    const choices: InquirerSelectChoices[] = [
        {
            name: 'Manage Kafka instance',
            callback: async (): Promise<boolean> => {
                await kafkaMenu(context)
                return true
            }
        },
        {
            name: 'Send message(s) from JSON file',
            callback: async (): Promise<boolean> => {
                // TODO: This should have its own menu and choices to:
                //       - prompt if send them all together
                //       - prompt if send them one by one
                //       - edit file
                console.log("Ok, feed me a file.")
                const path = await inquirer.path('What file includes the messages you want to send?')
                logger.debug({ description: 'path selected', path })

                let messages = []
                try {
                    const content = fs.readFileSync(path, 'utf-8')
                    console.log({ content })
                    messages = JSON.parse(content)
                } catch (error) {
                    logger.debug({ description: 'error occurred during file loading', error})
                    console.log('Looks like the file you selected is invalid. Maybe you want to try it again?')
                }

                if (messages.length === 0) return true

                const topicList = await listTopics(logger, kafkaAdmin)
                const topic = await inquirer.autocomplete('To which topic you want to send these messages?', topicList)

                await sendKafkaMessages(logger, kafkaProducer, topic, messages)
                return false
            }
        },
        {
            name: 'Read incoming messages from a topic',
            callback: async (): Promise<boolean> => {
                const topicList = await listTopics(logger, kafkaAdmin)
                const topic = await inquirer.autocomplete('Which topic you want to listen?', topicList)

                const fromBeginning = await inquirer.confirm('You want to listen from the beginning of the topic?')

                await readTopic(context, topic, fromBeginning)
                return false
            }
        },
        {
            name: 'Close (CTRL+C will do the same)',
            callback: async (): Promise<boolean> => {
                return new Promise(() => {
                    console.log('Gotcha. Miss ya. Bye.')
                    process.exit()
                })
            }
        }
    ]

    await inquirer.select('Entering the Cult of Kafka. What can I do for you today?', choices)
}