import * as dotenv from 'dotenv'
import { pino } from "pino";
import readline from 'readline'

import { initialMenu } from "./flow/initialMenu";
import { InquirerWrapper } from "./inquirerWrapper";
import { createNewKafkaInstance } from './kafka/createNewKafkaInstance.js';
import type { MenuContext } from "./types";

dotenv.config()

export default async function main(): Promise<void> {
  const logger = pino({ level: process.env.LOG_LEVEL || 'info' })

  const context: MenuContext = {
    inquirer: new InquirerWrapper(),
    logger,
    kafka: await createNewKafkaInstance(logger),
    readline: readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
  }

  await initialMenu(context)
}

main()