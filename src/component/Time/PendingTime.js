import React, { useRef, useEffect } from 'react';

function PendingTime({ time }) {

    return (
        <div className='d-flex height-full width-full align-items-center justify-content-center'>
            <img src={time.type === 'time' ? 'image/pending-time.png' : 'image/pending-time-spinoff.png'} className='width-full' />
        </div>
    );
}

export default PendingTime;