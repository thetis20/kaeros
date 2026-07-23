import React, { useEffect, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import Dashboard from './component/Dashboard/Dashboard';
import Workflow from './component/Workflow/Workflow';
import Step from './component/Step/Step';
import Session from './component/Session/Session';

function App() {

  switch (window.electronAPI.mode) {
    case 'main':
      return <Dashboard />;
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
