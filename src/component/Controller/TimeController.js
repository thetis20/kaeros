import 'react';
import { useState, useEffect } from 'react';
import { Dash, Pause, Play, Plus } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import TIME_STATE from '../../enum/TIME_STATE';
import { white } from '../../enum/COLOR'
import { Fragment } from 'react';

function TimeController({ display }) {
  display = display === undefined ? true : display
  const { t } = useTranslation();
  const [time, setTime] = useState()

  function handleTime(event) {
    setTime(event.detail)
  }

  function increment() {
    electronAPI.timeOnChange({ ...time, number: time.number + 1 })
  }

  function decrement() {
    electronAPI.timeOnChange({ ...time, number: time.number - 1 })
  }

  function handlePlay() {
    if (time.state === TIME_STATE.PENDING) {
      electronAPI.timeOnChange({ ...time, paused: false, state: TIME_STATE.PRESENTATION })
    } else {
      electronAPI.timeOnChange({ ...time, paused: false })
    }
  }

  function handlePause() {
    electronAPI.timeOnChange({ ...time, paused: true })
  }

  function getItemClassName(state) {

    const className = ['list-group-item']
    if (time.state === state) {
      className.push('list-group-item-primary')
    } else if (
      (state === TIME_STATE.PENDING && [TIME_STATE.PRESENTATION, TIME_STATE.RUNNING].includes(time.state)) ||
      (state === TIME_STATE.PRESENTATION && TIME_STATE.RUNNING === time.state)
    ) {
      className.push('list-group-item-secondary')
    }
    return className.join(' ')
  }

  function toPending() {
    electronAPI.timeOnChange({
      ...time,
      state: TIME_STATE.PENDING,
      paused: true
    })
  }

  function toPresentation() {
    electronAPI.timeOnChange({
      ...time,
      state: TIME_STATE.PRESENTATION,
      paused: false
    })
  }

  function toRunning() {
    electronAPI.timeOnChange({
      ...time,
      secondes: time.minutes * 60,
      number: 1,
      state: TIME_STATE.RUNNING,
      paused: true
    })
  }

  useEffect(() => {
    window.electronAPI.timeFetch()
    document.addEventListener('time-onchange', handleTime);
    return () => {
      document.removeEventListener('time-onchange', handleTime);
    }
  }, []);

  useEffect(() => {
    function decrementTimer() {
      if (time.secondes - 1 <= 0) {
        electronAPI.timeOnChange({
          ...time,
          secondes: 0,
          paused: true
        })
      } else {
        electronAPI.timeOnChange({
          ...time,
          secondes: time.secondes - 1
        })
      }
    }

    function handleKeyboard(event) {
      switch (event.key) {
        case ' ':
          if (time.state === TIME_STATE.PENDING) {
            electronAPI.timeOnChange({
              ...time,
              state: TIME_STATE.PRESENTATION,
              paused: false
            })
          } else {
            electronAPI.timeOnChange({
              ...time,
              paused: !time.paused
            })
          }
          break;
        case 'ArrowRight':
          if (time.state === TIME_STATE.RUNNING) {
            electronAPI.timeOnChange({
              ...time,
              number: time.number + 1
            })
          }
          break;
        case 'ArrowLeft':
          if (time.state === TIME_STATE.RUNNING) {
            electronAPI.timeOnChange({
              ...time,
              number: time.number - 1
            })
          }
          break;
      }
      return
    }

    let interval = null

    if (time?.paused !== true && time?.state === TIME_STATE.RUNNING) {
      interval = setInterval(decrementTimer, 1000);
    }

    document.addEventListener('keydown', handleKeyboard)
    return () => {
      if (null !== interval) {
        clearInterval(interval);
      }
      document.removeEventListener('keydown', handleKeyboard)
    }
  }, [time]);

  if (!time || !display) {
    return null
  }

  return (
    <Fragment>
      <h5>{t('time.name')}</h5>
      <section style={{ display: 'flex', gap: 20, padding: 20, alignItems: 'start', flexDirection: 'column' }}>
        <div style={{ width: '100%', display: 'flex' }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {time.state === TIME_STATE.RUNNING && <button
              style={{
                fontSize: 25,
                border: 'none',
                color: white,
                background: 'none'
              }}
              onClick={decrement}><Dash /></button>}
          </div>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {time.paused === true && <button
              style={{
                fontSize: 50,
                border: 'none',
                color: white,
                background: 'none'
              }}
              onClick={handlePlay}><Play /></button>}
            {time.paused === false && <button
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
            {time.state === TIME_STATE.RUNNING && <button
              style={{
                fontSize: 25,
                border: 'none',
                color: white,
                background: 'none'
              }}
              onClick={increment}><Plus /></button>}
          </div>
        </div>
        <ul className="list-group" style={{
          margin: '0 -2.25em',
          width: 280,
          borderRadius: 0,
          overflowY: 'auto'
        }}>
          <li
            style={{ cursor: 'pointer' }}
            onClick={toPending}
            className={getItemClassName(TIME_STATE.PENDING)}
          >
            {t('time.state.pending')}
          </li>
          <li
            style={{ cursor: 'pointer' }}
            onClick={toPresentation}
            className={getItemClassName(TIME_STATE.PRESENTATION)}
          >
            {t('time.state.presentation')}
          </li>
          <li
            style={{ cursor: 'pointer' }}
            onClick={toRunning}
            className={getItemClassName(TIME_STATE.RUNNING)}
          >
            {t('time.state.running')}
          </li>
        </ul>
      </section>
    </Fragment>
  );
}

export default TimeController;
