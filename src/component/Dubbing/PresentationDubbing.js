import React, { useRef, useEffect } from 'react';
import { blue, white } from '../../enum/COLOR'

function PresentationDubbing({ dubbing }) {

    const video = dubbing.videos[dubbing.index]

    return (
        <div
            style={{
                display: 'flex',
                height: '100%',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div style={{ position: 'absolute', padding: 20, backgroundColor: white, color: blue }}>{video?.description}</div>
            <img src="image/presentation-dubbing.png" className='width-full' />
        </div>
    );
}

export default PresentationDubbing;