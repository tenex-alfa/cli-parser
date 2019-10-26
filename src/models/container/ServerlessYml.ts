import { File } from "../../serverless-builder/File";

export interface ServerlessYML {
    toServerless(file: File): void;

}