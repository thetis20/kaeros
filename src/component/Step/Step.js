import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import useStep from '../Hook/useStep';
import ImageStep from './ImageStep';

function Step() {
    const { t } = useTranslation();
    const [value, setValue] = useStep({
        id: uuidv4(),
        name: "",
        type: "",
    })

    function onSubmit(e) {
        e.stopPropagation();
        e.preventDefault();
        window.electronAPI.stepSave(value)
    }

    function onTypeChange(e) {
        setValue({
            id: value.id,
            name: value.name,
            type: e.target.value,
        })
    }

    return (
        <section style={{ margin: 10 }}>
            <h1>{t('step.form.title', { context: value.createdAt ? 'edition' : 'creation' })}</h1>
            <form onSubmit={onSubmit}>
                <div className='form-group'>
                    <label htmlFor="name" className="form-label">{t('step.form.name')}</label>
                    <input type="text" id="name" className="form-control" value={value.name} onChange={(e) => setValue({ ...value, name: e.target.value })} />
                </div>
                <div style={{ marginBottom: 20 }}>
                    <label htmlFor="type" className="form-label">{t('step.form.type.label')}</label>
                    <select className="form-select" id='type' value={value.type} onChange={onTypeChange}>
                        <option value=""></option>
                        <option value="image">{t('step.form.type.option.images')}</option>
                        <option value="dubbingVideo">{t('step.form.type.option.dubbingVideo')}</option>
                    </select>
                </div>
                {value.type === 'image' && <ImageStep value={value} setValue={setValue} />}
                <button style={{ marginTop: 30 }} type="submit" className="btn btn-primary">{t('step.form.submit')}</button>
            </form>
        </section>
    );
}

export default Step;