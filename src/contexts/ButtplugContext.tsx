import { ButtplugClient } from "buttplug";
import * as Buttplug from 'buttplug';
import { createContext, useEffect, useState } from "react";
import { IConnectedDevice, IConnectedDeviceFeature, setFeatureIntensity } from "../util/buttplugHelpers";

export const ButtplugContext = createContext({ 
    buttplugClient: undefined as ButtplugClient | undefined,
    buttplugScan : ()=>{},
    connectedButtplugs: [] as IConnectedDevice[],
});

export const ButtplugContextProvider = ({children} : any) => {

    const [buttplugClient, setButtplugClient] = useState<ButtplugClient>();
    const [connectedButtplugs, setConnectedButtplugs] = useState<IConnectedDevice[]>([]);

    useEffect(() => {
        const connectButtplug = async () => {
            await Buttplug.buttplugInit();
            const connector = new Buttplug.ButtplugEmbeddedConnectorOptions();
            const buttplugClient = new Buttplug.ButtplugClient("Buttplug Example Client");
            await buttplugClient.connect(connector);
            setButtplugClient(buttplugClient);
            console.log("Client connected");

        }
        connectButtplug();
    }, []);

    const buttplugScan = async () => {

        if (!buttplugClient) {
            return;
        }

        // Set up our DeviceAdded/DeviceRemoved event handlers before connecting. If
        // devices are already held to the server when we connect to it, we'll get
        // "deviceadded" events on successful connect.
        buttplugClient.addListener("deviceadded", (device) => {
            console.log(`Device Connected: ${device.Name}`);
            
            // console.log("buttplugClient currently knows about these devices:");
            // client.Devices.forEach((device) => console.log(`- ${device.Name}`));
            const {featureCount, maxDuration, stepCount} = device.messageAttributes(Buttplug.ButtplugDeviceMessageType.VibrateCmd);
  
            const features = new Array(featureCount).fill(null).map((_, index) => ({
                    index,
                    setIntensity: (intensity: number) => setFeatureIntensity(device, index, intensity),
                    lastIntensity: 0,
                    intensityQueue: [],
                    lastIntensityTime: new Date().getTime(),
                } as IConnectedDeviceFeature)
            );

            setConnectedButtplugs([
                ...connectedButtplugs,
                { 
                    device,
                    featureCount,
                    maxDuration,
                    stepCount,
                    features,
                } as IConnectedDevice
            ]);
        });
        buttplugClient.addListener("deviceremoved", (device) => {
            setConnectedButtplugs([...connectedButtplugs.filter(connectedDevice => connectedDevice.device !== device)]);
            console.log(`Device Removed: ${device.Name}`);
        });
        await buttplugClient.startScanning();
    }

    return(<ButtplugContext.Provider value={{ buttplugClient, buttplugScan, connectedButtplugs }}>
        {children}
    </ButtplugContext.Provider>)
}