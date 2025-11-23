const ImageStep = require('./ImageStep')
const DubbingVideoStep = require("./DubbingVideoStep");
const TimeStep = require("./TimeStep");

class StepFactory {

    static fromData(data) {
        switch (data.type) {
            case 'image':
                return new ImageStep(data.id, data.name, data.src, data.createdAt, data.updatedAt)
            case 'dubbing-video':
                return new DubbingVideoStep(data.id, data.name, data.src, data.description, data.time, data.createdAt, data.updatedAt)
            case 'time':
                return new TimeStep(data.id, data.name, data.impro, data.minutes, data.createdAt, data.updatedAt)
        }
    }

}

module.exports = StepFactory