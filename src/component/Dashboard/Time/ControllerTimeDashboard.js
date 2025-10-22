import 'react';
import { Dash, Pause, Play, Plus, X } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import TIME_STATE from '../../../enum/TIME_STATE';
import { white } from '../../../enum/COLOR'

function ControllerTimeDashboard({ time }) {
  const { t } = useTranslation();

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

  return (
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
        <li className={getItemClassName(TIME_STATE.PENDING)}>{t('time.state.pending')}</li>
        <li className={getItemClassName(TIME_STATE.PRESENTATION)}>{t('time.state.presentation')}</li>
        <li className={getItemClassName(TIME_STATE.RUNNING)}>{t('time.state.running')}</li>
      </ul>
    </section>
  );
}

export default ControllerTimeDashboard;
