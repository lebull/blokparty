
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
}

export const prodFeature = (connectedDevice: IConnectedDevice, featureIndex: number) => {
    const intensity = 0.5;
    setFeatureIntensity(connectedDevice, featureIndex, intensity);
    setTimeout(() => { setFeatureIntensity(connectedDevice, featureIndex, 0); }, 200);
}

export const setFeatureIntensity = (connectedDevice: IConnectedDevice, featureIndex: number, intensity: number) => {
    
    const lastIntensity = connectedDevice.features[featureIndex].lastIntensity;
    if(lastIntensity !== intensity){
        console.log(`Vib: ${intensity}`);
        connectedDevice.features[featureIndex].lastIntensity = intensity;
        connectedDevice.device.vibrate([ new Buttplug.VibrationCmd(featureIndex, intensity) ]);
    }
}