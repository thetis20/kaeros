import { useState, Fragment } from 'react';
import { Pen, Trash } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import useWorkflows from '../Hook/useWorkflows.js';
import WorkflowItem from '../Workflow/WorkflowItem.js';
import { ChevronLeft } from 'react-bootstrap-icons';
import AddStep from '../Step/AddStep.js';
import StepDashboard from './StepDashboard.js'

function WorkflowDashboard() {
  const { t } = useTranslation();
  const workflows = useWorkflows()
  const [selectedId, select] = useState(null)
  const selectedWorkflow = workflows.find(workflow => workflow.id === selectedId) || null

  function create() {
    window.electronAPI.workflowOpen()
  }

  function remove() {
    window.electronAPI.workflowRemove(selectedId)
  }

  function edit() {
    window.electronAPI.workflowOpen(selectedWorkflow)
  }

  return (
    <div style={{ padding: '1em' }}>
      <h1>{t('workflow.name')}</h1>
      {selectedWorkflow === null
        ? <Fragment>
          <button className="btn btn-primary" onClick={create}>{t('workflow.create')}</button>
          <div style={{
            listStyle: 'none',
            padding: 0,
            gap: 30,
            display: 'flex',
            marginTop: 30
          }}>
            {workflows.map((workflow) => <WorkflowItem key={workflow.id} workflow={workflow} onSelect={select} />)}
          </div>
        </Fragment>
        : <Fragment>
          <WorkflowItem workflow={selectedWorkflow} />
          <div style={{ display: 'flex', margin: '1em 0', gap: '1em', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => select(null)}>
              <ChevronLeft style={{ marginRight: '.5em' }} />
              {t('workflow.back')}
            </button>
            <button className="btn btn-danger" onClick={remove}>
              <Trash style={{ marginRight: '.5em' }} />
              {t('workflow.remove')}
            </button>
            <button className="btn btn-primary" onClick={edit}>
              <Pen style={{ marginRight: '.5em' }} />
              {t('workflow.edit')}
            </button>
          </div>
          <StepDashboard workflowId={selectedId} />
        </Fragment>}
    </div >
  );
}

export default WorkflowDashboard;
