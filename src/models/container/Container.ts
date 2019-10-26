import { Varible } from '../varibles/Varible';
import { Lib } from '../libs/Lib';
import { Builder } from './ShellModel';
import { prettify } from '../../utils/text-prettify';
import { TX_DIR_FALLBACK, TX_OUT_FALLBACK, TX_RESDIR_FALLBACK, TX_LIBDIR_FALLBACK } from '../../config/fallbacks';
import * as disallowed from '../../config/fallbacks';
import { Resource } from '../resources/Resource';
import { evalSafeYmlFromFile } from '../../utils/yml';
import Function from '../functions/Functions';
import * as path from "path";


export abstract class Container extends Builder {

    resourceMap: Map<string, Resource>;
    libMap: Map<string, Lib>;
    variblesMap: Map<string, Varible>;
    parent: Container;
    path: string;

    fromFile(path: string, config: { parent: Container, name: string }): Container {
        this.path = path;
        this.fromObject(evalSafeYmlFromFile(path), config);
        return this;
    }

    fromObject(txObject: any, config: { parent: Container, name: string }): Container {
        this.buildResources(txObject.resources);
        this.buildLib(txObject.lib);
        this.buildVaribles(txObject.varibles);
        this.parent = config.parent;
        return this;
    }

    private buildResources(resources: any) {
        this.resourceMap = new Map();
        resources = super.utils().buildResources(resources);
        for (const i in resources) {
            const config = resources[i].config;
            config.key = i.toLowerCase();
            const name = config.name;
            const path: string = this.utils().getPath("res", name);
            this.resourceMap.set(i, new Resource().fromFile(path, config))
        }

    }

    private buildLib(libraries: any) {
        this.libMap = new Map();
        const lib: any = super.utils().buildLib(libraries);
        for (const i in lib) {
            const config = lib[i].config;
            const name = config.name;
            config.key = i.toLowerCase();
            const path: string = this.utils().getPath("lib", name);
            this.libMap.set(i, new Lib().fromFile(path, config))
        }
    }

    private buildVaribles(varibles: any) {
        this.variblesMap = new Map();
        for (const i in varibles) {
            this.variblesMap.set(i, new Varible().fromObject({ key: i, value: varibles[i] }))
        }
    }


    myResources(): Map<string, Resource> {
        if (this.parent)
            return new Map([...this.parent.myResources(), ...this.resourceMap]);
        return this.resourceMap;
    }

    myLibs(): Map<string, Lib> {
        if (this.parent)
            return new Map([...this.parent.myLibs(), ...this.libMap]);
        return this.libMap;
    }

    myVaribles(): Map<string, Varible> {
        if (this.parent)
            return new Map([...this.parent.myVaribles(), ...this.variblesMap]);
        return this.variblesMap;
    }
}

