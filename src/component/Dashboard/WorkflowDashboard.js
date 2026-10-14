import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconFileImport } from '@tabler/icons-react';
import useWorkflows from '../Hook/useWorkflows.js';
import WorkflowItem from '../Workflow/WorkflowItem.js';
import MediaErrorDialog from '../Screen/MediaErrorDialog';

const IMPORT_ERRORS = ['invalid', 'version', 'step'];

function WorkflowDashboard({ onCreateNew, onEditWorkflow, onPlay, checking }) {
  const { t } = useTranslation();
  const workflows = useWorkflows()
  const [busy, setBusy] = useState(null)
  const [issues, setIssues] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  function play(workflow) {
    onPlay(workflow)
  }

  function edit(workflow) {
    onEditWorkflow(workflow)
  }

  function remove(workflow) {
    window.electronAPI.workflowRemove(workflow.id)
  }

  async function exportWorkflow(workflow) {
    if (busy) return
    setBusy('exporting')
    setError(null)
    setSuccess(null)
    try {
      const result = await window.electronAPI.workflowExport(workflow.id)
      if (result?.ok) {
        setSuccess(t('workflow.exportSuccess', { path: result.path }))
      } else if (result?.canceled) {
        // rien à afficher
      } else if (result?.issues) {
        setIssues(result.issues)
      } else {
        setError(t('workflow.error.export'))
      }
    } catch (e) {
      setError(t('workflow.error.export'))
    } finally {
      setBusy(null)
    }
  }

  async function importWorkflow() {
    if (busy) return
    setBusy('importing')
    setError(null)
    setSuccess(null)
    try {
      const result = await window.electronAPI.workflowImport()
      if (result?.ok) {
        setSuccess(t('workflow.importSuccess'))
      } else if (result?.canceled) {
        // rien à afficher
      } else {
        const key = IMPORT_ERRORS.includes(result?.error) ? result.error : 'generic'
        setError(t(`workflow.error.import.${key}`))
      }
    } catch (e) {
      setError(t('workflow.error.import.generic'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="content">
      <div className="top-bar">
        <p className="screen-title">{t('workflow.name')}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn" disabled={!!busy} onClick={importWorkflow}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconFileImport size={18}/>{busy === 'importing' ? t('workflow.importing') : t('workflow.import')}
          </button>
          <button type="button" className="btn btn-accent" onClick={onCreateNew}>{t('workflow.create')}</button>
        </div>
      </div>
      {busy === 'exporting' && <p role="status" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('workflow.exporting')}</p>}
      {error && <div role="alert" className="media-banner-error">{error}</div>}
      {success && <div role="status" style={{ margin: '0 0 16px', padding: '8px 12px', borderRadius: 'var(--radius)', background: 'var(--accent-bg)', color: 'var(--accent-dark)', fontSize: 13, fontWeight: 500 }}>{success}</div>}
      <div className="grid grid-cards">
        {workflows.map((workflow) => (
          <WorkflowItem key={workflow.id} workflow={workflow} onPlay={play} onEdit={edit} onRemove={remove}
                        onExport={exportWorkflow} checking={checking} disabled={!!busy}/>
        ))}
      </div>
      {issues.length > 0 && <MediaErrorDialog issues={issues} onClose={() => setIssues([])}/>}
    </div>
  );
}

export default WorkflowDashboard;
