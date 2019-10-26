import { File } from './../../serverless-builder/File';
import { ServerlessYML } from './../container/ServerlessYml';
import { Builder } from "../container/ShellModel";
import replace from "../../utils/replace";
import Function from "./Functions";

export class Command extends Builder implements ServerlessYML {
    parent: Function;
    output: string;
    function: string;
    isVoid: boolean;
    addOns: object;
    isResource: boolean = false;
    isLib: boolean = false;

    fromFile(path: string) {

    }

    toCode(): string {
        if (this.isVoid) return `${this.function}`
        else return `var ${this.output} = ${this.function};`
    }
    toServerless(file: File) {
        file.append(this.addOns || {});
    }
    fromObject(object: { key: string, value: string, parent: Function }): Command {
        this.output = object.key;
        this.parent = object.parent;
        this.function = object.value;
        this.checkForAddon(object.value);
        this.isVoid = object.key.split("_")[0] === "void";

        return this;
    }

    checkForAddon(object: any) {
        if (typeof object != "string") return;
        const keys: Array<string> = object.split(".");
        const name: string = keys.shift();


        if (this.parent.myResources().has(name)) {
            this.isResource = true;
        } else {
            this.isResource = false;
        }

        if (this.isResource) {
            const resource: any = this.parent.myResources().get(name);
            const addOns = resource.addOn;
            if (addOns) {
                const _function: any = this.parent.name;
                this.addOns = JSON.parse(replace(addOns[keys.join(".")], this.utils().getEnvironment({ function: _function })));
            }

        }


    }

    validate(): boolean {
        return true;
    }
}