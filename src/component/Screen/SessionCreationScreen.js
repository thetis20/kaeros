import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {v4 as uuidv4} from 'uuid';
import {IconChevronUp, IconChevronDown, IconEdit, IconTrash, IconPhoto, IconMovie, IconClock, IconShield} from '@tabler/icons-react';
import useWorkflows from '../Hook/useWorkflows';
import useSteps from '../Hook/useSteps';
import ImageStep, {validate as validateImage} from '../Step/ImageStep';
import DubbingVideoStep, {validate as validateDubbingVideo} from '../Step/DubbingVideoStep';
import TimeStep, {validate as validateTime} from '../Step/TimeStep';
import BattleRoyalStep, {validate as validateBattleRoyal} from '../Step/BattleRoyalStep';

const STEP_TYPES = ['image', 'dubbing-video', 'time', 'battle-royal'];

const stepIcons = {
    image: IconPhoto,
    'dubbing-video': IconMovie,
    time: IconClock,
    'battle-royal': IconShield,
};

const variantComponents = {
    image: ImageStep,
    'dubbing-video': DubbingVideoStep,
    time: TimeStep,
    'battle-royal': BattleRoyalStep,
};

const variantValidators = {
    image: validateImage,
    'dubbing-video': validateDubbingVideo,
    time: validateTime,
    'battle-royal': validateBattleRoyal,
};

// NOTE: the existing translation file spells the image option key "images" (plural) — see
// `step.form.type.option.images` in translation.fr.json, already relied on verbatim by Step.js's
// <option> list. Every other type key matches its internal type string exactly. This map absorbs
// that one irregularity instead of deriving the key from `step.type` with a template string.
const stepTypeLabelKeys = {
    image: 'step.form.type.option.images',
    'dubbing-video': 'step.form.type.option.dubbing-video',
    time: 'step.form.type.option.time',
    'battle-royal': 'step.form.type.option.battle-royal',
};

const colorPalette = ['#378ADD', '#D85A30', '#1D9E75', '#7F77DD', '#D4537E', '#BA7517'];

function randomColor() {
    return colorPalette[Math.floor(Math.random() * colorPalette.length)];
}

function hydrateStepForEditing(step) {
    const hydrated = {...step, open: false};
    if (Array.isArray(hydrated.players)) {
        hydrated.players = hydrated.players.join('; ');
    }
    return hydrated;
}

function newStep(type, t) {
    const base = {id: uuidv4(), type, name: t(`sessionCreation.newStepName.${type}`), open: false};
    if (type === 'dubbing-video') return {...base, time: '', description: ''};
    if (type === 'time') return {...base, impro: '1', minutes: '2'};
    if (type === 'battle-royal') return {...base, players: ''};
    return base;
}

