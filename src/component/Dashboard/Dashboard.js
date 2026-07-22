import 'react';
import {useState} from 'react';
import Sidebar from '../Sidebar/Sidebar';
import RegieScreen from '../Screen/RegieScreen';
import MusiqueScreen from '../Screen/MusiqueScreen';
import WorkflowDashboard from './WorkflowDashboard';
import useSession from '../Hook/useSession';
import useAudios from '../Hook/useAudios';

function Dashboard() {
    const [screen, setScreen] = useState('regie');
    const session = useSession();
    const audios = useAudios();

    return (
        <div className="d-flex height-full" style={{height: '100vh'}}>
            <Sidebar
                screen={screen}
                onNavigate={setScreen}
                sessionRunning={session !== null}
                musicPlaying={audios.length > 0}
            />
            <main style={{maxHeight: '100%', overflowY: 'auto', flex: 1}}>
                {screen === 'regie' && <RegieScreen/>}
                {screen === 'musique' && <MusiqueScreen/>}
                {screen === 'sessions' && <WorkflowDashboard/>}
            </main>
        </div>
    );
}

export default Dashboard;
