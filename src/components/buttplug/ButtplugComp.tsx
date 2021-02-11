import React, { useState, useEffect } from "react";
import * as Buttplug from 'buttplug';
import { ButtplugClient, ButtplugClientDevice } from "buttplug";

const ButtplugComp = () => {

    const [loaded, setLoaded] = useState(false);

    const [devices, setDevices] = useState<Buttplug.ButtplugClientDevice[]>([]);

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
            setDevices([...devices, device]);
            // console.log("Client currently knows about these devices:");
            // client.Devices.forEach((device) => console.log(`- ${device.Name}`));
        });
        client.addListener("deviceremoved", (device) => console.log(`Device Removed: ${device.Name}`));

        // // Usual embedded connector setup.
        // const connector = new Buttplug.ButtplugEmbeddedConnectorOptions();
        // await client.connect(connector);

        // Now that everything is set up, we can scan.
        await client.startScanning();
    }

    const prodDevice = (device: ButtplugClientDevice) => {
        device.vibrate(0.1);
        setTimeout(() => { device.vibrate(0) }, 200);
    }

    useEffect(() => {
        const connectButtplug = async () => {
            await Buttplug.buttplugInit();
            const connector = new Buttplug.ButtplugEmbeddedConnectorOptions();
            const client = new Buttplug.ButtplugClient("Buttplug Example Client");
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
                <h4>Loaded</h4>
                <button onClick={scan}>Scan</button>
                <p>{devices.map((device) => <div id={`device:${device.Index}`}>{device.Name} - <button onClick={() => prodDevice(device)}>Prod</button></div>)}</p>
            </div>
        );
    }

    return <p>Loading...</p>
}

export default ButtplugComp;