import 'react';
import BattleRoyalStepController from "./BattleRoyalStepController";

function StepController({session, step, index}) {
    if (step.type === 'battle-royal') {
        return <BattleRoyalStepController session={session} step={step} index={index}/>
    }

    const isCurrentStep = session.index === index;
    const isDone = session.index > index;
    return <div
        className={`step-row ${isCurrentStep ? 'current' : ''} ${isDone ? 'done' : ''}`}
        style={{cursor: isCurrentStep ? 'default' : 'pointer'}}
        onClick={isCurrentStep ? undefined : () => session.toStep(index)}
    >
        <span className="step-name">{step.name}</span>
    </div>
}

export default StepController;
