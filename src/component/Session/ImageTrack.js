import 'react';

function ImageTrack({track}) {

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <img
                style={{
                    width: '100%',
                    objectFit: 'contain'
                }}
                src={'file://' + track.src}
                alt={track.name}/>
        </div>
    );
}

export default ImageTrack;