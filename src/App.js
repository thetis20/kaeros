import React, { useEffect, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import Dashboard from './component/Dashboard/Dashboard';
import Time from './component/Time/Time';
import Dubbing from './component/Dubbing/Dubbing';
import Playlist from './component/Playlist/Playlist';

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
    default:
      return 'loading...';
  }
}

export default App;