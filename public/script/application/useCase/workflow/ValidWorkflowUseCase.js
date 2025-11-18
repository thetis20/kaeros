const Workflow = require("../../entity/Workflow");

class ValidAudioUseCase {

    /**
     * @param {Workflow} workflow
     * @return {Workflow}
     */
    execute(workflow) {
        if (!workflow.name || typeof workflow.name !== 'string') {
            throw new Error('Invalid workflow name');
        }
        if (!workflow.color || typeof workflow.color !== 'string') {
            throw new Error('Invalid workflow color');
        }

        return workflow
    }
}

module.exports = ValidAudioUseCase