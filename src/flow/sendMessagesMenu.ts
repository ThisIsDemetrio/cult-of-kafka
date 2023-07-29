import type { InquirerSelectChoices, MenuContext } from "../types.js"
import { listTopics } from "../kafka/listTopics.js"
import { sendKafkaMessages } from "../kafka/sendKafkaMessages.js"
import { formatAndValidateMessages, formatMessages, isValidMessageContent } from "../utils/formatKafkaMessages.js"

export async function sendMessagesMenu(context: MenuContext, jsonContent: unknown): Promise<void> {
    const { 
        inquirer, 
        kafka: { 
            admin: kafkaAdmin,
            producer: kafkaProducer 
        }, 
        logger
    } = context

    const topicList = await listTopics(logger, kafkaAdmin)

    const choices: InquirerSelectChoices[] = [
        {
            name: 'Send all the messages at the same time',
            callback: async (): Promise<boolean> => {    
                const {messages, invalidMessages} = formatAndValidateMessages(jsonContent)
                if (invalidMessages.length > 0) {
                    logger.debug({ description: "Invalid messages", invalidMessages })
                    console.log(`${messages.length} messages are not valid, they will be skipped.`)
                } else if (messages.length === 0) {
                    console.log("Looks like the JSON file you gave me contains no messages. So nothing will be sent.")
                    return true
                } else {
                    console.log(`Ready to send ${messages.length} messages.`)    
                }

                const topic = await inquirer.autocomplete('Select a topic you want to send these messages:', topicList)
                await sendKafkaMessages(logger, kafkaProducer, topic, messages)

                console.clear()
                console.log('--------')
                console.log(`${messages.length} messages successfully sent to topic ${topic}!`)
                console.log('--------')
                return false
            }
        },
        {
            name: 'Send the messages one by one',
            callback: async (): Promise<boolean> => {
                const messages = formatMessages(jsonContent)
                let selectedTopic: string | undefined = undefined
                
                let messageSentCounter = 0
                let skippedMessagesCounter = 0

                for (let index = 0; index < messages.length; index++) {
                    let message = messages[index]

                    console.clear()
                    console.log('--------')
                    console.log('Message to be sent')
                    console.log('--------')
                    console.log(JSON.stringify(message, null,2 ))
                    console.log('--------')
                    
                    // TODO: Probably a simple select with send/edit/skip would be great here
                    const editMessage = await inquirer.confirm("Do you want to edit first?")
                    
                    if (editMessage) {
                        const editedMessage = await inquirer.editor("Edit the message", JSON.stringify(message, null, 2))
                        try {
                            message = JSON.parse(editedMessage)
                        } catch (error){
                            logger.debug("Error in edited message", error)
                            // TODO: We keep the previous one here, but I want to be able to change it again
                            console.log("The message received is invalid. We will keep the previous one then.")
                        }
                    }

                    while (!isValidMessageContent(message.value)) {
                        const editMessage = await inquirer.confirm("Message looks invalid: do you want to edit it? (or we skip it?)")
                        if (!editMessage) {
                            skippedMessagesCounter += 1
                            continue
                        }

                        const editedMessage = await inquirer.editor("Edit the message", JSON.stringify(message, null, 2))
                        try {
                            message = JSON.parse(editedMessage)
                        } catch (error){
                            logger.debug("Error in edited message", error)
                        }
                    }

                    selectedTopic = await inquirer.autocomplete(
                        'To which topic do you want to send this message?', 
                        topicList, 
                        selectedTopic
                    )

                    await sendKafkaMessages(logger, kafkaProducer, selectedTopic, [message])
                    messageSentCounter += 1
                    console.log('--------')
                    console.log(`Message successfully sent to topic!`)
                    console.log('--------')


                }
            
                console.log()
                console.log('--------')
                console.log(`We're done here: ${messageSentCounter} messages successfully sent, ${skippedMessagesCounter} messages skipped!`)
                console.log('--------')
                return true
            }
        },
        {
            name: 'Go back'
        }
    ]

    console.log('--------')
    await inquirer.select('Entering the Cult of Kafka. What can I do for you today?', choices)
}