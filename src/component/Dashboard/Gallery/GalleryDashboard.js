import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ImageDashboard from './ImageDashboard'

const images = [{
  name: 'Banniere spectacles LFB',
  src: 'image/catch/Banniere spectacles LFB.png'
},
{
  name: 'Les arnacoeurs assurés',
  src: 'image/catch/Les arnacoeurs assurés.jpeg'
},
{
  name: 'Les improcrastinateurs',
  src: 'image/catch/Les improcrastinateurs.jpeg'
},
{
  name: 'Les Kiki Blinders',
  src: 'image/catch/Les Kiki Blinders.jpeg'
},
{
  name: 'logo catch LFB',
  src: 'image/catch/logo catch LFB.jpeg'
},
{
  name: 'LOGO LFB',
  src: 'image/catch/LOGO LFB.jpeg'
},
{
  name: 'Sharpay et Ryan',
  src: 'image/catch/Sharpay et Ryan.jpeg'
}]

function GalleryDashboard() {

  const { t } = useTranslation();
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

  function open() {
    window.electronAPI.galleryOpen()
  }

  return (
    <div className="p-4">
      <h1>{t('gallery.name')}</h1>
      <button className="btn btn-primary" onClick={open}>{t('gallery.open')}</button>
      <ul style={{
        listStyle: 'none',
        padding: 0,
        gap: 30,
        display: 'flex',
        flexWrap: 'wrap',
        marginTop: 30
      }}>
        <ImageDashboard
          img={{ name: t('gallery.black') }}
          active={gallery?.src === undefined}
          disabled={undefined === gallery}
        />
        {images.map((img => <ImageDashboard
          img={img}
          key={img.src}
          active={gallery?.src === img.src}
          disabled={undefined === gallery}
        />))}
      </ul>
    </div >
  );
}

export default GalleryDashboard;
