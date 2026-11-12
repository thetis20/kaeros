import 'react';
import {toFileUrl} from '../../lib/mediaUrl';

export function ImageStage({url, scale = 100, background = true, alt, width = '100vw', height = '100vh'}) {
    const backgroundStyle = background ? {
        backgroundImage: 'url(image/presentation-dubbing.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    } : {
        backgroundColor: 'black'
    };
    return (
        <div style={{
            display: 'flex',
            height,
            width,
            alignItems: 'center',
            justifyContent: 'center',
            ...backgroundStyle
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
    return <ImageStage
        url={toFileUrl(track.src)}
        scale={track.scale ?? 100}
        background={track.background !== false}
        alt={track.name}/>;
}

export default ImageTrack;
