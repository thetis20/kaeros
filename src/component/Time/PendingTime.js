import React, { useRef, useEffect } from 'react';

function PendingTime({time}) {

    return (
        <div className='d-flex height-full width-full align-items-center justify-content-center'>
            <img src="image/pending-time.png" className='width-full'/>
        </div>
    );
}

export default PendingTime;