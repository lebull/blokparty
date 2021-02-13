import useInterval from '@use-it/interval';
import React, { useState } from 'react';
import './App.css';
import Buttplug from "./components/buttplug/Buttplug";
import MusicAnalyzer, { IAnalysisFrame, IThresholds } from './components/music/MusicAnalyzer';

const BUTTPLUG_UPDATE_FPS = 12;

function App() {

  const [lastFrame, setLatestFrame] = useState<IAnalysisFrame>();
  const [buttplugFrame, setButtplugFrame] = useState<IAnalysisFrame>();

  const [thresholds, setThresholds] = useState<IThresholds>({
    totalAmplitude: 0,
    beatEnergy: 0,
  });
  const [buttplugThresholds, setButtplugThresholds] = useState<IThresholds>({
    totalAmplitude: 0,
    beatEnergy: 0,
  });

  useInterval(()=>{
    setButtplugFrame(lastFrame);
    setButtplugThresholds(thresholds);
  }, 1000/BUTTPLUG_UPDATE_FPS);

  return (
    <div className="App">
      <Buttplug frame={buttplugFrame} thresholds={buttplugThresholds}/>
      <hr />
      <MusicAnalyzer 
        onFrameAdded={(frame: IAnalysisFrame) => setLatestFrame(frame)}
        onThresholdsUpdated={(thresholds: IThresholds) => setThresholds(thresholds)}
      />


    </div>
  );
}

export default App;
