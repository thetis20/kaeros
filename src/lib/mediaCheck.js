import {probeAll} from './mediaProbe';

export const MEDIA_ERROR_CODES = [
    'no-source',
    'missing',
    'unreadable',
    'not-a-file',
    'empty',
    'decode-failed',
    'timeout',
    'check-failed',
];

const MEDIA_STEP_TYPES = ['image', 'video', 'dubbing-video'];

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'avif'];
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'];

export function messageKeyFor(code) {
    return `mediaCheck.error.${code}`;
}

export function hasIssues(results) {
    return results.some((result) => result.code !== 'ok');
}

function extensionOf(name) {
    if (!name) return '';
    const match = /\.([^./]+)$/.exec(name);
    return match ? match[1].toLowerCase() : '';
}

// Best-effort guess of which kind of <element> should decode this entry when the
// caller (mediaCheckWorkflow) didn't hand us a step type directly - it only knows
// 'step' vs 'audio'. Falls back to 'video', the safest default for unknown step media.
function probeTypeFor(entry) {
    if (entry.type === 'image') return 'image';
    if (entry.type === 'audio') return 'audio';
    if (entry.type === 'video' || entry.type === 'dubbing-video') return 'video';
    if (entry.kind === 'audio') return 'audio';

    const ext = extensionOf(entry.src || entry.file?.name);
    if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
    if (AUDIO_EXTENSIONS.includes(ext)) return 'audio';
    return 'video';
}

export async function checkWorkflowMedia(workflowId) {
    const entries = await window.electronAPI.mediaCheckWorkflow(workflowId);

    const toProbe = entries
        .filter((entry) => entry.code === 'ok')
        .map((entry) => ({...entry, type: probeTypeFor(entry)}));

    const probed = await probeAll(toProbe);
    const probedById = new Map(probed.map((result) => [result.id, result]));

    return entries.map((entry) => probedById.get(entry.id) || entry);
}

export async function checkLocalSteps(steps) {
    const mediaSteps = steps.filter((step) => MEDIA_STEP_TYPES.includes(step.type));
    const stepsWithoutFile = mediaSteps.filter((step) => !step.file);

    let diskResults = [];
    if (stepsWithoutFile.length > 0) {
        const items = stepsWithoutFile.map((step) => ({id: step.id, src: step.src}));
        diskResults = await window.electronAPI.mediaCheckPaths(items);
    }
    const diskCodeById = new Map(diskResults.map((result) => [result.id, result.code]));

    const candidates = mediaSteps.map((step) => ({
        id: step.id,
        stepId: step.id,
        name: step.name,
        src: step.src,
        file: step.file,
        type: step.type,
        code: step.file ? 'ok' : (diskCodeById.get(step.id) || 'missing'),
    }));

    const toProbe = candidates.filter((candidate) => candidate.code === 'ok');
    const probed = await probeAll(toProbe);
    const probedCodeById = new Map(probed.map((result) => [result.id, result.code]));

    return candidates.map((candidate) => ({
        id: candidate.id,
        stepId: candidate.stepId,
        name: candidate.name,
        src: candidate.src,
        code: probedCodeById.get(candidate.id) || candidate.code,
        type: candidate.type,
    }));
}