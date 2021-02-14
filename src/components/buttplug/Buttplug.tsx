import React, { useEffect, useContext, useState } from "react";
import { IThresholds } from "../music/MusicAnalyzerWorker";
import { IAnalysisFrame } from "../../util/musicAnalyzer";
import { IConnectedDevice, prodFeature, setFeatureIntensity } from "../../util/buttplugHelpers";
import { ButtplugContext } from "../../contexts/ButtplugContext";
import ReactSlider from "react-slider";
import SettableBand from "../band/Band";

import "./Buttplug.scss";

interface IFeatureIntensity {
    beatEnergy: number,
    totalAmplitude: number,
}

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

interface IButtplugConnectedDeviceProps{
    device: IConnectedDevice
}
const ButtplugConnectedDevice = ({device} : IButtplugConnectedDeviceProps) => {

    const [intensities, setIntensities] = useState<IFeatureIntensity[]>([])

    useEffect(()=>{
        setIntensities(device.features.map((feature) => {
            return {
                beatEnergy: 0,
                totalAmplitude: 0,
            } as IFeatureIntensity
        }))
    }, [device])

    const updateIntensity = (featureIndex: number, intensityType: string, intensityValue: number) => {
        const newIntensities = [...intensities];
        if(intensityType === "beatEnergy"){
            newIntensities[featureIndex].beatEnergy = intensityValue;
        }
        if(intensityType === "totalAmplitude"){
            newIntensities[featureIndex].totalAmplitude = intensityValue;
        }
        
        setIntensities(newIntensities);
    };

    return(<div className="buttplugDevice">
        <h2>{device.device.Name}</h2>
        <div className="featureList">
            {intensities.map((featureIntensity, featureIndex) => 
                <div className="feature">
                    <h3>Amp</h3>
                    <SettableBand outputValue={featureIntensity.totalAmplitude} onInputValueSet={(value: any) => {updateIntensity(featureIndex, "totalAmplitude", value)}} />
                    <h3>BeatEnergy</h3>
                    <SettableBand outputValue={featureIntensity.beatEnergy} onInputValueSet={(value: any) => {updateIntensity(featureIndex, "beatEnergy", value)}}  />
                    <div>
                        <button onClick={()=> prodFeature(device, featureIndex)}>Prod Feature</button>
                    </div>
                </div>
            )}
        </div>
    </div>);
}

export const ButtplugConnectedDeviceList = () => {

    const { buttplugClient, connectedButtplugs } = useContext(ButtplugContext);

    if (buttplugClient) {
        return (
            <div>
                <div>{
                    connectedButtplugs.map(( connectedDevice ) => <ButtplugConnectedDevice device={connectedDevice} />
                    )
                }</div>
                <div>
                    <ButtplugScanButton />
                </div>
            </div>
        );
    }

    return (<div>
        <ButtplugScanButton />
    </div>);
}

export const ButtplugScanButton = () => {

    const { buttplugClient, buttplugScan } = useContext(ButtplugContext);

    if (buttplugClient) {
        return (<button onClick={buttplugScan}>Add Device</button>);
    }

    return <p>Loading...</p>
}