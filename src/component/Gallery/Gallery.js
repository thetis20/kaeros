import React, { useEffect, useState } from 'react';

function Gallery() {
    const [gallery, setGallery] = useState()

    function handleGallery(event) {
        setGallery(event.detail)
    }

    useEffect(() => {
        document.addEventListener('gallery-onchange', handleGallery);
        return () => {
            document.removeEventListener('gallery-onchange', handleGallery);
        }
    }, []);

    return (
        <div className="with-full height-full bg-black" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            {!!gallery?.src && <img src={gallery.src} style={{
                maxWidth: '100%',
                maxHeight: '100%'
            }} />}
        </div>
    );
}

export default Gallery;