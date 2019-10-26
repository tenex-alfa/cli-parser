import chalk from 'chalk';
import { Utils } from './ShellUtils';
import { prettify } from '../../utils/text-prettify';
import { toYml } from '../../utils/yml';
import { js } from "js-beautify"

export abstract class Builder {
    abstract fromFile(path: string, config?: object): void;
    abstract fromObject(object: object, config?: object): void;
    abstract validate(): boolean;

    ValidationError(message: string) {
        const str = message.split(/  */g).join(" ").replace(/\n/g, "").replace(/\//g, "\n");
        let outMessage;
        try {
            throw new Error(chalk.red(str));
        } catch (err) {
            outMessage = err
        }
        console.log(outMessage)
        console.log("\n\n\n\n\n\n___________________________\n")
        console.log(chalk.red(str))
        process.exit(0);

    }

    utils() {
        return Utils
    }

    toString() {
        return prettify(this);
    }

    toObject() {
        return this;
    }
}