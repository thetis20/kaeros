const ImageStep = require('./ImageStep')

class StepFactory {

    static fromData(data) {
        switch (data.type) {
            case 'image':
                return new ImageStep(data.id, data.name, data.src, data.createdAt, data.updatedAt)
        }
    }

}

module.exports = StepFactory