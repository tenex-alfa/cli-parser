import get from '../whole/Main';
import * as path from "path";

const paths: any = {
    res: undefined,
    lib: undefined,
    pathToTx: undefined,
    out: undefined,
    dir: undefined,
}

const env: Array<{ key: string, value: any }> = [];

export const Utils = {

    addEnv(value: { key: string, value: any } | Array<{ key: string, value: any }>) {
        if (!Array.isArray(value)) value = [value];
        const list = value as Array<{ key: string, value: any }>
        env.push(...list);
    },
    getEnv(id?: string): Array<{ key: string, value: any }> {
        if (id) {
            for (const i of env) {
                if (id == i.key)
                    return i.value;
            }
            throw new Error("No env with such name");
        }
        return env;
    }
    ,
    getEnvironment(caller?: object) {
        if (!caller) caller = {};
        return {
            ...env,
            ...caller
        }
    },
    getWhole() {
        return get();
    },
    setPath(object: { res: string, dir: string, out: string, lib: string, outFunction: string, outResources: string, outLibrarires: string }) {
        let i: any;
        const obj = object as any;
        for (i as string in object) {
            paths[i] = obj[i];
        }
    },
    getPath(_path: "res" | "dir" | "out" | "lib" | "outFunction" | "outResources" | "outLibrarires", adder?: string): string {
        let dir = paths[_path];
        if (adder)
            return path.join(dir, adder);
        return path.join(dir);
    },
    buildResources(resourceObject: any): object {
        const resources = { ...resourceObject };
        for (const i in resources) {
            if ((typeof resources[i]) !== "object") {
                const temp = resources[i];
                resources[i] = {};
                resources[i].config = { name: temp };
            } else {
                resources[i].config = { ...resources[i] }
            }
        }
        return resources;
    },
    buildLib(lib: any): object {
        return this.buildResources(lib);
    },
    buildVaribles(varibles: any) {
        return this.buildResources(varibles);
    }
}