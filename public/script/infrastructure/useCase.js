const ListFolderUseCase = require('../application/useCase/folder/ListFolderUseCase.js');
const CreateFolderUseCase = require('../application/useCase/folder/CreateFolderUseCase.js');
const UpdateFolderUseCase = require('../application/useCase/folder/UpdateFolderUseCase.js');
const DeleteFolderUseCase = require('../application/useCase/folder/DeleteFolderUseCase.js');

const ListAudioByFolderUseCase = require('../application/useCase/audio/ListAudioByFolderUseCase.js');
const CreateAudioUseCase = require('../application/useCase/audio/CreateAudioUseCase.js');
const UpdateAudioUseCase = require('../application/useCase/audio/UpdateAudioUseCase.js');
const DeleteAudioUseCase = require('../application/useCase/audio/DeleteAudioUseCase.js');

const CreateWorkflowUseCase = require('../application/useCase/workflow/CreateWorkflowUseCase.js');
const UpdateWorkflowUseCase = require('../application/useCase/workflow/UpdateWorkflowUseCase.js');
const DeleteWorkflowUseCase = require('../application/useCase/workflow/DeleteWorkflowUseCase.js');
const ListWorkflowUseCase = require('../application/useCase/workflow/ListWorkflowUseCase.js');

const CreateStepUseCase = require('../application/useCase/step/CreateStepUseCase.js');
const UpdateStepUseCase = require('../application/useCase/step/UpdateStepUseCase.js');
const DeleteStepUseCase = require('../application/useCase/step/DeleteStepUseCase.js');
const ListStepByWorkflowUseCase = require('../application/useCase/step/ListStepByWorkflowUseCase.js');

const FolderStoreRespository = require('./repository/FolderStoreRepository.js');
const AudioStoreRespository = require('./repository/AudioStoreRepository.js');
const WorkflowStoreRespository = require('./repository/WorkflowStoreRepository.js');
const StepStoreRespository = require('./repository/StepStoreRepository.js');

const folderStoreRespository = new FolderStoreRespository();
const audioStoreRespository = new AudioStoreRespository();
const workflowStoreRespository = new WorkflowStoreRespository();
const stepStoreRespository = new StepStoreRespository();

const listFolderUseCase = new ListFolderUseCase(folderStoreRespository);
const createFolderUseCase = new CreateFolderUseCase(folderStoreRespository);
const updateFolderUseCase = new UpdateFolderUseCase(folderStoreRespository);
const deleteFolderUseCase = new DeleteFolderUseCase(folderStoreRespository);

const createAudioUseCase = new CreateAudioUseCase(audioStoreRespository);
const updateAudioUseCase = new UpdateAudioUseCase(audioStoreRespository);
const deleteAudioUseCase = new DeleteAudioUseCase(audioStoreRespository);
const listAudioByFolderUseCase = new ListAudioByFolderUseCase(audioStoreRespository);

const createWorkflowUseCase = new CreateWorkflowUseCase(workflowStoreRespository);
const updateWorkflowUseCase = new UpdateWorkflowUseCase(workflowStoreRespository);
const deleteWorkflowUseCase = new DeleteWorkflowUseCase(workflowStoreRespository);
const listWorkflowUseCase = new ListWorkflowUseCase(workflowStoreRespository);

const createStepUseCase = new CreateStepUseCase(stepStoreRespository);
const updateStepUseCase = new UpdateStepUseCase(stepStoreRespository);
const deleteStepUseCase = new DeleteStepUseCase(stepStoreRespository);
const listStepByWorkflowUseCase = new ListStepByWorkflowUseCase(stepStoreRespository);


module.exports = {
    listFolderUseCase,
    createFolderUseCase,
    updateFolderUseCase,
    deleteFolderUseCase,

    listAudioByFolderUseCase,
    createAudioUseCase,
    updateAudioUseCase,
    deleteAudioUseCase,

    createWorkflowUseCase,
    updateWorkflowUseCase,
    deleteWorkflowUseCase,
    listWorkflowUseCase,

    createStepUseCase,
    updateStepUseCase,
    deleteStepUseCase,
    listStepByWorkflowUseCase,
}