import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function FormTimeDashboard({ onSubmit }) {
  const { t } = useTranslation();

  const [type, setType] = useState('time');
  const [minutes, setMinutes] = useState(60);
  const [number, setNumber] = useState(30);

  function handleSubmit(e) {
    e.stopPropagation();
    e.preventDefault();
    onSubmit({ type, minutes, number })
  }

  function onTypeChange(e) {
    setType(e.currentTarget.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="time-minutes" className="form-label">{t('time.form.type.label')}</label>
        <div className="form-check">
          <input className="form-check-input" type="radio" value="time" id="type-time" onChange={onTypeChange} checked={type === 'time'} />
          <label className="form-check-label" for="type-time">
            {t('time.form.type.option.time')}
          </label>
        </div>
        <div className="form-check">
          <input className="form-check-input" type="radio" value="spinoff" id="type-spinoff" onChange={onTypeChange} checked={type === 'spinoff'} />
          <label className="form-check-label" for="type-spinoff">
            {t('time.form.type.option.spinoff')}
          </label>
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="time-minutes" className="form-label">{t('time.form.minutes')}</label>
        <input className="form-control" id="time-minutes" type="number" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
      </div>
      <div className="mb-3">
        <label htmlFor="time-number" className="form-label">{t('time.form.number')}</label>
        <input className="form-control" id="time-number" type="number" value={number} onChange={(e) => setNumber(e.target.value)} />
      </div>
      <input className="btn btn-primary" type="submit" value={t('time.form.submit')} />
    </form>
  );
}

export default FormTimeDashboard;
