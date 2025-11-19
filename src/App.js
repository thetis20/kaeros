import React, { useEffect, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import Dashboard from './component/Dashboard/Dashboard';
import Time from './component/Time/Time';
import Dubbing from './component/Dubbing/Dubbing';
import Playlist from './component/Playlist/Playlist';
import Folder from './component/Folder/Folder';
import Workflow from './component/Workflow/Workflow';
import Audio from './component/Audio/Audio';
import Step from './component/Step/Step';
import Session from './component/Session/Session';

function App() {

  switch (window.electronAPI.mode) {
    case 'main':
      return <Dashboard />;
    case 'time':
      return <Time />;
    case 'dubbing':
      return <Dubbing />;
    case 'playlist':
      return <Playlist />;
    case 'folder':
      return <Folder />;
    case 'audio':
      return <Audio />;
    case 'workflow':
      return <Workflow />;
    case 'step':
      return <Step />;
    case 'session':
      return <Session />;
    default:
      return 'loading...';
  }
}

export default App;