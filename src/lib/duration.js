const STEP_MS = 15000;

export function extractDurationMs({startOffsetMs, endOffsetMs} = {}, mediaDurationMs) {
    if (!Number.isFinite(mediaDurationMs) || mediaDurationMs <= 0) return null;
    const hasEnd = endOffsetMs !== undefined && endOffsetMs !== null && endOffsetMs !== '';
    const endMs = hasEnd ? Math.min(Number(endOffsetMs), mediaDurationMs) : mediaDurationMs;
    const ms = endMs - (Number(startOffsetMs) || 0);
    return Number.isFinite(ms) && ms > 0 ? ms : null;
}

export function formatRoundedDuration(ms) {
    if (!Number.isFinite(ms) || ms <= 0) return null;
    const totalSec = Math.max(STEP_MS, Math.round(ms / STEP_MS) * STEP_MS) / 1000;
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    if (min === 0) return `${sec}s`;
    if (sec === 0) return `${min}min`;
    return `${min}min${sec}`;
}
