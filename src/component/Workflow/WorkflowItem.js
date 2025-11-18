import { Pen, Play, Trash } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

function WorkflowItem({ workflow, onSelect }) {
    const { t } = useTranslation();
    const updatedAt = moment(workflow.updatedAt);

    return <div
        style={{
            display: 'flex',
            paddingTop: '.75em',
            width: '100%',
            cursor: onSelect ? 'pointer' : 'inherit'
        }}
        onClick={onSelect ? () => onSelect(workflow.id) : undefined}
    >
        <svg className="bd-placeholder-img flex-shrink-0 me-2 rounded" height="32" preserveAspectRatio="xMidYMid slice" role="img" width="32" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill={workflow.color}></rect>
        </svg>
        <div className="pb-3 mb-0 small lh-sm border-bottom w-100">
            <div className="d-flex justify-content-between">
                <strong className="text-gray-dark" >{workflow.name}</strong>
            </div>
            <span className="d-block">{updatedAt.fromNow()}</span>
        </div>
    </div>
}

export default WorkflowItem;