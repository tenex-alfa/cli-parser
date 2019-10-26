import { TemplateConfig } from './TemplateConfig';
import { Builder } from "../container/ShellModel";

export class Template extends Builder {
    path: string;
    pathExist: boolean;
    key: string;

    fromFile(_path: string): Template {
        return this;
    }

    fromObject(object: object, config: TemplateConfig) {

    }
    validate(): boolean {
        return true;
    }
}