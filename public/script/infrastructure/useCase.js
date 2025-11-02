const ListFolderUseCase = require('../application/useCase/folder/ListFolderUseCase.js');
const CreateFolderUseCase = require('../application/useCase/folder/CreateFolderUseCase.js');
const UpdateFolderUseCase = require('../application/useCase/folder/UpdateFolderUseCase.js');
const DeleteFolderUseCase = require('../application/useCase/folder/DeleteFolderUseCase.js');

const ListAudioByFolderUseCase = require('../application/useCase/audio/ListAudioByFolderUseCase.js');
const CreateAudioUseCase = require('../application/useCase/audio/CreateAudioUseCase.js');
const UpdateAudioUseCase = require('../application/useCase/audio/UpdateAudioUseCase.js');
const DeleteAudioUseCase = require('../application/useCase/audio/DeleteAudioUseCase.js');

const FolderStoreRespository = require('./repository/FolderStoreRepository.js');
const AudioStoreRespository = require('./repository/AudioStoreRepository.js');

const folderStoreRespository = new FolderStoreRespository();
const audioStoreRespository = new AudioStoreRespository();

const listFolderUseCase = new ListFolderUseCase(folderStoreRespository);
const createFolderUseCase = new CreateFolderUseCase(folderStoreRespository);
const updateFolderUseCase = new UpdateFolderUseCase(folderStoreRespository);
const deleteFolderUseCase = new DeleteFolderUseCase(folderStoreRespository);

const createAudioUseCase = new CreateAudioUseCase(audioStoreRespository);
const updateAudioUseCase = new UpdateAudioUseCase(audioStoreRespository);
const deleteAudioUseCase = new DeleteAudioUseCase(audioStoreRespository);
const listAudioByFolderUseCase = new ListAudioByFolderUseCase(audioStoreRespository);


module.exports = {
    listFolderUseCase,
    createFolderUseCase,
    updateFolderUseCase,
    deleteFolderUseCase,

    listAudioByFolderUseCase,
    createAudioUseCase,
    updateAudioUseCase,
    deleteAudioUseCase,
}