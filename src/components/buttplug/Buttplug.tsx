import React, { useState, useEffect } from "react";
import * as ButtplugIO from 'buttplug';
import { ButtplugClient, ButtplugClientDevice } from "buttplug";
import { IThresholds } from "../music/MusicAnalyzerWorker";
import { IAnalysisFrame } from "../../util/musicAnalyzer";

interface IConnectedDeviceFeature {
    index: number,
    setIntensity: Function,
    lastIntensity: number,
}

interface IConnectedDevice {
    device: ButtplugClientDevice,
    featureCount: number,
    stepCount: number[],
    maxDuration: number,
    features: Array<IConnectedDeviceFeature>,
}

interface IButtplugProps {
    frame: IAnalysisFrame | undefined,
    thresholds: IThresholds
}

const Buttplug = ({frame, thresholds} : IButtplugProps) => {

    const [loaded, setLoaded] = useState(false);

    const [connectedDevices, setConnectedDevices] = useState<IConnectedDevice[]>([]);

    const [client, setClient] = useState<ButtplugClient>();

    const scan = async () => {

        if (!client) {
            return;
        }

        // Set up our DeviceAdded/DeviceRemoved event handlers before connecting. If
        // devices are already held to the server when we connect to it, we'll get
        // "deviceadded" events on successful connect.
        client.addListener("deviceadded", (device) => {
            console.log(`Device Connected: ${device.Name}`);
            
            // console.log("Client currently knows about these devices:");
            // client.Devices.forEach((device) => console.log(`- ${device.Name}`));
            const {featureCount, maxDuration, stepCount} = device.messageAttributes(ButtplugIO.ButtplugDeviceMessageType.VibrateCmd);
  
            const features = new Array(featureCount).fill(null).map((_, index) => ({
                    index,
                    setIntensity: (intensity: number) => setFeatureIntensity(device, index, intensity),
                    lastIntensity: 0,
                } as IConnectedDeviceFeature)
            );

            setConnectedDevices([
                ...connectedDevices,
                { 
                    device,
                    featureCount,
                    maxDuration,
                    stepCount,
                    features,
                } as IConnectedDevice
            ]);
        });
        client.addListener("deviceremoved", (device) => console.log(`Device Removed: ${device.Name}`));
        await client.startScanning();
    }

    useEffect(()=>{
        
        if(frame && connectedDevices[0]){
            const intensity = (Math.round((frame.beatEnergy * thresholds.beatEnergy + frame.totalAmplitude*thresholds.totalAmplitude) * 10)/10);
            setFeatureIntensity(connectedDevices[0], 0, Math.max(Math.min(intensity, 1), 0));
        }
    }, [frame, thresholds, connectedDevices])

    const prodFeature = (connectedDevice: IConnectedDevice, featureIndex: number) => {
        const intensity = 0.5;
        setFeatureIntensity(connectedDevice, featureIndex, intensity);
        setTimeout(() => { setFeatureIntensity(connectedDevice, featureIndex, 0); }, 200);
    }

    const setFeatureIntensity = (connectedDevice: IConnectedDevice, featureIndex: number, intensity: number) => {
        
        const lastIntensity = connectedDevice.features[featureIndex].lastIntensity;
        if(lastIntensity !== intensity){
            console.log(`Vib: ${intensity}`);
            connectedDevice.features[featureIndex].lastIntensity = intensity;
            connectedDevice.device.vibrate([ new ButtplugIO.VibrationCmd(featureIndex, intensity) ]);
        }
    }

    useEffect(() => {
        const connectButtplug = async () => {
            await ButtplugIO.buttplugInit();
            const connector = new ButtplugIO.ButtplugEmbeddedConnectorOptions();
            const client = new ButtplugIO.ButtplugClient("Buttplug Example Client");
            await client.connect(connector);
            setClient(client);
            setLoaded(true);
            console.log("Client connected");

        }
        connectButtplug();
    }, []);

    if (loaded) {
        return (
            <div>
                <h4>Devices</h4>
                <button onClick={scan}>Scan</button>
                <div>{
                    connectedDevices.map(( connectedDevice ) => (
                        <div key={`device:${connectedDevice.device.Index}`}>
                            <h3>{connectedDevice.device.Name}</h3>
                            { connectedDevice.features.map((feature) => (
                                <button key={feature.index} onClick={() => prodFeature(connectedDevice, feature.index)}>Prod</button>
                            ))}
                        </div>
                    ))
                }</div>
            </div>
        );
    }

    return <p>Loading...</p>
}

export default Buttplug;