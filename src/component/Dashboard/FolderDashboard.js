import { useState, useEffect, Fragment } from 'react';
import { ChevronLeft, Pen, Trash } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import AudioDashboard from './AudioDashboard';

function Item({ folder, onSelect }) {
    const { t } = useTranslation();

    return <li style={{
        width: 150,
        height: 150,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        cursor: 'pointer',
        backgroundColor: folder.color
    }} onClick={() => onSelect(folder.id)}>
        <h6>{folder.name}</h6>
    </li>
}

function FolderDashboard() {
    const { t } = useTranslation();
    const [folders, setFolders] = useState([])
    const [selectedId, select] = useState(null)
    const selectedFolder = folders.find(folder => folder.id === selectedId) || null

    function handleFolder(event) {
        setFolders(event.detail)
    }

    useEffect(() => {
        window.electronAPI.folderFetch()
        document.addEventListener('folder-onchange', handleFolder);
        return () => {
            document.removeEventListener('folder-onchange', handleFolder);
        }
    }, []);

    function create() {
        window.electronAPI.folderOpen()
    }

    function remove() {
        window.electronAPI.folderRemove(selectedFolder.id)
        select(null)
    }

    function edit() {
        window.electronAPI.folderOpen(selectedFolder)
    }

    return (
        <div style={{ padding: '1em' }}>
            <h1>{t('folder.name')}</h1>
            {selectedFolder === null ?
                <Fragment>
                    <button className="btn btn-primary" onClick={create}>{t('folder.create')}</button>
                    <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        gap: 30,
                        display: 'flex',
                        flexWrap: 'wrap',
                        marginTop: 30
                    }}>
                        {folders.map((folder) => <Item key={folder.id} folder={folder} onSelect={select} />)}
                    </ul>
                </Fragment> :
                <Fragment>
                    <h2 style={{ color: selectedFolder.color }}>{selectedFolder.name}</h2>
                    <div style={{ display: 'flex', gap: '1em', justifyContent: 'space-between' }}>
                        <button className="btn btn-secondary" onClick={() => select(null)}>
                            <ChevronLeft style={{ marginRight: '.5em' }} />
                            {t('folder.back')}
                        </button>
                        <button className="btn btn-danger" onClick={remove}>
                            <Trash style={{ marginRight: '.5em' }} />
                            {t('folder.remove')}
                        </button>
                        <button className="btn btn-primary" onClick={edit}>
                            <Pen style={{ marginRight: '.5em' }} />
                            {t('folder.edit')}
                        </button>
                    </div>
                    <AudioDashboard folderId={selectedFolder.id} />
                </Fragment>}
        </div >
    );
}

export default FolderDashboard;
