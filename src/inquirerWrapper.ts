import inquirer from "inquirer";
import inquirerAutocomplete from "inquirer-autocomplete-prompt"
import fuzzyPath from "inquirer-fuzzy-path"
import fuzzy from 'fuzzy'
import type { InquirerSelectChoices, InquirerWrapperInterface } from "./types";

export class InquirerWrapper implements InquirerWrapperInterface {
    constructor () {
        // TODO: We need some keyPressed handler to detect when interrupt the opearation
        //       Something like inquirer-interrupted-prompt (https://github.com/lnquy065/inquirer-interrupted-prompt)
        //       Or the escHandler (which doesn't work because typings)
        inquirer.registerPrompt('autocomplete', inquirerAutocomplete)
        inquirer.registerPrompt('fuzzypath', fuzzyPath)
    }

    async autocomplete(message: string, choices: string[] = []): Promise<string> {
        // TODO: Extend typings to avoid the any
        const {answer} = await inquirer.prompt({
            type: 'autocomplete',
            name: 'answer',
            choices,
            message,
            source: async (_answersSoFar: unknown, input?: string) => {
                if (!input) return choices

                return await fuzzy.filter(input, choices)
                    .map(token => token.string)
            } 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
    
        return answer
    }
    
    async confirm(message: string): Promise<boolean> {
        const {answer} = await inquirer.prompt({
            type: 'confirm',
            name: 'answer',
            message
        })
    
        return !!answer
    }

    async input(message: string, defaultValue?: unknown): Promise<string> {
        try {
            const {answer} = await inquirer.prompt({
                type: 'input',
                name: 'answer',
                message,
                default: String(defaultValue ?? '')
            })
        
            return answer
        } catch (error) {
            return ''
        }
    }

    async path(message: string): Promise<string> {
        // TODO: Extend typings to avoid the any
        const {answer} = await inquirer.prompt({
            type: 'fuzzypath',
            name: 'answer',
            message,
            excludePath: (nodePath: string) => nodePath.startsWith('node_modules'),
            rootPath: '.',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)

        return answer
    }
    
    async select(message: string, choicesData: InquirerSelectChoices[]): Promise<void> {
        const choices = choicesData.map(choice => choice.name)  
        
        let keepGoing = true
        while(keepGoing) {
            const result = await inquirer.prompt({
                type: 'list',
                name: 'choice',
                message,
                choices
            })
        
            const selectedChoice = choicesData.find(c => result['choice'] === c.name) || choicesData[0]
            if (!selectedChoice.callback) {
                keepGoing = false
                break
            }
    
            keepGoing = selectedChoice.callback ? await selectedChoice.callback() : false
        }
    }
}

