export function toFileUrl(path) {
    const normalized = path.replace(/\\/g, '/');

    // UNC path (\\server\share\...) : the server becomes the URL host.
    if (normalized.startsWith('//')) {
        return 'file:' + encodeSegments(normalized);
    }

    // Windows drive path (C:\...) : keep the drive colon unencoded.
    const drive = normalized.match(/^([A-Za-z]:)(\/.*)?$/);
    if (drive) {
        return 'file:///' + drive[1] + encodeSegments(drive[2] || '/');
    }

    return 'file://' + encodeSegments(normalized);
}

function encodeSegments(path) {
    return path.split('/').map(encodeURIComponent).join('/');
}
