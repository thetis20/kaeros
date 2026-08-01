import { IconEdit, IconPlayerPlay, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

function WorkflowItem({ workflow, onPlay, onEdit, onRemove }) {
    const { t } = useTranslation();
    const updatedAt = moment(workflow.updatedAt);

    return <div className="workflow-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div className="color-chip" style={{ background: workflow.color }}/>
            <p style={{ fontSize: 13, fontWeight: 500, margin: 0, flex: 1 }}>{workflow.name}</p>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 10px' }}>{updatedAt.fromNow()}</p>
        <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" className="btn btn-sm" style={{ flex: 1 }} aria-label={t('workflow.play')} onClick={() => onPlay(workflow)}><IconPlayerPlay/></button>
            <button type="button" className="btn btn-sm" style={{ flex: 1 }} aria-label={t('workflow.edit')} onClick={() => onEdit(workflow)}><IconEdit/></button>
            <button type="button" className="btn btn-sm" style={{ flex: 1 }} aria-label={t('workflow.remove')} onClick={() => onRemove(workflow)}><IconTrash/></button>
        </div>
    </div>
}

export default WorkflowItem;
