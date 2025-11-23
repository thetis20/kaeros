import {Fragment} from 'react';
import {CameraReelsFill, ClockFill, Pen, Play, Trash} from 'react-bootstrap-icons';
import {useTranslation} from 'react-i18next';
import moment from 'moment';

function ImageStepItem({step}) {
    const updatedAt = moment(step.updatedAt);

    return <Fragment>
        <div style={{width: 32, height: 32, overflow: 'hidden'}} className='rounded'>
            <img src={'file://' + step.src} style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
            }} alt={step.name}/>
        </div>
        <div className="small border-bottom" style={{flex: 1, marginLeft: '.5em'}}>
            <strong className="text-gray-dark">{step.name}</strong>
            <span className="d-block">{updatedAt.fromNow()}</span>
        </div>
    </Fragment>
}

function DubbingVideoStepItem({step}) {
    const updatedAt = moment(step.updatedAt);

    return <Fragment>
        <div
            style={{
                width: 32,
                height: 32,
                overflow: 'hidden',
                fontSize: '1.2em',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'grey',
                color: 'white'
            }}
            className='rounded'
        >
            <CameraReelsFill/>
        </div>
        <div className="small border-bottom" style={{flex: 1, marginLeft: '.5em'}}>
            <strong className="text-gray-dark">{step.name}</strong>
            <span className="d-block">{updatedAt.fromNow()}</span>
        </div>
    </Fragment>
}

function TimeStepItem({step}) {
    const updatedAt = moment(step.updatedAt);

    return <Fragment>
        <div
            style={{
                width: 32,
                height: 32,
                overflow: 'hidden',
                fontSize: '1.2em',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'grey',
                color: 'white'
            }}
            className='rounded'
        >
            <ClockFill/>
        </div>
        <div className="small border-bottom" style={{flex: 1, marginLeft: '.5em'}}>
            <strong className="text-gray-dark">{step.name}</strong>
            <span className="d-block">{updatedAt.fromNow()}</span>
        </div>
    </Fragment>
}

function StepItem({workflowId, step}) {

    function edit() {
        window.electronAPI.stepOpen({workflowId, value: step})
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
        {step.type === 'image' && <ImageStepItem step={step}/>}
        {step.type === 'dubbing-video' && <DubbingVideoStepItem step={step}/>}
        {step.type === 'time' && <TimeStepItem step={step}/>}
        <div style={{display: 'flex', flexDirection: 'column'}}>
            <button onClick={edit} className='btn btn-link'><Pen/></button>
            <button onClick={remove} className='btn btn-link'><Trash/></button>
        </div>
    </div>
}

export default StepItem;