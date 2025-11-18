import { Fragment } from 'react';
import { Pen, Play, Trash } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

function ImageStepItem({ workflowId, step }) {
    const updatedAt = moment(step.updatedAt);

    return <Fragment>
        <div style={{ width: 32, height: 32, overflow: 'hidden' }} className='rounded'>
            <img src={'file://' + step.src} style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
            }} />
        </div>
        <div className="small border-bottom" style={{ flex: 1, marginLeft: '.5em' }}>
            <strong className="text-gray-dark" >{step.name}</strong>
            <span className="d-block">{updatedAt.fromNow()}</span>
        </div>
    </Fragment>
}

function StepItem({ workflowId, step }) {

    function edit() {
        window.electronAPI.stepOpen({ workflowId, value: step })
    }

    function remove() {
        window.electronAPI.stepRemove(workflowId, step.id)
    }

    return <div
        style={{
            display: 'flex',
            paddingTop: '.75em',
            width: '100%',
            alignItems: 'center'
        }}
    >
        {step.type === 'image' && <ImageStepItem step={step} />}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button onClick={edit} className='btn btn-link'><Pen /></button>
            <button onClick={remove} className='btn btn-link'><Trash /></button>
        </div>
    </div>
}

export default StepItem;