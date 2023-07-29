import type { Admin, Consumer, Producer } from "kafkajs";
import pino from "pino"
import readline from 'readline'

//#region Inquirer types

export type InquirerSelectChoices = {
    /**
     * The name of the choice that will be shown to the user
     */
    name: string;
    /**
     * The callback function that will be executed in case this choice has been selected by the user
     * @param args any kind of needed argument
     * @returns a boolean or a promise of a boolean. 
     * If `true`, the same menu will be shown, otherwise we move to the parent menu or the application will be closed.
     */
    callback?: (...args: unknown[]) => boolean | Promise<boolean>
}

export interface InquirerWrapperInterface {
    autocomplete: (message: string, choices: string[], defaultValue?: string) => Promise<string>;
    confirm: (message: string) => Promise<boolean>
    editor: (message: string, defaultValue: string) => Promise<string>,
    input: (message: string, defaultValue?: unknown) => Promise<string>;
    path: (message: string) => Promise<string>
    select: (message: string, choicesData: InquirerSelectChoices[]) => Promise<void>;
}

export type MenuContext = {
    inquirer: InquirerWrapperInterface,
    kafka: KafkaInstance,
    logger: pino.Logger,
    readline: readline.Interface
}

//#endregion

//#region Kafka types

export type KafkaInstance = {
    admin: Admin,
    consumer: Consumer,
    producer: Producer
}

//#endregion