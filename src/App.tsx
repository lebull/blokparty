import useInterval from '@use-it/interval';
import React, { useState } from 'react';
import './App.css';
import Buttplug from "./components/buttplug/Buttplug";
import MusicAnalyzer, { IAnalysisFrame } from './components/music/MusicAnalyzer';

const BUTTPLUG_UPDATE_FPS = 15;

function App() {

  const [lastFrame, setLatestFrame] = useState<IAnalysisFrame>();
  const [buttplugFrame, setButtplugFrame] = useState<IAnalysisFrame>();

  useInterval(()=>{
    setButtplugFrame(lastFrame);
  }, 1000/BUTTPLUG_UPDATE_FPS);

  return (
    <div className="App">
      <Buttplug frame={buttplugFrame}/>
      <hr />
      <MusicAnalyzer onFrameAdded={(frame: IAnalysisFrame)=>setLatestFrame(frame)} />


    </div>
  );
}

export default App;
