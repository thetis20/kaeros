import 'react';
import {useEffect, Fragment} from 'react';
import {ChevronBarLeft, ChevronBarRight, Dash, Pause, Play, Plus} from 'react-bootstrap-icons';
import {useTranslation} from 'react-i18next';
import {white} from '../../enum/COLOR'
import useSession from '../Hook/useSession';
import BattleRoyalStepController from "./BattleRoyalStepController";

function StepController({session, step, index}) {
    if(step.type === 'battle-royal'){
        return <BattleRoyalStepController session={session} step={step} index={index}/>
    }

    const isCurrentStep = session.index === index
    return <li
        style={{cursor: isCurrentStep ? undefined : 'pointer'}}
        onClick={isCurrentStep ? undefined : () => session.toStep(index)}
        className={'list-group-item ' + ((session.index === index) ? 'list-group-item-primary' : (session.index <= index ? '' : 'list-group-item-secondary'))}
    >
        {step.name}
    </li>
}

export default StepController;
