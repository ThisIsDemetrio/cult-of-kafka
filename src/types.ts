import type { Admin, Consumer, Producer } from "kafkajs";
import pino from "pino"
import readline from 'readline'

export type InquirerSelectChoices = {
    name: string;
    callback?: (...args: unknown[]) => boolean | Promise<boolean>
}

export interface InquirerWrapperInterface {
    autocomplete: (message: string, choices: string[]) => Promise<string>;
    confirm: (message: string) => Promise<boolean>
    input: (message: string, defaultValue?: unknown) => Promise<string>;
    path: (message: string) => Promise<string>
    select: (message: string, choicesData: InquirerSelectChoices[]) => Promise<void>;
}

export type KafkaInstance = {
    admin: Admin,
    consumer: Consumer,
    producer: Producer
}

export type MenuContext = {
    inquirer: InquirerWrapperInterface,
    kafka: KafkaInstance,
    logger: pino.Logger,
    readline: readline.Interface
}
