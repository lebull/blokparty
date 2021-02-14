import React, { useEffect, useContext } from "react";
import { IThresholds } from "../music/MusicAnalyzerWorker";
import { IAnalysisFrame } from "../../util/musicAnalyzer";
import { prodFeature, setFeatureIntensity } from "../../util/buttplugHelpers";
import { ButtplugContext } from "../../contexts/ButtplugContext";

interface IButtplugProps {
    frame: IAnalysisFrame | undefined,
    thresholds: IThresholds
}

export const ButtplugToMusicWorker = ({frame, thresholds} : IButtplugProps) => {

    const { connectedButtplugs } = useContext(ButtplugContext);

    useEffect(()=>{
        if(frame && connectedButtplugs[0]){
            const intensity = (Math.round((frame.beatEnergy * thresholds.beatEnergy + frame.totalAmplitude*thresholds.totalAmplitude) * 10)/10);
            setFeatureIntensity(connectedButtplugs[0], 0, Math.max(Math.min(intensity, 1), 0));
        }
    }, [frame, thresholds, connectedButtplugs]);

    return <></>;

}

export const ButtplugConnectedDeviceList = () => {

    const { buttplugClient, connectedButtplugs } = useContext(ButtplugContext);

    if (buttplugClient) {
        return (
            <div>{
                connectedButtplugs.map(( connectedDevice ) => (
                    <div key={`device:${connectedDevice.device.Index}`}>
                        <h3>{connectedDevice.device.Name}</h3>
                        { connectedDevice.features.map((feature) => (
                            <button key={feature.index} onClick={() => prodFeature(connectedDevice, feature.index)}>Prod</button>
                        ))}
                    </div>
                ))
            }</div>
        );
    }

    return <p>Loading...</p>
}

export const ButtplugScanButton = () => {

    const { buttplugClient, buttplugScan } = useContext(ButtplugContext);

    if (buttplugClient) {
        return (<button onClick={buttplugScan}>Scan</button>);
    }

    return <p>Loading...</p>
}
