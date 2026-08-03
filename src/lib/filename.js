export function getFilename(value, placeholder) {
    if (value.file) {
        return value.file?.name
    }
    if (value.src) {
        const regex = /\/([^/]*\..*)/g;
        const array = [...value.src.matchAll(regex)];
        return array[0]?.[1] || value.src
    }
    return placeholder
}

export function stripExtension(filename) {
    return filename.replace(/\.[^./]+$/, '');
}

export function resolveAutoFillName(currentName, defaultName, fileName) {
    const isEmpty = !currentName || !currentName.trim();
    const isUntouchedDefault = !!defaultName && currentName === defaultName;
    return (isEmpty || isUntouchedDefault) ? stripExtension(fileName) : currentName;
}

export function hasSource(value) {
    return !!(value.file || value.src);
}
