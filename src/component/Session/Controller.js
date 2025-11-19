import 'react';
import { useEffect, Fragment } from 'react';
import { ChevronBarLeft, ChevronBarRight, Pause, Play } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { white } from '../../enum/COLOR'
import useSession from '../Hook/useSession';

function Controller({ display }) {
  display = display === undefined ? true : display
  const { t } = useTranslation();
  const session = useSession()
  const track = session?.track

  function next() {
    window.electronAPI.sessionNext()
  }

  function previous() {
    window.electronAPI.sessionPrevious()
  }

  function toStep(index) {
    window.electronAPI.sessionToStep(index)
  }

  function play() {
    window.electronAPI.trackPlay()
  }

  function pause() {
    window.electronAPI.trackPause()
  }

  function plus() {
    window.electronAPI.trackPlus()
  }

  function minus() {
    window.electronAPI.trackMinus()
  }

  useEffect(() => {
    function handleKeyboard(event) {
      switch (event.key) {
        case ' ':
          play()
          break;
        case 'ArrowRight':
          next()
          break;
        case 'ArrowLeft':
          previous()
          break;
        case 'ArrowTop':
          plus()
          break;
        case 'ArrowBottom':
          minus()
          break;
      }
      return
    }

    document.addEventListener('keydown', handleKeyboard)
    return () => {
      document.removeEventListener('keydown', handleKeyboard)
    }
  });

  if (!session || !display) {
    return null
  }

  const hasNext = session.steps.length - 1 >= session.index
  const hasPrevious = session.index !== 0

  return (
    <Fragment>
      <h5>{t('session.name')}</h5>
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
            onClick={previous}><ChevronBarLeft /></button>}
        </div>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {track.canPlay() && <button
            style={{
              fontSize: 50,
              border: 'none',
              color: white,
              background: 'none'
            }}
            onClick={play}><Play /></button>}
          {track.canPause() && <button
            style={{
              fontSize: 50,
              border: 'none',
              color: white,
              background: 'none'
            }}
            onClick={pause}><Pause /></button>}
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
            onClick={next}><ChevronBarRight /></button>}
        </div>
      </div>
      <ul className="list-group" style={{
        margin: '0 -1em',
        width: 280,
        borderRadius: 0,
        overflowY: 'auto'
      }}>
        {session.steps.map((step, index) =>
          <li
            style={{ cursor: 'pointer' }}
            onClick={() => toStep(index)}
            className={'list-group-item ' + ((session.index === index) ? 'list-group-item-primary' : (session.index <= index ? '' : 'list-group-item-secondary'))}
            key={index}
          >
            {step.name}
          </li>)}
      </ul>
    </Fragment >
  );
}

export default Controller;
