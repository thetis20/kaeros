import {TwitterPicker} from "react-color";
import {useState, useEffect, useRef} from "react";

function InputColor({id, value, onChange}) {
    const ref = useRef();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        function close (event) {
            if(!event.target.contains(ref.current)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("click", close)
            return () => {
                document.removeEventListener("click", close)
            }
        }
    }, [open, ref])

    function onClick (event) {
        event.preventDefault()
        event.stopPropagation()
        setOpen(!open)
    }

    return <>
        <button
            className="form-control form-control-color"
            id={id}
            style={{
                backgroundColor: '#e9ebee',
            }}
            ref={ref}
            onClick={onClick}
        >
            <span style={{
                backgroundColor: value,
                display: 'flex',
                height: '100%',
                borderRadius: 'var(--bs-border-radius)'
            }}/>
        </button>
        {open && <TwitterPicker
            color={value}
            onChangeComplete={(color) => onChange(color.hex)}
        />}
    </>
}

export default InputColor;