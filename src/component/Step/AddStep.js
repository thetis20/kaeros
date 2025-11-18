import 'react';
import { Plus } from 'react-bootstrap-icons';

function AddStep({ workflowId, afterIndex }) {

    function onClick() {
        window.electronAPI.stepOpen({ workflowId, afterIndex })
    }

    return (
        <div
            style={{
                width: '100%',
                height: '2em',
                marginBottom: '1em',
                background: 'linear-gradient(180deg, rgba(0,0,0,0) calc(50% - 1px), rgba(192,192,192,1) calc(50%), rgba(0,0,0,0) calc(50% + 1px) )',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <button
                onClick={onClick}
                style={{
                    width: '2em',
                    height: '2em',
                    borderRadius: '1em',
                    border: 'none',
                    backgroundColor: 'grey',
                    color: 'white'
                }}
            >
                <Plus />
            </button>
        </div>
    )
}

export default AddStep;