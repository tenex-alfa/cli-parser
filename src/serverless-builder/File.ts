import { prettify } from './../utils/text-prettify';
import { toYml } from './../utils/yml';
import * as fse from "fs-extra";
import * as pathModule from "path";
import * as deepmerge from "deepmerge";
import chalk from 'chalk';
import { js as jsprettify } from "js-beautify";

export class File {
    private body: object;
    private title: string;
    private path: string;
    private text: string;
    private fileType: "js" | "yml" | "json";

    constructor() {
        this.fileType = "js";
    }

    private checkBodyIsAllowed() {
        if (this.fileType == "js") {
            const message = chalk.red(` Cant set the body to object on an js file
                                        please set the body to allowed type .yml
                                        or .json`);
            throw new Error(message);
        }
    }

    setText(text: string) {
        this.text = text;
    }

    setTile(title: string) {
        this.title = title;
    }
    setType(type: "yml" | "js" | "json") {
        this.fileType = type;
    }
    setPath(path: string) {
        this.path = path;
    }

    setBody(body: object) {

        this.body = {};
        this.append(body)
    }

    toString() {
        return this.makeBody();
    }

    append(object: object) {
        this.checkBodyIsAllowed();
        if (!this.body) this.body = {};
        this.body = deepmerge.all([this.body, object]);
    }

    make() {
        const _path = pathModule.join(this.path, this.title + "." + this.fileType);
        const _body = this.makeBody();
        fse.ensureFileSync(_path)
        fse.writeFileSync(_path, _body, "utf-8")
    }

    private makeBody(): string {
        let _body = this.text ? jsprettify(this.text) : "";

        if (this.body) {
            if (this.fileType == "yml")
                _body += this.body && toYml(this.body);

            if (this.fileType == "json")
                _body += this.body && JSON.stringify(this.body);

            if (this.fileType == "js")
                _body = this.body && JSON.stringify(this.body);
        }
        return _body;

    }
}