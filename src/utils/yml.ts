import { safeLoad, safeDump } from "js-yaml";
import { readFileSync, writeFileSync } from "fs-extra";

// Unique integer
let unique = 0;


export const toYml = (json: string | object): string => {
    if ((typeof json) == "object") json = JSON.stringify(json);

    let str = safeDump(JSON.parse(json.toString()), { indent: 2 });;
    const replace: any = [
        { key: /void/g, value: () => "void_" + unique++ },
        { key: /0x33/g, value: () => "!" },
        { key: /;/g, value: () => "" },
    ]

    replace.forEach((value: any) => str = str.replace(value.key, value.value))

    return str;
}

export const toYmlToFile = (json: string | object, path: string) => {
    const str = toYml(json);
    writeFileSync(path, str);
}

export const evalYml = (yamlobj: string): any => {

    const replace: any = [
        { key: /void/g, value: () => "void_" + unique++ },
        { key: /!/g, value: () => "0x33" },
        { key: /;/g, value: () => "" },
    ]

    replace.forEach((value: any) => yamlobj = yamlobj.replace(value.key, value.value))
    return safeLoad(yamlobj);
}

export const evalYmlFromFile = (path: string): any => {
    return evalYml(readFileSync(path, "utf-8"));
}

export const makeYmlSafe = (path: string, replacables: Array<{ key: string | RegExp, value: string }> = []): string => {
    const replace: any = [
        { key: /void/g, value: () => "void_" + unique++ },
        { key: /!/g, value: () => "0x33" },
        { key: /;/g, value: () => "" },
        ...replacables,
    ]

    replace.forEach((value: any) => path = path.replace(value.key, value.value))
    return path;
}

export const evalSafeYml = (yamlObject: string) => {
    const safeString = makeYmlSafe(yamlObject, []);
    return evalYml(safeString);
}


export const evalSafeYmlFromFile = (path: string, replacables?: Array<{ key: string | RegExp, value: string }>) => {
    const safeString = makeYmlSafe(readFileSync(path, "utf-8"), replacables);
    return evalYml(safeString);
}
