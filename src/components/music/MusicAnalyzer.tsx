import React, { ChangeEvent, useEffect, useState } from 'react';
import { AudioStream, IBand } from '../../util/audioStream';
import SettableBand from '../band/Band';
import useInterval from '@use-it/interval';
import "./musicAnalyzer.scss";


const audioStream = new AudioStream();
const INTERVAL_FPS = 36;

export interface IAnalysisFrame {
  dbBands: IBand[],
  beatEnergy: number,
  totalAmplitude: number,
}
export interface IThresholds {
  totalAmplitude: number;
  beatEnergy: number;
}

interface IMusicAnalyzerProps {
  onFrameAdded: Function,
  onThresholdsUpdated: Function,
}


function MusicAnalyzer({ onFrameAdded, onThresholdsUpdated }: IMusicAnalyzerProps) {

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<MediaDeviceInfo>();

  const [analysisFrameBuffer, setAnalysisFrameBuffer] = useState<IAnalysisFrame[]>([]);
  const [thresholds, setThreasholds] = useState<IThresholds>({
    totalAmplitude: 0,
    beatEnergy: 0,
  });

  const pushAnalasysFrame = (analysisFrame: IAnalysisFrame) => {
    setAnalysisFrameBuffer([analysisFrame, ...analysisFrameBuffer].slice(0, 10));
  }

  const refreshAudioDevices = async () => {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    const devices = await (await navigator.mediaDevices.enumerateDevices());
    setAudioDevices(devices);
  }

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
    let totalAmplitude = 0;

    currentAnalysisFrame.dbBands.forEach((currentBand, i) => {
      if (analysisFrameBuffer.length <= 1 || analysisFrameBuffer[0].dbBands.length === 0 || analysisFrameBuffer[1].dbBands.length === 0) {
        return 0;
      }

      const numberOfBars = analysisFrameBuffer[0].dbBands.length;
      const delta = currentAnalysisFrame.dbBands[i].db - analysisFrameBuffer[0].dbBands[i].db;
      beatEnergyAvg += ((delta * 2) / numberOfBars);
      totalAmplitude += (currentAnalysisFrame.dbBands[i].db / numberOfBars);
    });
    beatEnergyAvg /= 16;

    let fallingBeatEnergyLimit = 0;
    let fallingTotalAmplitudeLimit = 0;
    try {
      fallingBeatEnergyLimit = analysisFrameBuffer[0].beatEnergy - (INTERVAL_FPS / 500);
      fallingTotalAmplitudeLimit = analysisFrameBuffer[0].totalAmplitude - (INTERVAL_FPS / 50);
    } catch {

    }

    currentAnalysisFrame.beatEnergy = Math.min(Math.max(beatEnergyAvg, fallingBeatEnergyLimit, 0), 1);
    currentAnalysisFrame.totalAmplitude = Math.min(Math.max(totalAmplitude / 128, fallingTotalAmplitudeLimit, 0), 1);

    // currentAnalysisFrame.beatEnergy = currentAnalysisFrame.beatEnergy;
    currentAnalysisFrame.totalAmplitude = currentAnalysisFrame.totalAmplitude ** 4;

    pushAnalasysFrame(currentAnalysisFrame);
    onFrameAdded(currentAnalysisFrame);
  }, 1000 / INTERVAL_FPS)

  const onAudioDeviceSelectChange = async (changeEvent: ChangeEvent<HTMLSelectElement>) => {
    const selectedDeviceId = changeEvent.target.value;
    const selectedDevice = audioDevices.find(device => device.deviceId === selectedDeviceId);
    if (!selectedDevice) {
      setSelectedDevice(undefined);
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: selectedDevice.deviceId } } });
    console.log(stream);
    setSelectedDevice(selectedDevice);
    audioStream.connectStream(stream);
  };

  if (analysisFrameBuffer.length <= 0 || !audioDevices) {
    return <p>Loading...</p>
  }

  const onSetThreashold = (thresholdName: string, val: number) => {
    const newThresholds = {...thresholds, [thresholdName] : val};
    setThreasholds(newThresholds);
    onThresholdsUpdated(newThresholds)
  }
  
  return (
    <div>
      <header className="App-header">
        <h2>{selectedDevice?.label}</h2>
      </header>
      <select name="audioDevices" id="cars" onChange={onAudioDeviceSelectChange}>
        <option value="">(Select Audio Device)</option>
        {audioDevices.map((device, index) => <option key={index} value={device.deviceId}>{device.label}</option>)}
      </select>
      <hr />

      <div className="analyzerControlPanel">
        <div className="controls">
          <div>
            <SettableBand
              outputValue={analysisFrameBuffer[0].totalAmplitude}
              onInputValueSet={(val: number) => onSetThreashold("totalAmplitude", val)}
            />
            <div>Amp</div>
            <div>{analysisFrameBuffer[0].totalAmplitude.toFixed(2)}</div>
          </div>
          <div>
            <SettableBand
              outputValue={analysisFrameBuffer[0].beatEnergy}
              onInputValueSet={(val: number) => onSetThreashold("beatEnergy", val)}
            />
            <div>Beat</div>
            <div>{analysisFrameBuffer[0].beatEnergy.toFixed(2)}</div>
          </div>
        </div>
        {/* <div className="bands">
          {analysisFrameBuffer[0].dbBands.map((band: IBand, index) => <SettableBand outputValue={band.db/255} onInputValueSet={(val: number) => console.log(val)} />)}
        </div> */}
      </div>
    </div>
  );
}

export default MusicAnalyzer;
