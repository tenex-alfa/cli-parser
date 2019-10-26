import { RequiredFileObject } from '../container/RequiredFileObject';
import { File } from './../../serverless-builder/File';
import { TX_OUTFUNC_FALLBACK, TX_OUTRES_FALLBACK, TX_OUTLIB_FALLBACK, TX_SERVICE, TX_STAGE, TX_REGION, TX_PROVIDER, TX_RUNTIME } from './../../config/fallbacks';
import { TX_DIR_FALLBACK, TX_OUT_FALLBACK, TX_RESDIR_FALLBACK, TX_LIBDIR_FALLBACK } from '../../config/fallbacks';
import * as disallowed from '../../config/fallbacks';
import { Resource } from '../resources/Resource';
import { evalSafeYmlFromFile } from '../../utils/yml';
import Function from '../functions/Functions';
import { js as codePrettify } from "js-beautify";
import { Container } from '../container/Container';
import { FunctionHelper } from '../functions/FunctionHelper';

let tx: Tx;

export class Tx extends FunctionHelper implements RequiredFileObject {
    functionMap: Map<string, Function>;
    key: string;
    type: "serverless";

    fromFile(path: string): Tx {
        this.key = "whole";
        super.fromFile(path, { name: "whole", parent: null });
        return this;
    }
    fromObject(txObject: any): Tx {
        const inDir = txObject.dir || TX_DIR_FALLBACK;
        const outDir = txObject.out || TX_OUT_FALLBACK;
        const libDir = txObject.libDir || TX_LIBDIR_FALLBACK;
        const resDir = txObject.resDir || TX_RESDIR_FALLBACK;
        const outFunc = txObject.outFunc || TX_OUTFUNC_FALLBACK;
        const outRes = txObject.outRes || TX_OUTRES_FALLBACK;
        const outLib = txObject.outLib || TX_OUTLIB_FALLBACK;

        this.utils().setPath({
            dir: inDir, out: outDir,
            lib: libDir, res: resDir,
            outFunction: outFunc,
            outResources: outRes,
            outLibrarires: outLib
        });

        this.setupServerlessEnv(txObject);
        super.fromObject(txObject, { parent: null, name: "whole" });
        this.buildFunctions(txObject.functions)

        return this;
    }

    setupServerlessEnv(txObject: any) {
        this.utils().addEnv([{
            key: "service",
            value: txObject.service || TX_SERVICE
        },
        {
            key: "stage",
            value: txObject.stage || TX_STAGE
        },
        {
            key: "provider",
            value: txObject.provider || {
                name: txObject.provider || TX_PROVIDER,
                region: txObject.region || TX_REGION,
                runtime: txObject.runtime || TX_RUNTIME,
            }
        },
        {
            key: "package",
            value: txObject.package || {
                individually: true
            }
        }
        ])
    }
    validate(): boolean {
        super.validate();
        [...this.functionMap].map(([key, obj]) => obj.validate());
        return true;
    }

    buildFunctions(functions: any) {
        this.functionMap = new Map();
        for (const name in functions) {
            const _function = new Function().fromObject(functions[name], { name, parent: this, key: name.toLowerCase() });
            this.functionMap.set(name, _function);
        }
    }

    toCode(): string {

        const str = `
        ${this.getResourceString()}
        ${this.getLibString()}
        `

        return codePrettify(str);
    }

    getExportString(): string {
        const map = [...this.resourceMap, ...this.libMap]
        return map.map(([name, obj]) => `exports.${name} = ${name}`).join("\n");
    }

    toServerless(file: File) {
        super.toServerless(file);
        [...this.functionMap].map(([key, obj]) => obj.toServerless(file));
        for (const { key, value } of this.utils().getEnv()) {
            console.log(key)
            file.append({ [key]: value })
        }
    }

    files(): Array<File> {

        const jsonPackageFile = new File();
        jsonPackageFile.setTile("package");
        jsonPackageFile.setType("json");
        jsonPackageFile.setPath(this.utils().getPath("out"));
        jsonPackageFile.setBody({
            name: this.utils().getEnv("service"),
            devDependencies: {
                "serverless-dotenv-plugin": "^2.1.1",
                "serverless-offline-lambda": "^1.0.4",
                "recursive-install": "^1.4.0",
                "webpack": "^4.41.2",
                "serverless-webpack": "^5.3.1"
            },
            scripts: {
                setup: "npm install && npm-recursive-install --skip-root",
                start: "sls offline"
            }
        })


        const webpackFile = new File();
        webpackFile.setText(`const slsw = require('serverless-webpack');
        module.exports = {
          entry: slsw.lib.entries
        }
        `)
        webpackFile.setTile("webpack.config");
        webpackFile.setPath(this.utils().getPath("out"));

        return [
            webpackFile,
            jsonPackageFile
        ]

    }
}




export default (): Tx => {
    if (!tx) tx = new Tx();
    return tx;
}

