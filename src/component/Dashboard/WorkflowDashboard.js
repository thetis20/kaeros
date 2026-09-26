import { useTranslation } from 'react-i18next';
import useWorkflows from '../Hook/useWorkflows.js';
import WorkflowItem from '../Workflow/WorkflowItem.js';

function WorkflowDashboard({ onCreateNew, onEditWorkflow, onPlay, checking }) {
  const { t } = useTranslation();
  const workflows = useWorkflows()

  function play(workflow) {
    onPlay(workflow)
  }

  function edit(workflow) {
    onEditWorkflow(workflow)
  }

  function remove(workflow) {
    window.electronAPI.workflowRemove(workflow.id)
  }

  return (
    <div className="content">
      <div className="top-bar">
        <p className="screen-title">{t('workflow.name')}</p>
        <button type="button" className="btn btn-accent" onClick={onCreateNew}>{t('workflow.create')}</button>
      </div>
      <div className="grid grid-cards">
        {workflows.map((workflow) => (
          <WorkflowItem key={workflow.id} workflow={workflow} onPlay={play} onEdit={edit} onRemove={remove} checking={checking}/>
        ))}
      </div>
    </div>
  );
}

export default WorkflowDashboard;
