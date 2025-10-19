

export default function ImageDashboard({ img, active, disabled }) {

    function select(img) {

        if (true === disabled) {
            return;
        }
        window.electronAPI.galleryOnChange(img)
    }

    return <li style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        width: 170,
        height: 170,
        padding: 10
    }} onClick={() => select(img)}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 100,
            height: 100,
            backgroundColor: img.src ? 'none' : 'black'
        }}>
            <img src={img.src} style={{ maxWidth: '100%', maxHeight: '100%' }} />
        </div>
        <div style={{
            fontWeight: active ? 'bold' : 'normal',
            marginTop: 10,
            height: 40,
            display: 'flex',
            justifyContent: 'flex-end',
            fontSize: 12
        }}>
            <span>{img.name}</span>
        </div>
    </li>
}
