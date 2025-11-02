import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

function Folder() {
    const { t } = useTranslation();
    const [value, setValue] = useState({
        id: uuidv4(),
        name: "",
        color: "#ffffff",
    })

    function handleChange(e) {
        setValue(e.detail)
    }

    useEffect(() => {
        document.addEventListener('folder-onchange', handleChange);
        return () => {
            document.removeEventListener('folder-onchange', handleChange);
        }
    }, []);

    function onSubmit(e) {
        e.stopPropagation();
        e.preventDefault();
        window.electronAPI.folderSave(value)
    }

    return (
        <section style={{ margin: 10 }}>
            <h1>{t('folder.form.title', { context: value.createdAt ? 'edition' : 'creation' })}</h1>
            <form onSubmit={onSubmit}>
                <div style={{ marginBottom: 20 }}>
                    <label htmlFor="name" className="form-label">{t('folder.form.name')}</label>
                    <input type="text" id="name" className="form-control" value={value.name} onChange={(e) => setValue({ ...value, name: e.target.value })} />
                </div>
                <div style={{ marginBottom: 20 }}>
                    <label htmlFor="color" className="form-label">{t('folder.form.color')}</label>
                    <input type="color" className="form-control form-control-color" id="color" value={value.color} onChange={(e) => setValue({ ...value, color: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary">{t('folder.form.submit')}</button>
            </form>
        </section>
    );
}

export default Folder;