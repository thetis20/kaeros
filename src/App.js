import React, { useEffect, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import Dashboard from './component/Dashboard/Dashboard';
import Time from './component/Time/Time';
import Dubbing from './component/Dubbing/Dubbing';

function App() {

  switch (window.electronAPI.mode) {
    case 'main':
      return <Dashboard/>;
    case 'time':
      return <Time/>;
    case 'dubbing':
      return <Dubbing/>;
    default:
      return 'loading...';
  }
}

export default App;