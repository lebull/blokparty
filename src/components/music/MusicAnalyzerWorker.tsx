import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import { IAnalysisFrame } from '../../util/musicAnalyzer';
import SettableBand from '../band/Band';
import useInterval from '@use-it/interval';
import "./musicAnalyzer.scss";
import MusicAnalyzerContext from '../../contexts/AudioStreamContext';


// const audioStream = new MusicAnalyzer();
const INTERVAL_FPS = 36;

export interface IThresholds {
  gain: number,
  totalAmplitude: number;
  beatEnergy: number;
}

interface IMusicAnalyzerProps {
  onFrameAdded: Function,
  onThresholdsUpdated: Function,
}


function MusicAnalyzerWorker({ onFrameAdded, onThresholdsUpdated }: IMusicAnalyzerProps) {

  const audioStream = useContext(MusicAnalyzerContext);

  const [currentAnalysisFrame, setCurrentAnalysisFrame] = useState<IAnalysisFrame>();
  const [thresholds, setThreasholds] = useState<IThresholds>({
    gain: 0,
    totalAmplitude: 0,
    beatEnergy: 0,
  });

  useInterval(() => {
    audioStream.tick(INTERVAL_FPS);
    const newAnalysisFrame = audioStream.getAnalysisFrame();
    setCurrentAnalysisFrame(newAnalysisFrame);
    onFrameAdded(newAnalysisFrame);
  }, 1000 / INTERVAL_FPS)



  if (!currentAnalysisFrame) {
    return <div className="addDevice">
      <p>Select an Audio Device to Monitor</p>
      <p>Stereo-Mix is Recommended</p>
      <AudioDevicePicker />
    </div>
  }

  const onSetThreashold = (thresholdName: string, val: number) => {
    const newThresholds = {...thresholds, [thresholdName] : val};
    setThreasholds(newThresholds);
    onThresholdsUpdated(newThresholds);

    if(thresholdName === "gain"){
      audioStream.setGain(val);
    }
  }
  
  return (
    <div>
      <div className="analyzerControlPanel">
        <div className="controls">
          <div>
            <SettableBand
              min={0}
              max={4}
              outputValue={thresholds.gain}
              onInputValueSet={(val: number) => onSetThreashold("gain", val)}
            />
            <div>Gain</div>
            <div>{thresholds.gain}</div>
          </div>
          {/* <div>
            <SettableBand
              outputValue={currentAnalysisFrame.totalAmplitude}
              onInputValueSet={(val: number) => onSetThreashold("totalAmplitude", val)}
            />
            <div>Amp</div>
            <div>{currentAnalysisFrame.totalAmplitude.toFixed(2)}</div>
          </div>
          <div>
            <SettableBand
              outputValue={currentAnalysisFrame.beatEnergy}
              onInputValueSet={(val: number) => onSetThreashold("beatEnergy", val)}
            />
            <div>Beat</div>
            <div>{currentAnalysisFrame.beatEnergy.toFixed(2)}</div>
          </div> */}
        </div>
        <div className="bands-wrapper">
          <div className="bands">
            {Array.from(currentAnalysisFrame.fftTable).map((bandValue: number) => (
              <SettableBand outputValue={bandValue/255} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


interface IAudioDevicePickerProps{
  onAudioDeviceSelected?: Function,
}

const AudioDevicePicker = ({onAudioDeviceSelected}: IAudioDevicePickerProps) => {

  const audioStream = useContext(MusicAnalyzerContext);

  const [selectedDevice, setSelectedDeviceState] = useState<MediaDeviceInfo|undefined>();
  const setSelectedDevice = (selectedDevice: MediaDeviceInfo | undefined) => {
    if(onAudioDeviceSelected){
      onAudioDeviceSelected(selectedDevice);
    }
    setSelectedDeviceState(selectedDevice);
  }
  
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    refreshAudioDevices();
  }, []);

  const refreshAudioDevices = async () => {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    const devices = await (await navigator.mediaDevices.enumerateDevices());
    setAudioDevices(devices);
  }
  
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

  if (!audioDevices) {
    return <p>Loading...</p>
  }

  return <div>
      <select className="audioDeviceSelect" name="audioDevices" id="cars" value={selectedDevice?.deviceId} onChange={onAudioDeviceSelectChange}>
        <option value="">(Select Audio Device)</option>
        {audioDevices.map((device, index) => <option key={index} value={device.deviceId}>{device.label}</option>)}
      </select>
  </div>
}


export { MusicAnalyzerWorker, AudioDevicePicker };