function SessionCreationScreen({workflowId, onDone}) {
    const {t} = useTranslation();
    const workflows = useWorkflows();
    const fetchedSteps = useSteps(workflowId);
    const [name, setName] = useState('');
    const [color, setColor] = useState(() => workflowId === null ? randomColor() : null);
    const [steps, setSteps] = useState([]);
    const [errorsByStepId, setErrorsByStepId] = useState({});
    const [nameError, setNameError] = useState(null);
    const nameLoadedRef = useRef(false);
    const stepsLoadedRef = useRef(false);
    const existingWorkflowRef = useRef(null);

    useEffect(() => {
        if (workflowId === null) return;
        const workflow = workflows.find(w => w.id === workflowId);
        if (workflow && !nameLoadedRef.current) {
            existingWorkflowRef.current = workflow;
            setName(workflow.name);
            setColor(workflow.color);
            nameLoadedRef.current = true;
        }
    }, [workflowId, workflows]);

    useEffect(() => {
        if (workflowId === null) return;
        if (fetchedSteps.length > 0 && !stepsLoadedRef.current) {
            setSteps(fetchedSteps.map(hydrateStepForEditing));
            stepsLoadedRef.current = true;
        }
    }, [workflowId, fetchedSteps]);

    function updateStep(index, nextValue) {
        setSteps(current => current.map((step, i) => i === index ? nextValue : step));
    }

    function addStep(type) {
        setSteps(current => [...current, newStep(type, t)]);
    }

    function removeStep(index) {
        const removedId = steps[index].id;
        setSteps(current => current.filter((_, i) => i !== index));
        setErrorsByStepId(current => {
            const next = {...current};
            delete next[removedId];
            return next;
        });
    }

    function moveUp(index) {
        if (index === 0) return;
        setSteps(current => {
            const next = [...current];
            [next[index - 1], next[index]] = [next[index], next[index - 1]];
            return next;
        });
    }

    function moveDown(index) {
        setSteps(current => {
            if (index >= current.length - 1) return current;
            const next = [...current];
            [next[index + 1], next[index]] = [next[index], next[index + 1]];
            return next;
        });
    }

    function toggleOpen(index) {
        updateStep(index, {...steps[index], open: !steps[index].open});
    }

    function validateStep(step) {
        const errors = {};
        if (!step.name || !step.name.trim()) errors.name = t('step.form.error.name');
        const variantValidate = variantValidators[step.type];
        if (variantValidate) Object.assign(errors, variantValidate(step, t));
        return errors;
    }

    function handleSave() {
        const nameIsInvalid = !name || !name.trim();
        setNameError(nameIsInvalid ? t('workflow.form.error.name') : null);

        const nextErrorsByStepId = {};
        let hasErrors = false;
        steps.forEach(step => {
            const errors = validateStep(step);
            if (Object.keys(errors).length) {
                nextErrorsByStepId[step.id] = errors;
                hasErrors = true;
            }
        });
        setErrorsByStepId(nextErrorsByStepId);
        if (hasErrors) {
            setSteps(current => current.map(step => nextErrorsByStepId[step.id] ? {...step, open: true} : step));
        }
        if (nameIsInvalid || hasErrors) return;

        const workflowIdToSave = workflowId === null ? uuidv4() : workflowId;
        const workflowPayload = workflowId === null
            ? {id: workflowIdToSave, name, color: color || randomColor()}
            : {...(existingWorkflowRef.current || {id: workflowId}), name, color};
        window.electronAPI.workflowSave(workflowPayload);

        fetchedSteps.forEach(existing => {
            window.electronAPI.stepRemove(workflowIdToSave, existing.id);
        });

        steps.forEach((step, index) => {
            const payload = {...step};
            delete payload.open;
            delete payload.createdAt;
            delete payload.updatedAt;
            if (payload.players !== undefined) {
                payload.players = payload.players.split(';').map(x => x.trim());
            }
            window.electronAPI.stepSave({
                workflowId: workflowIdToSave,
                value: payload,
                afterIndex: index === 0 ? undefined : index - 1,
            });
        });

        onDone();
    }

    return (
        <div className="content">
            <p className="screen-title">{t(workflowId === null ? 'sessionCreation.title' : 'sessionCreation.titleEdit')}</p>
            <p className="screen-sub">{t('sessionCreation.subtitle')}</p>
            <div style={{marginBottom: 20}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                    <input
                        type="text"
                        aria-label={t('playlist.form.name')}
                        style={{flex: 1, fontWeight: 500}}
                        className={nameError ? 'is-invalid' : undefined}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <button className="btn btn-accent-solid" onClick={handleSave}>
                        {t('sessionCreation.save')}
                    </button>
                </div>
                {nameError && <div className="invalid-feedback" style={{display: 'block'}}>{nameError}</div>}
            </div>
            <div style={{marginBottom: 16}}>
                {steps.map((step, index) => {
                    const Icon = stepIcons[step.type];
                    const Variant = variantComponents[step.type];
                    const errors = errorsByStepId[step.id] || {};
                    return (
                        <div key={step.id} className="accordion-item">
                            <div className="accordion-header">
                                <span>{index + 1}</span>
                                <Icon/>
                                <span style={{flex: 1}}>{step.name}</span>
                                <span>{t(stepTypeLabelKeys[step.type])}</span>
                                <button className="btn btn-icon" aria-label={t('sessionCreation.up')} onClick={() => moveUp(index)} disabled={index === 0}><IconChevronUp/></button>
                                <button className="btn btn-icon" aria-label={t('sessionCreation.down')} onClick={() => moveDown(index)} disabled={index === steps.length - 1}><IconChevronDown/></button>
                                <button className="btn btn-icon" aria-label={t('sessionCreation.editToggle')} onClick={() => toggleOpen(index)}><IconEdit/></button>
                                <button className="btn btn-icon" aria-label={t('sessionCreation.delete')} onClick={() => removeStep(index)}><IconTrash/></button>
                            </div>
                            {step.open && (
                                <div className="accordion-body">
                                    <div style={{marginBottom: 10}}>
                                        <label htmlFor={`creation-step-name-${step.id}`} className="field-label">{t('step.form.name')}</label>
                                        <input
                                            id={`creation-step-name-${step.id}`}
                                            type="text"
                                            className={errors.name ? 'is-invalid' : undefined}
                                            value={step.name}
                                            onChange={(e) => updateStep(index, {...step, name: e.target.value})}
                                        />
                                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                    </div>
                                    <Variant
                                        value={step}
                                        setValue={(nextValue) => updateStep(index, nextValue)}
                                        errors={errors}
                                        setErrors={(nextErrors) => setErrorsByStepId(current => ({...current, [step.id]: nextErrors}))}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center'}}>
                <span>{t('sessionCreation.add')}</span>
                {STEP_TYPES.map(type => {
                    const Icon = stepIcons[type];
                    return (
                        <button key={type} className="btn btn-sm" onClick={() => addStep(type)}>
                            <Icon style={{marginRight: '.5em'}}/>
                            {t(stepTypeLabelKeys[type])}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default SessionCreationScreen;
