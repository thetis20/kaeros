const ListTrackUseCase = require('../application/useCase/track/ListTrackUseCase.js');
const CreateTrackUseCase = require('../application/useCase/track/CreateTrackUseCase.js');
const UpdateTrackUseCase = require('../application/useCase/track/UpdateTrackUseCase.js');
const DeleteTrackUseCase = require('../application/useCase/track/DeleteTrackUseCase.js');

const CreateWorkflowUseCase = require('../application/useCase/workflow/CreateWorkflowUseCase.js');
const UpdateWorkflowUseCase = require('../application/useCase/workflow/UpdateWorkflowUseCase.js');
const DeleteWorkflowUseCase = require('../application/useCase/workflow/DeleteWorkflowUseCase.js');
const ListWorkflowUseCase = require('../application/useCase/workflow/ListWorkflowUseCase.js');

const CreateStepUseCase = require('../application/useCase/step/CreateStepUseCase.js');
const UpdateStepUseCase = require('../application/useCase/step/UpdateStepUseCase.js');
const DeleteStepUseCase = require('../application/useCase/step/DeleteStepUseCase.js');
const ListStepByWorkflowUseCase = require('../application/useCase/step/ListStepByWorkflowUseCase.js');

const CreateSessionUseCase = require('../application/useCase/session/CreateSessionUseCase.js');

const ListTagUseCase = require('../application/useCase/tag/ListTagUseCase.js');
const CreateTagUseCase = require('../application/useCase/tag/CreateTagUseCase.js');
const CleanTagUseCase = require('../application/useCase/tag/CleanTagUseCase.js');

const TrackStoreRespository = require('./repository/TrackStoreRepository.js');
const WorkflowStoreRespository = require('./repository/WorkflowStoreRepository.js');
const StepStoreRespository = require('./repository/StepStoreRepository.js');
const TagStoreRespository = require('./repository/TagStoreRepository.js');

const trackStoreRespository = new TrackStoreRespository();
const workflowStoreRespository = new WorkflowStoreRespository();
const stepStoreRespository = new StepStoreRespository();
const tagStoreRespository = new TagStoreRespository();

const listTagUseCase = new ListTagUseCase(tagStoreRespository);
const createTagUseCase = new CreateTagUseCase(tagStoreRespository);
const cleanTagUseCase = new CleanTagUseCase(tagStoreRespository, trackStoreRespository);

const listTrackUseCase = new ListTrackUseCase(trackStoreRespository);
const createTrackUseCase = new CreateTrackUseCase(trackStoreRespository);
const updateTrackUseCase = new UpdateTrackUseCase(trackStoreRespository);
const deleteTrackUseCase = new DeleteTrackUseCase(trackStoreRespository, cleanTagUseCase);

const createWorkflowUseCase = new CreateWorkflowUseCase(workflowStoreRespository);
const updateWorkflowUseCase = new UpdateWorkflowUseCase(workflowStoreRespository);
const deleteWorkflowUseCase = new DeleteWorkflowUseCase(workflowStoreRespository);
const listWorkflowUseCase = new ListWorkflowUseCase(workflowStoreRespository);

const createStepUseCase = new CreateStepUseCase(stepStoreRespository);
const updateStepUseCase = new UpdateStepUseCase(stepStoreRespository);
const deleteStepUseCase = new DeleteStepUseCase(stepStoreRespository);
const listStepByWorkflowUseCase = new ListStepByWorkflowUseCase(stepStoreRespository);

const createSessionUseCase = new CreateSessionUseCase(stepStoreRespository);


module.exports = {
    listTrackUseCase,
    createTrackUseCase,
    updateTrackUseCase,
    deleteTrackUseCase,

    createWorkflowUseCase,
    updateWorkflowUseCase,
    deleteWorkflowUseCase,
    listWorkflowUseCase,

    createStepUseCase,
    updateStepUseCase,
    deleteStepUseCase,
    listStepByWorkflowUseCase,

    createSessionUseCase,

    listTagUseCase,
    createTagUseCase
}
