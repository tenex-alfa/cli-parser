import { CodeObject } from './../container/CodeObject';
import { VaribleConfig } from './VaribleConfig';
import { Builder } from "../container/ShellModel";
import * as fse from "fs-extra";

export class Varible extends Builder implements CodeObject {
    path: string;
    config: VaribleConfig;
    name: string;
    pathExist: boolean;
    key: string;
    value: string;


    fromFile(_path: string, config?: VaribleConfig): Varible {
        this.path = _path;
        this.config = config;
        this.pathExist = fse.existsSync(_path);
        // this.fromObject(evalSafeYmlFromFile(path.join(this.path)));
        return this;
    }

    toCode(): string {
        return `var ${this.key} = ${this.value}`
    }

    fromObject(object: { key: string, value: string }, config?: VaribleConfig): Varible {
        this.key = object.key;
        this.value = object.value;
        if (config) {
            this.config = config;
            this.name = config.name;
        }
        return this;
    }

    validate(): boolean {
        return true;
    }
}