import React, { useEffect, useState } from 'react';
import { AudioStream, IBand } from '../../util/audioStream';
import SettableBand from '../band/Band';
import useInterval from '@use-it/interval';


const audioStream = new AudioStream();
const INTERVAL_FPS = 15;

export interface IAnalysisFrame {
  dbBands: IBand[],
  beatEnergy: number,
}

interface IMusicAnalyzerProps {
  onFrameAdded: Function,
}

function MusicAnalyzer({onFrameAdded}: IMusicAnalyzerProps) {

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<MediaDeviceInfo>();

  const [analysisFrameBuffer, setAnalysisFrameBuffer] = useState<IAnalysisFrame[]>([]);
  const pushAnalasysFrame = (analysisFrame: IAnalysisFrame) => {
    setAnalysisFrameBuffer([analysisFrame, ...analysisFrameBuffer].slice(0, 10));
  }

  const refreshAudioDevices = async () => {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    const devices = await (await navigator.mediaDevices.enumerateDevices());
    setAudioDevices(devices);
  }

  const onDeviceSelected = async (device: MediaDeviceInfo) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: device.deviceId } } });
    console.log(stream);
    setSelectedDevice(device);
    audioStream.connectStream(stream);
  };

  useEffect(() => {
    refreshAudioDevices();
  }, []);

  useInterval(() => {
    audioStream.tick()

    const currentAnalysisFrame = {
      dbBands: [...audioStream.bands],
      beatEnergy: 0,
    } as IAnalysisFrame;


    let beatEnergyAvg = 0;

    currentAnalysisFrame.dbBands.forEach((currentBand, i) => {
      if (analysisFrameBuffer.length <= 1 || analysisFrameBuffer[0].dbBands.length === 0 || analysisFrameBuffer[1].dbBands.length === 0) {
        return 0;
      }

      const delta = currentAnalysisFrame.dbBands[i].db - analysisFrameBuffer[0].dbBands[i].db;
      beatEnergyAvg += (delta / analysisFrameBuffer[0].dbBands.length );
    });
    beatEnergyAvg /= 16;

    let fallingBeatEnergyLimit = 0;
    try {
      fallingBeatEnergyLimit = analysisFrameBuffer[0].beatEnergy - (5/INTERVAL_FPS);
    } catch {

    }

    currentAnalysisFrame.beatEnergy = Math.min(Math.max(beatEnergyAvg, fallingBeatEnergyLimit, 0), 1);

    
    pushAnalasysFrame(currentAnalysisFrame);

    onFrameAdded(currentAnalysisFrame);


  }, 1000 / INTERVAL_FPS)

  const mapBandValue = (db: number) => (db / 255) ** 3;

  if (analysisFrameBuffer.length <= 0 || !audioDevices) {
    return <p>Loading...</p>
  }
  return (
    <div className="App">
      <header className="App-header">
        <h2>{selectedDevice?.label}</h2>
      </header>
      <ul>
        {audioDevices.map((device, index) => <li key={index}><button onClick={() => { onDeviceSelected(device) }}>{device.label}</button></li>)}
      </ul>
      <hr />
      <div>
        BeatEnergy: {analysisFrameBuffer[0].beatEnergy.toFixed(2)}
      </div>
      <div className="bands">
        {analysisFrameBuffer[0].dbBands.map((band: IBand, index) => <SettableBand outputValue={mapBandValue(band.db)} onInputValueSet={(val: number) => console.log(val)} />)}
      </div>
    </div>
  );
}

export default MusicAnalyzer;
