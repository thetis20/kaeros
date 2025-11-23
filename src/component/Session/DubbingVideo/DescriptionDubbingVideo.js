import React, { useRef, useEffect } from 'react';
import { blue, white } from '../../../enum/COLOR'

function DescriptionDubbingVideo({ track }) {

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
            <div style={{
                position: 'absolute',
                padding: 20,
                backgroundColor: white,
                color: blue,
                whiteSpace: 'break-spaces',
                minWidth: 800,
                minHeight: 300,
                fontSize: '2.5em'
            }}>
                <div style={{ textAlign: 'right' }}>{track?.time}</div>
                <div>{track?.description}</div>
            </div>
            <img src="image/presentation-dubbing.png" className='width-full' />
        </div>
    );
}

export default DescriptionDubbingVideo;