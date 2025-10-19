import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Dash, Pause, Play, Plus, X } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import DUBBING_STATE from '../../../enum/DUBBING_STATE';

function ControllerDubbingDashboard({ dubbing }) {
  const { t } = useTranslation();

  function close() {
    electronAPI.dubbingOnChange()
  }

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

  return (
    <section style={{ display: 'flex', gap: 20, padding: 20, alignItems: 'start' }}>
      <ul className="list-group">
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
            {video.title}
          </li>)}
      </ul>
      <div className="btn-group-vertical">
        {dubbing.paused === true && <button type="button" onClick={handlePlay} className="btn btn-primary d-flex align-items-center justify-content-between"><span>{t('dubbing.controller.play')}</span><Play /></button>}
        {dubbing.paused === false && <button type="button" onClick={handlePause} className="btn btn-primary d-flex align-items-center justify-content-between">{t('dubbing.controller.pause')}<Pause /></button>}
        <button type="button" onClick={close} className="btn btn-danger d-flex align-items-center justify-content-between">{t('dubbing.controller.close')}<X /></button>
      </div>
    </section >
  );
}

export default ControllerDubbingDashboard;
