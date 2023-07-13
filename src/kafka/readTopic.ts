import type { MenuContext } from "../types";

export async function readTopic(context: MenuContext, topic: string, fromBeginning: boolean): Promise<boolean> {
    const { kafka: { consumer }, logger, readline } = context

    logger.debug('Start reading from topic', { topic, fromBeginning })

    await consumer.subscribe({ topic, fromBeginning })

    readline.on('line', async (input: string) => {
        if (input === 'ESC') {
          console.log('Fine enough. I\'ll stop reading.');
          await consumer.stop();
        }
      });

    await consumer.run({
        eachMessage: async payload => {
            const { topic, partition, message } = payload

            console.log('----------')
            console.log(`Received in topic ${topic}, partition #${partition}`)
            console.log('----------')
            console.log({ key: message.key?.toString() || ''})
            console.log('----------')
            console.log('Value: ')
            console.log(message.value?.toString() || '')
            console.log('----------')
            console.log()
        }
    })

    return false
}