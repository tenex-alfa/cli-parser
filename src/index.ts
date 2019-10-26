import { Builder } from './serverless-builder/Builder';
import getTx from "./models/whole/Main";
console.log("parsing...");
const tx = getTx().fromFile("./tx.yml");

(async () => {
    console.log(new Builder().validate(tx))
    console.log(new Builder().buildFromObject(tx))
    //console.log(await new Builder().installFromObject(tx))
})()