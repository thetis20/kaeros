import 'react';
import {toFileUrl} from '../../lib/mediaUrl';

export function ImageStage({url, scale = 100, alt, width = '100vw', height = '100vh'}) {
    return (
        <div style={{
            display: 'flex',
            height,
            width,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: 'url(image/presentation-dubbing.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}>
            <img
                style={{
                    width: `${scale}%`,
                    height: `${scale}%`,
                    objectFit: 'contain'
                }}
                src={url}
                alt={alt}/>
        </div>
    );
}

function ImageTrack({track}) {
    return <ImageStage url={toFileUrl(track.src)} scale={track.scale ?? 100} alt={track.name}/>;
}

export default ImageTrack;
