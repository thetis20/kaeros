import React, { Fragment, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronBarLeft, ChevronBarRight, Dash, Pause, Play, Plus, Square, X } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import DUBBING_STATE from '../../../enum/DUBBING_STATE';
import { white } from '../../../enum/COLOR'

function ControllerDubbingDashboard({ dubbing }) {
  const { t } = useTranslation();

  function nextStep() {
    if (dubbing.state === DUBBING_STATE.PENDING) {
      electronAPI.dubbingOnChange({
        ...dubbing,
        state: DUBBING_STATE.PRESENTATION,
        paused: true
      })
    } else if (dubbing.state === DUBBING_STATE.PRESENTATION) {
      electronAPI.dubbingOnChange({
        ...dubbing,
        state: DUBBING_STATE.INTRODUCTION,
        paused: false
      })
    } else if (dubbing.state === DUBBING_STATE.INTRODUCTION) {
      electronAPI.dubbingOnChange({ ...dubbing, state: DUBBING_STATE.RUNNING })
    } else {
      toVideo(dubbing, dubbing.index + 1)
    }
  }

  function previousStep() {
    toVideo(dubbing, dubbing.index - 1)
  }

  function toVideo(dubbing, index) {
    if (index >= dubbing.videos.length || index < 0) {
      electronAPI.dubbingOnChange({ ...dubbing, index: 0, state: DUBBING_STATE.PENDING, paused: true })
    } else {
      electronAPI.dubbingOnChange({ ...dubbing, index, state: DUBBING_STATE.PRESENTATION, paused: true })
    }
  }

  function handlePlay() {
    if ([DUBBING_STATE.PENDING, DUBBING_STATE.PRESENTATION].includes(dubbing.state)) {
      nextStep()
    } else {
      electronAPI.dubbingOnChange({ ...dubbing, paused: false })
    }
  }

  function handlePause() {
    electronAPI.dubbingOnChange({ ...dubbing, paused: true })
  }

  const hasNext = dubbing.videos.length - 1 >= dubbing.index
  const hasPrevious = dubbing.state !== DUBBING_STATE.PENDING

  return (
    <Fragment>
      <div style={{ width: '100%', display: 'flex' }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {hasPrevious && <button
            style={{
              fontSize: 25,
              border: 'none',
              color: white,
              background: 'none'
            }}
            onClick={previousStep}><ChevronBarLeft /></button>}
        </div>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {dubbing.paused === true && <button
            style={{
              fontSize: 50,
              border: 'none',
              color: white,
              background: 'none'
            }}
            onClick={handlePlay}><Play /></button>}
          {dubbing.paused === false && <button
            style={{
              fontSize: 50,
              border: 'none',
              color: white,
              background: 'none'
            }}
            onClick={handlePause}><Pause /></button>}
        </div>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {hasNext && <button
            style={{
              fontSize: 25,
              border: 'none',
              color: white,
              background: 'none'
            }}
            onClick={nextStep}><ChevronBarRight /></button>}
        </div>
      </div>
      <ul className="list-group" style={{
        margin: '0 -1em',
        width: 280,
        borderRadius: 0,
        overflowY: 'auto'
      }}>
        <li
          style={{ cursor: 'pointer' }}
          onClick={() => toVideo(dubbing, -1)}
          className={'list-group-item ' + (dubbing.state === DUBBING_STATE.PENDING ? 'list-group-item-primary' : 'list-group-item-secondary')}
        >
          {t('dubbing.state.pending')}
        </li>
        {dubbing.videos.map((video, index) =>
          <li
            style={{ cursor: 'pointer' }}
            onClick={() => toVideo(dubbing, index)}
            className={'list-group-item ' + ((dubbing.state !== DUBBING_STATE.PENDING && dubbing.index === index) ? 'list-group-item-primary' : (dubbing.index <= index ? '' : 'list-group-item-secondary'))}
            key={index}
          >
            {video.name}
          </li>)}
      </ul>
    </Fragment >
  );
}

export default ControllerDubbingDashboard;
