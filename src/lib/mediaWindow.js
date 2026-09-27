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

export function fadeWindow(startSec, endSec, duration, fadeOutMs) {
    const fadeSec = (Number(fadeOutMs) || 0) / 1000;
    if (fadeSec <= 0) return null;
    const toSec = endSec !== null && endSec !== undefined ? endSec : duration;
    if (!Number.isFinite(toSec)) return null;
    const fromSec = Math.max(startSec, toSec - fadeSec);
    if (fromSec >= toSec) return null;
    return {fromSec, toSec};
}

export function fadeOpacity(currentTime, fade) {
    if (!fade) return 0;
    const ratio = (currentTime - fade.fromSec) / (fade.toSec - fade.fromSec);
    return Math.min(1, Math.max(0, ratio));
}

export function fadeInWindow(startSec, endSec, duration, fadeInMs) {
    const fadeSec = (Number(fadeInMs) || 0) / 1000;
    if (fadeSec <= 0) return null;
    const limit = endSec !== null && endSec !== undefined ? endSec : duration;
    const toSec = Number.isFinite(limit) ? Math.min(startSec + fadeSec, limit) : startSec + fadeSec;
    if (toSec <= startSec) return null;
    return {fromSec: startSec, toSec};
}

export function fadeInOpacity(currentTime, fade) {
    if (!fade) return 0;
    return 1 - fadeOpacity(currentTime, fade);
}
