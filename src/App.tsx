import useInterval from '@use-it/interval';
import React, { useState } from 'react';
import './App.css';
import { ButtplugConnectedDeviceList, ButtplugToMusicWorker } from "./components/buttplug/Buttplug";
import { MusicAnalyzerWorker, IThresholds } from './components/music/MusicAnalyzerWorker';
import { ButtplugContextProvider } from './contexts/ButtplugContext';
import Navbar from './layout/navbar';
import { IAnalysisFrame } from './util/musicAnalyzer';

const BUTTPLUG_UPDATE_FPS = 12;

function App() {

  const [lastFrame, setLatestFrame] = useState<IAnalysisFrame>();
  const [buttplugFrame, setButtplugFrame] = useState<IAnalysisFrame>();

  const [thresholds, setThresholds] = useState<IThresholds>({
    gain: 0,
    totalAmplitude: 0,
    beatEnergy: 0,
  });
  const [buttplugThresholds, setButtplugThresholds] = useState<IThresholds>({
    gain: 0,
    totalAmplitude: 0,
    beatEnergy: 0,
  });

  useInterval(() => {
    setButtplugFrame(lastFrame);
    setButtplugThresholds(thresholds);
  }, 1000 / BUTTPLUG_UPDATE_FPS);

  return (
    <div className="App">
      <ButtplugContextProvider>
        <Navbar />
        <ButtplugConnectedDeviceList/>
        <MusicAnalyzerWorker
          onFrameAdded={(frame: IAnalysisFrame) => setLatestFrame(frame)}
          onThresholdsUpdated={(thresholds: IThresholds) => setThresholds(thresholds)}
        />
        <ButtplugToMusicWorker frame={buttplugFrame} thresholds={buttplugThresholds} /> {/* Does not render.  Do we need to do something else?*/}
      </ButtplugContextProvider>
    </div>
  );
}

export default App;
