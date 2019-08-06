export * from './nameGenerator';
export { default as saveThumbnail } from './saveThumbnail';
export function guid(a) {
    return a
        ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
        : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, guid);
}
