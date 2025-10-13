import React, { useRef, useEffect } from 'react';

function PresentationDubbing({dubbing}) {

    const video = dubbing.videos[dubbing.index]

    return (
        <div className='d-flex height-full width-full align-items-center justify-content-center'>
            <h1>{video.title}</h1>
            <img src="image/pending-time.png" className='width-full'/>
        </div>
    );
}

export default PresentationDubbing;