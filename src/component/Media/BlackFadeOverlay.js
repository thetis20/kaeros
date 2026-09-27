import React from 'react';

function BlackFadeOverlay({opacity}) {
    return <div aria-hidden="true" data-testid="black-fade-overlay" style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#000',
        opacity,
        transition: 'opacity 250ms linear',
        pointerEvents: 'none'
    }}/>;
}

export default BlackFadeOverlay;
