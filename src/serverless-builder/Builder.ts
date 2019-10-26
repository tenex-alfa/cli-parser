import { Utils } from './../models/container/ShellUtils';
import { File } from './File';
import { Tx } from './../models/whole/Main';
import * as fse from "fs-extra";
import Function from '../models/functions/Functions';
import { Container } from '../models/container/Container';
import { FunctionHelper } from '../models/functions/FunctionHelper';
import execute from '../utils/default-execute';

export class Builder {
    files: Array<File>;

    utils() {
        return Utils;
    }

    validate(template: Tx): boolean {
        return template.validate();
    }

    buildFromObject(template: Tx): boolean {
        // Sets up architexture
        fse.ensureDirSync(this.utils().getPath("out"));
        fse.ensureDirSync(this.utils().getPath("outFunction"));
        fse.ensureDirSync(this.utils().getPath("outResources"));
        fse.ensureDirSync(this.utils().getPath("outLibrarires"));

        // Building functions
        for (const object of template.functionMap) {
            this.buildFunction(object);
        }

        // Building yml
        for (const object of template.functionMap) {
            this.buildYml(template);
        }

        this.buildOtherFiles(template);

        // Moving resources

        return true;
    }

    async installFromObject(template: Tx): Promise<boolean> {
        const installFolder = template.utils().getPath("out");
        const command = `cd ${installFolder} && npm i`;
        await execute(command);
        return true;
    }

    private buildFunction(functionObject: [string, FunctionHelper], config?: { path: string }) {
        const [name, object] = functionObject;
        const file = new File();
        file.setTile(name);
        file.setPath(config ? config.path : this.utils().getPath("outFunction"));
        file.setText(object.toCode())
        file.make();

        for (const [name, resource] of object.myResources()) {
            // Moves resource
            const outResPath = resource.outPath();
            const inResPath = resource.inPath();
            if (!fse.existsSync(outResPath)) {
                fse.copySync(inResPath, outResPath);
            }
        }

        for (const [name, library] of object.libMap) {
            // Moves resource
            const outResPath = library.outPath();
            const inResPath = library.inPath();
            if (!fse.existsSync(outResPath)) {
                fse.copySync(inResPath, outResPath);
            }
        }
    }

    private buildOtherFiles(template: Tx) {
        template.files().map(v => v.make());
    }

    private buildYml(template: Tx) {
        const file = new File();
        file.setTile("serverless");
        file.setType("yml");
        file.setBody({});
        file.setPath(this.utils().getPath("out"))
        // Here we recurvicly build the template
        template.toServerless(file);
        file.make();

    }

}