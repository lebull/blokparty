
import * as Buttplug from "buttplug";
import { ButtplugClientDevice } from "buttplug";

export interface IConnectedDevice {
    device: ButtplugClientDevice,
    featureCount: number,
    stepCount: number[],
    maxDuration: number,
    features: Array<IConnectedDeviceFeature>,
}

export interface IConnectedDeviceFeature {
    index: number,
    setIntensity: Function,
    lastIntensity: number,
    intensityQueue: number[];
    lastIntensityTime: number;
}

export const prodFeature = (connectedDevice: IConnectedDevice, featureIndex: number) => {
    const intensity = 0.5;
    setFeatureIntensity(connectedDevice, featureIndex, intensity);
    setTimeout(() => { setFeatureIntensity(connectedDevice, featureIndex, 0); }, 200);
}

export const setFeatureIntensity = (connectedDevice: IConnectedDevice, featureIndex: number, intensity: number) => {
    const feature =  connectedDevice.features[featureIndex];
    const currentTime = new Date().getTime();
    feature.intensityQueue = [intensity, ...feature.intensityQueue].slice(0, 100);
    let newIntensity =  feature.intensityQueue.reduce((avg, intensity) => avg + intensity)/feature.intensityQueue.length;
    // let newIntensity = Math.max(...feature.intensityQueue);
    newIntensity = Math.min(Math.round(newIntensity * 20)/20, 1);

    if(newIntensity !== feature.lastIntensity && (currentTime - feature.lastIntensityTime > 1000/12)){
        console.log(`Vib: ${newIntensity}`);
        connectedDevice.features[featureIndex].lastIntensity = newIntensity;
        connectedDevice.device.vibrate([ new Buttplug.VibrationCmd(featureIndex, newIntensity) ]);
        feature.intensityQueue = [];
        feature.lastIntensityTime = currentTime;
    }
}