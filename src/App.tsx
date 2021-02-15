import React from 'react';
import './App.css';
import { ButtplugConnectedDeviceList } from "./components/buttplug/Buttplug";
import { MusicAnalyzerWorker } from './components/music/MusicAnalyzerWorker';
import { ButtplugContextProvider } from './contexts/ButtplugContext';
import Navbar from './layout/navbar';

function App() {

  return (
    <div className="App">
      <ButtplugContextProvider>
        <Navbar />
        <MusicAnalyzerWorker />
        <ButtplugConnectedDeviceList />
      </ButtplugContextProvider>
    </div>
  );
}

export default App;
