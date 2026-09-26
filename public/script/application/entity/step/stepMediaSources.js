const MEDIA_TYPES = ['image', 'video', 'dubbing-video'];

/**
 * @param {import('./Step')} step
 * @returns {{id: string, kind: 'step', stepId: string, name: string, src: string}[]}
 */
function sourcesFromStep(step) {
    if (!step || !MEDIA_TYPES.includes(step.type)) {
        return [];
    }

    return [{
        id: step.id,
        kind: 'step',
        stepId: step.id,
        name: step.name,
        src: step.src,
    }];
}

module.exports = {sourcesFromStep};