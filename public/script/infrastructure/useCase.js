const fs = require('fs');
const path = require('path');
const {spawn} = require('child_process');
const {app, shell} = require('electron');

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

const CheckMediaFilesUseCase = require('../application/useCase/media/CheckMediaFilesUseCase.js');
const CheckWorkflowMediaUseCase = require('../application/useCase/media/CheckWorkflowMediaUseCase.js');

const ExportWorkflowUseCase = require('../application/useCase/workflow/ExportWorkflowUseCase.js');
const ImportWorkflowUseCase = require('../application/useCase/workflow/ImportWorkflowUseCase.js');

const UninstallAppUseCase = require('../application/useCase/app/UninstallAppUseCase.js');

const store = require('./repository/store.js');

const ArchiverZipWriter = require('./zip/ArchiverZipWriter.js');
const ExtractZipReader = require('./zip/ExtractZipReader.js');

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

const checkMediaFilesUseCase = new CheckMediaFilesUseCase();
const checkWorkflowMediaUseCase = new CheckWorkflowMediaUseCase(listStepByWorkflowUseCase, listTrackUseCase, checkMediaFilesUseCase);

const exportWorkflowUseCase = new ExportWorkflowUseCase(
    listWorkflowUseCase,
    listStepByWorkflowUseCase,
    checkMediaFilesUseCase,
    new ArchiverZipWriter(),
    () => app.getVersion()
);
const importWorkflowUseCase = new ImportWorkflowUseCase(
    new ExtractZipReader(),
    createWorkflowUseCase,
    createStepUseCase,
    deleteWorkflowUseCase,
    (workflowId) => path.join(app.getPath('userData'), 'media', workflowId)
);
const uninstallAppUseCase = new UninstallAppUseCase(
    () => store.clear(),
    () => fs.promises.rm(path.join(app.getPath('userData'), 'media'), {recursive: true, force: true}),
    process.platform,
    app.isPackaged,
    process.platform === 'darwin' ? path.resolve(app.getAppPath(), '../../..') : null,
    (itemPath) => shell.trashItem(itemPath),
    () => {
        const uninstaller = path.join(path.dirname(process.execPath), 'Uninstall Kaeros.exe');
        spawn(uninstaller, [], {detached: true, stdio: 'ignore'}).unref();
    }
);

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
    createTagUseCase,

    checkMediaFilesUseCase,
    checkWorkflowMediaUseCase,

    exportWorkflowUseCase,
    importWorkflowUseCase,

    uninstallAppUseCase
}
