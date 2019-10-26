const replace = (object: any, replacable: any): string => {
    let string = JSON.stringify(object).replace(/ /g, "");
    for (const key in replacable) {
        if (typeof replacable[key] == "object")
            string = string.split(`"\${${key}}"`.replace(/ /g, "")).join(JSON.stringify(replacable[key]));
        string = string.split(`\${${key}}`.replace(/ /g, "")).join(replacable[key]);
    }

    return string;
};

export default replace;