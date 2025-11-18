import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import useSteps from '../Hook/useSteps';
import StepItem from '../Step/StepItem'
import AddStep from '../Step/AddStep';

function StepDashboard({ workflowId }) {
    const { t } = useTranslation();
    const steps = useSteps(workflowId)

    return (
        <Fragment>
            <div style={{
                listStyle: 'none',
                padding: 0,
                gap: 30,
                display: 'flex',
                flexWrap: 'wrap',
                marginTop: 30,
                width: '100%'
            }}>
                <AddStep workflowId={workflowId} />
                {steps.map((step, index) => <Fragment>
                    <StepItem key={step.id} step={step} workflowId={workflowId} />
                    <AddStep workflowId={workflowId} afterIndex={index} />
                </Fragment>)}
            </div>
        </Fragment>
    );
}

export default StepDashboard;
