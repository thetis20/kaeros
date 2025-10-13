import React from 'react';

function CounterTime({time}) {

    const min = Math.floor(time.secondes / 60);
    const sec = time.secondes % 60 <= 9 ? `0${time.secondes % 60}` : time.secondes % 60;

    return (
        <div className="counter-time">
            <div className="counter-time__number">{time.number}</div>
            <div className="counter-time__timer">{min}:{sec}</div>
        </div>
    );
}

export default CounterTime;