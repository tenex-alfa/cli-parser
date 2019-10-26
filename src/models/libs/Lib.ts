import { File } from './../../serverless-builder/File';
import { CodeObject } from './../container/CodeObject';
import { ServerlessYML } from '../container/ServerlessYml';
import { evalSafeYmlFromFile } from '../../utils/yml';
import { LibConfig } from './LibConfig';
import { Builder } from "../container/ShellModel";
import * as pathModule from "path";
import * as fse from "fs-extra";
import chalk from 'chalk';

export class Lib extends Builder implements ServerlessYML, CodeObject {
    path: string;
    config: LibConfig;
    name: string;
    key: string;
    pathExist: boolean;

    fromFile(_path: string, config?: LibConfig): Lib {
        try {
            this.path = _path;
            this.config = config;
            this.name = this.config.name;
            this.pathExist = fse.existsSync(_path);
            this.key = config.key;
            return this;
        } catch{
            return this;
        }

        // this.fromObject(evalSafeYmlFromFile(path.join(this.path)));

    }

    fromObject(object: any) {

    }

    outPath(): string {
        const outPath = super.utils().getPath("outLibrarires")
        return pathModule.join(outPath, this.name)
    }

    inPath() {
        return this.path;
    }

    validate(): boolean {

        const { ValidationError } = this;
        if (!this.pathExist)
            ValidationError(`The library ${chalk.blue(this.name)}
                            doesnt exist. Make sure you
                            have the library install and
                            in the library folder. If you
                            doesn't have it install you
                            can install it using npm.
                            ${chalk.blue("npm install $youpackage")}`)

        return true;
    }

    toCode(): string {
        return `require("${this.name}")`
    }

    toServerless(file: File) {
        file.append({})
    }
}