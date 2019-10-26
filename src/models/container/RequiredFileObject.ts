import { File } from "../../serverless-builder/File";

export interface RequiredFileObject {
    files(): Array<File>
}