import { File } from './../../serverless-builder/File';
import { CodeObject } from '../container/CodeObject';
import { Container } from './../container/Container';
import { Varible } from '../varibles/Varible';
import { FunctionConfig } from './FunctionConfig';
import { Command } from './Command';
import { Tx } from '../whole/Main';
import { Builder } from '../container/ShellModel';
import { js as prettify } from "js-beautify";
import { FunctionHelper } from './FunctionHelper';
import chalk from 'chalk';

export default class Function extends FunctionHelper {
    config: FunctionConfig;
    execute: Array<Command>;
    key: string;
    path: string;
    cors: boolean;
    methods: Array<string>;
    other: object;

    fromObject(object: any, config?: { key: string, name: string, parent: Container }): Function {
        try {
            super.fromObject(object, config);
            this.name = config.name.replace("/", "_");
            this.key = config.key;
            this.path = object.path || this.name;
            this.cors = object.cors == true;
            this.other = object.other || {};
            this.methods = object.method || object.methods || [];
            if (!Array.isArray(this.methods)) this.methods = [this.methods];
            this.buildExecute(object.execute);
            return this;
        } catch{
            return this;
        }
    }

    validate(): boolean {
        if (!this.name)
            this.ValidationError(`Function name doesn't match
                                requirment Every function must have
                                a non typebased name. Please
                                choose a string for the function
                                name.`);
        if (!this.key)
            this.ValidationError(`Cant find the key of the 
                                function ${this.name}.`)

        if (!this.execute || !this.execute[0])
            this.ValidationError(`Cant find the a method body
                                 of the function ${chalk.blue(this.name)}.
                                 Please ensure your function has
                                 the following structure.//
                                
                                
                                ${chalk.bold.white("example//")}
                                    ${chalk.blue("functions:/")}
                                    ${chalk.blue("~~ you_function_name:/")}
                                    ${chalk.blue("~~~~ execute:/")}
                                    ${chalk.blue("~~~~~~~~ void: exampleFunction/")}
                                    ${chalk.blue("~~~~~~~~ myResponse: response/")}
                                    ${chalk.blue("~~~~~~~~ return: myResponse/")}
                                        
                                `)
        super.validate();
        [...this.execute].map((value) => value.validate())
        return;
    }

    buildExecute(object: any) {
        this.execute = [];
        for (const key in object) {
            if (key === "output" || key === "out")
                this.out = key;
            this.execute.push(new Command().fromObject({ key, value: object[key], parent: this }))
        }

        this.out = this.out || this.execute[this.execute.length - 1].output;
    }

    toCode(): string {
        const parent = this.parent as FunctionHelper;

        const str = `
        ${parent.toCode()}
        
        function ${ this.name} (input){
            ${this.getResourceString()}
            ${this.getLibString()}
            ${this.getVaribleString()}
            ${ this.getExecuteString()}
            ${ this.getReturnString()}   
        }
        
        ${this.getExportString()}
        `

        return prettify(str);
    }



    getExportString(): string {
        return `exports.default = ${this.name}`
    }

    protected getExecuteString() {
        return this.execute.map(v => v.toCode()).join("\n");
    }

    toServerless(file: File) {
        super.toServerless(file);
        this.execute.map(v => v.toServerless(file))
        file.append(this.buildServerlessArch());
    }

    buildServerlessArch() {

        const { name, path, cors, other } = this;
        const _function: any = {
            [name]: {
                handler: name,
                ...other
            },
        }

        for (const method of this.methods) {
            if (!_function[name].events) _function[name].events = [];
            _function[name].events.push({ http: { path, method, cors } })
        }

        return {
            functions: {
                ..._function,
            }
        }
    }

}