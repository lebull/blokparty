import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { on } from 'events';
import { AudioStream } from './util/audioStream';
import { IBand } from './util/audioStream';
import SettableBand from './components/band/Band';
import ButtplugComp from "./components/buttplug/ButtplugComp";
import MusicAnalyzer from './components/music/MusicAnalyzer';


const audioStream = new AudioStream();
const INTERVAL_FPS = 12;

function App() {

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<MediaDeviceInfo>();
  const [bands, setBands] = useState<IBand[]>([]);
  const [tickNum, setTickNum] = useState<Number>(0);

  const refreshAudioDevices = async () => {
    await navigator.mediaDevices.getUserMedia({audio: true});
    const devices = await (await navigator.mediaDevices.enumerateDevices());
    setAudioDevices(devices);
  }

  const onDeviceSelected = async (device: MediaDeviceInfo) => {
    const stream = await navigator.mediaDevices.getUserMedia({audio: { deviceId: { exact: device.deviceId }}});
    console.log(stream);
    setSelectedDevice(device);
    audioStream.connectStream(stream);
  };

  useEffect(()=>{
    refreshAudioDevices();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      audioStream.tick()
      setBands(audioStream.bands);
      setTickNum(audioStream.tickNum);
    }, 1000/INTERVAL_FPS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <ButtplugComp />
      <hr />
      <MusicAnalyzer />


    </div>
  );
}

export default App;
