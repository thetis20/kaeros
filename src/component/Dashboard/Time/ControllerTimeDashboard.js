import React, {useState} from 'react';
import { ArrowLeft, ArrowRight, Dash, Pause, Play, Plus, X } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import TIME_STATE from '../../../enum/TIME_STATE';

function ControllerTimeDashboard({time}) {
  const { t } = useTranslation();

  function close(){
      electronAPI.timeOnChange()
  }

  function increment(){
      electronAPI.timeOnChange({...time, number: time.number + 1})
  }

  function decrement(){
      electronAPI.timeOnChange({...time, number: time.number - 1})
  }

  function handlePlay(){
    if(time.state === TIME_STATE.PENDING){
      electronAPI.timeOnChange({...time, paused: false, state: TIME_STATE.PRESENTATION})
    }else{
      electronAPI.timeOnChange({...time, paused: false})
    }
  }

  function handlePause(){
      electronAPI.timeOnChange({...time, paused: true})
  }

  function getItemClassName(state){

    const className = ['list-group-item']
    if(time.state === state){
      className.push('list-group-item-primary')
    }else if(
      (state === TIME_STATE.PENDING && [TIME_STATE.PRESENTATION, TIME_STATE.RUNNING].includes(time.state)) ||
      (state === TIME_STATE.PRESENTATION && TIME_STATE.RUNNING === time.state)
    ){
      className.push('list-group-item-secondary')
    }
    return className.join(' ')
  }

  return (
      <section className="d-flex gap-4 p-4">
        <ul className="list-group">
          <li className={getItemClassName(TIME_STATE.PENDING)}>{t('time.state.pending')}</li>
          <li className={getItemClassName(TIME_STATE.PRESENTATION)}>{t('time.state.presentation')}</li>
          <li className={getItemClassName(TIME_STATE.RUNNING)}>{t('time.state.running')}</li>
        </ul>
        <div className="btn-group-vertical">
          {time.paused === true && <button type="button" onClick={handlePlay} className="btn btn-primary d-flex align-items-center justify-content-between"><span>{t('time.controller.play')}</span><Play/></button>}
          {time.paused === false && <button type="button" onClick={handlePause} className="btn btn-primary d-flex align-items-center justify-content-between">{t('time.controller.pause')}<Pause/></button>}
          {time.state === TIME_STATE.RUNNING &&<button type="button" onClick={increment} className="btn btn-secondary d-flex align-items-center justify-content-between">{t('time.controller.increment')}<Plus/></button>}
          {time.state === TIME_STATE.RUNNING &&<button type="button" onClick={decrement} className="btn btn-secondary d-flex align-items-center justify-content-between">{t('time.controller.decrement')}<Dash/></button>}
          <button type="button" onClick={close} className="btn btn-danger d-flex align-items-center justify-content-between">{t('time.controller.close')}<X/></button>
        </div>
      </section>
  );
}

export default ControllerTimeDashboard;
