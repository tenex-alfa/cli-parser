import { File } from './../../serverless-builder/File';
import { CodeObject } from './../container/CodeObject';
import { ServerlessYML } from '../container/ServerlessYml';
import { ResourceConfig } from './ResourceConfig';
import { evalSafeYmlFromFile } from '../../utils/yml';
import * as fse from "fs-extra";
import { Builder } from "../container/ShellModel";
import * as path from "path";
import chalk from 'chalk';
export class Resource extends Builder implements ServerlessYML, CodeObject {

    name: string;
    addOn: object;
    path: string;
    template: object;
    mock: object;
    architecture: object;
    types: object;
    pathExist: boolean;
    config: ResourceConfig;
    key: string;

    outPath() {
        return path.join(super.utils().getPath("outResources"), this.name);
    }
    inPath() {
        return this.path;
    }
    toCode(): string {
        return `require("${this.name}")`
    }

    toString(): string {
        return `require("${this.name}")`
    }

    fromObject(object: any): Resource {
        this.addOn = object.addOn;
        this.template = object.template;
        this.mock = object.mock;
        this.types = this.getTypes(object.types);
        return this;
    }

    getTypes(types: any): object {
        const _types: any = { ...types }
        for (const i in _types) {
            const file: any = _types[i];
            const _path = path.join(this.path, "types", file);
            const env = this.utils().getEnv();
            const parsedEnv = env.map(({ key, value }) => ({ key: new RegExp(`\\\${${key}}`, "g"), value }));

            _types[i] = evalSafeYmlFromFile(_path, [{ key: /\${name}/g, value: this.key }, ...parsedEnv])
        }
        return _types;
    }

    fromFile(_path: string, config: ResourceConfig): Resource {
        try {
            this.path = _path;
            this.config = config;
            this.name = config.name;
            this.key = config.key;
            this.pathExist = fse.existsSync(_path);
            this.fromObject(evalSafeYmlFromFile(path.join(_path, "tx.yml")));
            return this;
        }
        catch {
            return this;
        }

    }

    validate(): boolean {
        const { ValidationError } = this;
        if (!this.pathExist)
            ValidationError(`The resource ${chalk.blue(this.name)}
                        doesnt exist. Make sure you
                        have the resource install and
                        in the resource folder. You can
                        install using the tx-cli or the 
                        package manager of your liking.
                        ${chalk.blue("npm install $youpackage")}`)
        return true;
    }

    toServerless(file: File) {
        const arch = this.types as any;
        file.append(arch.serverless)
    }
}