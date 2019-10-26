import { File } from './../../serverless-builder/File';

import { Builder } from './../../serverless-builder/Builder';
import { CodeObject } from '../container/CodeObject';
import { Command } from './Command';
import { Container } from "../container/Container";
import { ServerlessYML } from '../container/ServerlessYml';

export abstract class FunctionHelper extends Container implements CodeObject, ServerlessYML {
    name: string;
    out: string;
    abstract key: string;

    abstract toCode(): string;
    abstract getExportString(): string;

    validate(): boolean {
        const map = [...this.resourceMap, ...this.libMap];
        for (const [name, object] of map) {
            const res = object.validate()
            if (!res) return false;
        }
        return true;
    }

    private toImportObject([key, name]: [string, CodeObject]): string {
        return `var ${key} = ${name.toCode()}.default.bind({id:"${name.key}"})`
    }
    protected getVaribleString(): string {
        return [...this.variblesMap].map(v => v[1].toCode()).join("\n")
    }
    protected getResourceString(): string {
        return [...this.resourceMap].map(this.toImportObject).join("\n")
    }
    protected getReturnString() {
        return `return ${this.out}`
    }
    protected getLibString() {
        return [...this.libMap].map(this.toImportObject).join("\n");
    }

    toServerless(file: File) {
        const map = [...this.resourceMap, ...this.libMap];
        for (const [name, object] of map) {
            object.toServerless(file)
        }

    }
}