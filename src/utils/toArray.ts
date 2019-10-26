export const toArray = (obj: any) => {
    if (Array.isArray(obj)) return obj;
    else return [obj];
}