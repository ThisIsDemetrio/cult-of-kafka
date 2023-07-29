import fs from 'fs'

import { kafkaMenu } from "./kafkaMenu.js"
import type { InquirerSelectChoices, MenuContext } from "../types.js"
import { listTopics } from "../kafka/listTopics.js"
import { readTopic } from "../kafka/readTopic.js"
import { sendMessagesMenu } from './sendMessagesMenu.js'

export async function initialMenu(context: MenuContext): Promise<void> {
    const { 
        inquirer, 
        kafka: { 
            admin: kafkaAdmin
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
        // TODO: Add menu voice: create message
        {
            name: 'Send message(s) from JSON file',
            callback: async (): Promise<boolean> => {
                console.log("")
                const path = await inquirer.path('What file includes the messages you want to send?')
                logger.debug({ description: 'path selected', path })

                let jsonContent: unknown
                try {
                    const content = fs.readFileSync(path, 'utf-8')
                    jsonContent = JSON.parse(content)
                } catch (error) {
                    logger.debug({ description: 'error occurred during file loading', error})
                    console.log('Looks like the file you selected is invalid. Please modify or select another file')
                    console.log("--------")
                    return true
                }

                // TODO: From here we move to the sendMessagesMenu
               await sendMessagesMenu(context, jsonContent)
               return true
            }
        },
        {
            name: 'Read incoming messages from a topic',
            callback: async (): Promise<boolean> => {
                const topicList = await listTopics(logger, kafkaAdmin)
                const topic = await inquirer.autocomplete('Which topic you want to listen?', topicList)
                
                const fromBeginning = await inquirer.confirm('You want to listen from the beginning of the topic?')
                
                // TODO: Add a stop by keydown
                // TODO: Add the possibility to save the messages received in a JSON file
                // TODO: Add readable timestamp to each message
                await readTopic(context, topic, fromBeginning)
                return true
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