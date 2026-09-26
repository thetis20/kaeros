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
