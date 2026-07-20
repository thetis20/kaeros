import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {v4 as uuidv4} from 'uuid';
import useStep from '../Hook/useStep';
import ImageStep, {validate as validateImage} from './ImageStep';
import DubbingVideoStep, {validate as validateDubbingVideo} from "./DubbingVideoStep";
import TimeStep, {validate as validateTime} from "./TimeStep";
import BattleRoyalStep, {validate as validateBattleRoyal} from "./BattleRoyalStep";

const variantValidators = {
    'image': validateImage,
    'dubbing-video': validateDubbingVideo,
    'time': validateTime,
    'battle-royal': validateBattleRoyal,
}

function Step() {
    const {t} = useTranslation();
    const [value, setValue] = useStep({
        id: uuidv4(),
        name: "",
        type: "",
    })
    const [errors, setErrors] = useState({})

    function validate(value) {
        const errors = {};
        if (!value.name || !value.name.trim()) errors.name = t('step.form.error.name');
        if (!value.type) errors.type = t('step.form.error.type');
        const variantValidate = variantValidators[value.type];
        if (variantValidate) Object.assign(errors, variantValidate(value, t));
        return errors;
    }

    function onSubmit(e) {
        e.stopPropagation();
        e.preventDefault();

        const validationErrors = validate(value);
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});

        const response = {
            ...value
        }

        if (response.players) {
            response.players = response.players.split(';').map(x=>x.trim());
        }

        window.electronAPI.stepSave(response)
    }

    function onTypeChange(e) {
        setValue({
            id: value.id,
            name: value.name,
            type: e.target.value,
        })
        setErrors({})
    }

    return (
        <section style={{margin: 10}}>
            <h1>{t('step.form.title', {context: value.createdAt ? 'edition' : 'creation'})}</h1>
            <form onSubmit={onSubmit}>
                <div className='form-group'>
                    <label htmlFor="name" className="form-label">{t('step.form.name')}</label>
                    <input type="text" id="name" className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={value.name}
                           onChange={(e) => {
                               setValue({...value, name: e.target.value})
                               if (errors.name) setErrors({...errors, name: undefined})
                           }}/>
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                <div style={{marginBottom: 20}}>
                    <label htmlFor="type" className="form-label">{t('step.form.type.label')}</label>
                    <select className={`form-select ${errors.type ? 'is-invalid' : ''}`} id='type' value={value.type} onChange={onTypeChange}>
                        <option value=""></option>
                        <option value="image">{t('step.form.type.option.images')}</option>
                        <option value="dubbing-video">{t('step.form.type.option.dubbing-video')}</option>
                        <option value="time">{t('step.form.type.option.time')}</option>
                        <option value="battle-royal">{t('step.form.type.option.battle-royal')}</option>
                    </select>
                    {errors.type && <div className="invalid-feedback">{errors.type}</div>}
                </div>
                {value.type === 'image' && <ImageStep value={value} setValue={setValue} errors={errors} setErrors={setErrors}/>}
                {value.type === 'dubbing-video' && <DubbingVideoStep value={value} setValue={setValue} errors={errors} setErrors={setErrors}/>}
                {value.type === 'time' && <TimeStep value={value} setValue={setValue} errors={errors} setErrors={setErrors}/>}
                {value.type === 'battle-royal' && <BattleRoyalStep value={value} setValue={setValue} errors={errors} setErrors={setErrors}/>}
                <button style={{margin: '2em 0'}} type="submit"
                        className="btn btn-primary">{t('step.form.submit')}</button>
            </form>
        </section>
    );
}

export default Step;