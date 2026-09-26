export function toWindow({startOffsetMs, endOffsetMs} = {}) {
    const startSec = (Number(startOffsetMs) || 0) / 1000;
    const hasEnd = endOffsetMs !== undefined && endOffsetMs !== null && endOffsetMs !== '';
    const endSec = hasEnd ? (Number(endOffsetMs) || 0) / 1000 : null;
    return {startSec, endSec};
}

export function isPastEnd(currentTime, endSec) {
    return endSec !== null && currentTime >= endSec;
}

export function windowedProgress(currentTime, duration, startSec, endSec) {
    const rawDuration = (endSec !== null && endSec !== undefined ? endSec : duration) - startSec;
    return {
        currentTime: Math.max(0, currentTime - startSec),
        duration: Number.isNaN(rawDuration) ? 0 : Math.max(0, rawDuration),
    };
}

export function previewWindow(value, anchor, duration, previewMs = 5000) {
    const { startSec, endSec } = toWindow(value);
    const previewSec = previewMs / 1000;

    if (anchor === 'start') {
        let windowEnd = startSec + previewSec;
        if (Number.isFinite(duration)) {
            windowEnd = Math.min(windowEnd, duration);
        }
        return { startSec, endSec: windowEnd };
    }

    if (endSec === null && !Number.isFinite(duration)) {
        return toWindow(value);
    }

    const highBound = endSec !== null ? endSec : duration;
    const lowBound = Math.max(startSec, highBound - previewSec);
    return { startSec: lowBound, endSec: highBound };
}
