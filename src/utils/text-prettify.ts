import { toYml } from './yml';
import chalk from "chalk"
const colors: any = [
    { key: /true/g, color: chalk.green, },
    { key: /false/g, color: chalk.red, },
    { key: /inDir/g, color: chalk.green, },
    { key: /config.*/s, color: chalk.blue },
    { key: /functions.*/s, color: chalk.green, },
    { key: /method(.*\n)*/g, color: chalk.blue, },
    { key: /outDir/g, color: chalk.red, },
    { key: /void/g, color: chalk.dim },

]

export const prettify = (object: object): string => {
    let str = toYml(object);
    str = str.replace(/\"/g, " ");
    colors.forEach((v: any) => str = str.replace(v.key, (val) => v.color(val)))
    return str;

}

