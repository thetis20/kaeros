import React, {useState} from 'react';
import { ArrowLeft, ArrowRight, Dash, Pause, Play, Plus, X } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import DUBBING_STATE from '../../../enum/DUBBING_STATE';

function ControllerDubbingDashboard({dubbing}) {
  const { t } = useTranslation();

  function close(){
      electronAPI.dubbingOnChange()
  }

  function next(){
      electronAPI.dubbingOnChange({
        ...dubbing,
        state: DUBBING_STATE.PRESENTATION,
        index: dubbing.index + 1 > dubbing.videos.length ? dubbing.videos.length : dubbing.index + 1
      })
  }

  function previous(){
      electronAPI.dubbingOnChange({
        ...dubbing,
        state: DUBBING_STATE.PRESENTATION,
        index: dubbing.index - 1 > 0 ? dubbing.index - 1 : 0
      })
  }

  function handlePlay(){
    if(time.state === DUBBING_STATE.PENDING){
      electronAPI.dubbingOnChange({...dubbing, paused: true, state: TIME_STATE.PRESENTATION})
    }else{
      electronAPI.dubbingOnChange({...dubbing, paused: false})
    }
  }

  function handlePause(){
      electronAPI.dubbingOnChange({...dubbing, paused: true})
  }

  function getItemClassName(state, index){

    const className = ['list-group-item']
    if(dubbing.state === state){
      className.push('list-group-item-primary')
    }else if(state === DUBBING_STATE.PENDING && [DUBBING_STATE.PRESENTATION,DUBBING_STATE.INTRODUCTION, DUBBING_STATE.RUNNING].includes(dubbing.state)){
      className.push('list-group-item-secondary')
    }else if(index < dubbing.index){
      className.push('list-group-item-secondary')
    }else if(index === dubbing.index && (
      (state === DUBBING_STATE.PRESENTATION && [DUBBING_STATE.INTRODUCTION, DUBBING_STATE.RUNNING].includes(dubbing.state)) ||
      (state === DUBBING_STATE.INTRODUCTION && DUBBING_STATE.RUNNING === dubbing.state)
    )){
      className.push('list-group-item-secondary')
    }
    return className.join(' ')
  }

  return (
      <section className="d-flex gap-4 p-4">
        <ul className="list-group">
          <li className={getItemClassName(DUBBING_STATE.PENDING)}>{t('dubbing.state.pending')}</li>
          {dubbing.videos.map((video, index)=><React.Fragment key={index}>
          <li className={getItemClassName(DUBBING_STATE.PRESENTATION)}>{video.title} {t('dubbing.state.presentation')}</li>
          <li className={getItemClassName(DUBBING_STATE.INTRODUCTION)}>{video.title} {t('dubbing.state.presentation')}</li>
          <li className={getItemClassName(DUBBING_STATE.RUNNING)}>{video.title} {t('dubbing.state.running')}</li>
          </React.Fragment>)}
        </ul>
        <div className="btn-group-vertical">
          {dubbing.paused === true && <button type="button" onClick={handlePlay} className="btn btn-primary d-flex align-items-center justify-content-between"><span>{t('dubbing.controller.play')}</span><Play/></button>}
          {dubbing.paused === false && <button type="button" onClick={handlePause} className="btn btn-primary d-flex align-items-center justify-content-between">{t('dubbing.controller.pause')}<Pause/></button>}
          <button type="button" onClick={close} className="btn btn-danger d-flex align-items-center justify-content-between">{t('dubbing.controller.close')}<X/></button>
        </div>
      </section>
  );
}

export default ControllerDubbingDashboard;
