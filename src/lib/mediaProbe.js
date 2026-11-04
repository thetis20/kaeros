import {toFileUrl} from './mediaUrl';

function createProbeElement(type) {
    if (type === 'image') return new Image();
    if (type === 'audio') return new Audio();
    // 'video' and 'dubbing-video' both decode through a <video> element.
    return document.createElement('video');
}

export function probeOne({src, file, type}, {timeoutMs = 8000} = {}) {
    return new Promise((resolve) => {
        let settled = false;
        let blobUrl = null;
        let timeoutId = null;
        let element = null;

        const successEvent = type === 'image' ? 'load' : 'loadedmetadata';

        function cleanup() {
            if (element) {
                element.removeEventListener(successEvent, onSuccess);
                element.removeEventListener('error', onError);
                element.src = '';
            }
            if (timeoutId !== null) clearTimeout(timeoutId);
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
                blobUrl = null;
            }
        }

        function settle(code) {
            if (settled) return;
            settled = true;
            cleanup();
            resolve({code});
        }

        function onSuccess() {
            settle('ok');
        }

        function onError() {
            settle('decode-failed');
        }

        try {
            element = createProbeElement(type);
            if (type === 'video' || type === 'dubbing-video') {
                element.preload = 'metadata';
            }

            element.addEventListener(successEvent, onSuccess);
            element.addEventListener('error', onError);

            timeoutId = setTimeout(() => settle('timeout'), timeoutMs);

            if (file) {
                blobUrl = URL.createObjectURL(file);
                element.src = blobUrl;
            } else {
                element.src = toFileUrl(src);
            }
        } catch (e) {
            settle('decode-failed');
        }
    });
}

export function probeDurationMs({src, file}, {timeoutMs = 8000} = {}) {
    return new Promise((resolve) => {
        let settled = false;
        let blobUrl = null;
        let timeoutId = null;
        let element = null;

        function cleanup() {
            if (element) {
                element.removeEventListener('loadedmetadata', onLoaded);
                element.removeEventListener('error', onError);
                element.src = '';
            }
            if (timeoutId !== null) clearTimeout(timeoutId);
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
                blobUrl = null;
            }
        }

        function settle(result) {
            if (settled) return;
            settled = true;
            cleanup();
            resolve(result);
        }

        function onLoaded() {
            const duration = element.duration;
            settle(Number.isFinite(duration) && duration > 0 ? Math.round(duration * 1000) : null);
        }

        function onError() {
            settle(null);
        }

        try {
            element = document.createElement('video');
            element.preload = 'metadata';

            element.addEventListener('loadedmetadata', onLoaded);
            element.addEventListener('error', onError);

            timeoutId = setTimeout(() => settle(null), timeoutMs);

            if (file) {
                blobUrl = URL.createObjectURL(file);
                element.src = blobUrl;
            } else {
                element.src = toFileUrl(src);
            }
        } catch (e) {
            settle(null);
        }
    });
}

export async function probeAll(items, {concurrency = 3} = {}) {
    const results = new Array(items.length);
    let nextIndex = 0;

    async function worker() {
        while (nextIndex < items.length) {
            const currentIndex = nextIndex++;
            const item = items[currentIndex];
            const {code} = await probeOne(item);
            results[currentIndex] = {...item, code};
        }
    }

    const workerCount = Math.max(1, Math.min(concurrency, items.length || 1));
    await Promise.all(Array.from({length: workerCount}, () => worker()));

    return results;
}