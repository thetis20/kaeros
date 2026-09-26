export function toFileUrl(path) {
    return 'file://' + path.split('/').map(encodeURIComponent).join('/');
}