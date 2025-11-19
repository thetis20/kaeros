import 'react';

function ImageTrack({ track }) {

    return (
        <div style={{
            display: 'flex',
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <img
                style={{
                    width: '100%',
                }}
                src={'file://' + track.src}
            />
        </div>
    );
}

export default ImageTrack;