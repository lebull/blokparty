import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import { IAnalysisFrame } from '../../util/musicAnalyzer';
import { SettableBand, IndicatorBand } from '../band/Band';
import useInterval from '@use-it/interval';
import "./musicAnalyzer.scss";
import MusicAnalyzerContext from '../../contexts/AudioStreamContext';
import { Typography, Box, MenuItem, FormControl, InputLabel } from '@material-ui/core';
import { Select } from '@material-ui/core';


// const audioStream = new MusicAnalyzer();
const INTERVAL_FPS = 24;

export interface IThresholds {
  gain: number,
}

function MusicAnalyzerWorker() {

  const audioStream = useContext(MusicAnalyzerContext);

  const [currentAnalysisFrame, setCurrentAnalysisFrame] = useState<IAnalysisFrame>();
  const [thresholds, setThreasholds] = useState<IThresholds>({
    gain: 1,
  });

  useInterval(() => {
    audioStream.tick(INTERVAL_FPS);
    const newAnalysisFrame = audioStream.getAnalysisFrame();
    setCurrentAnalysisFrame(newAnalysisFrame);
  }, 1000 / INTERVAL_FPS)

  if (!currentAnalysisFrame) {
    return <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" p={3}>
      <Typography variant="h3">Select an Audio Device to Monitor</Typography> 
      <Typography variant="h4">Stereo-Mix is Recommended</Typography>
      <AudioDevicePicker />
    </Box>
  }

  const onSetThreashold = (thresholdName: string, val: number) => {
    const newThresholds = {...thresholds, [thresholdName] : val};
    setThreasholds(newThresholds);

    if(thresholdName === "gain"){
      audioStream.setGain(val);
    }
  }
  
  return (
    <div className="analyzerControlPanel">
      <div className="controls">
        <Typography variant="h5">Gain</Typography>
        <SettableBand
          min={0}
          max={4}
          outputValue={thresholds.gain}
          onInputValueSet={(val: number) => onSetThreashold("gain", val)}
          orientation="vertical"
          defaultValue={1}
        />
      </div>
      <div className="bands-wrapper">
        <Typography variant="h5">Levels</Typography>
        <div className="bands">
          {Array.from(currentAnalysisFrame.fftTable).map((bandValue: number) => (
            <IndicatorBand outputValue={bandValue/255} orientation="vertical"/>
          ))}
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
  
  const onAudioDeviceSelectChange = async (changeEvent: ChangeEvent<{ name?: string | undefined; value: unknown; }>) => {
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

  return(
    <FormControl fullWidth={true}>
        <InputLabel id="demo-simple-select-label">Audio Device</InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
          value={selectedDevice?.deviceId}
          onChange={onAudioDeviceSelectChange}
          fullWidth={true}
        >

        {audioDevices.map((device, index) => <MenuItem key={index} value={device.deviceId}>{device.label}</MenuItem>)}
      </Select>
    </FormControl>
  );
}


export { MusicAnalyzerWorker, AudioDevicePicker };
