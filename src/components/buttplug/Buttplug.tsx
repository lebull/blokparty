import React, { useEffect, useContext, useState } from "react";
import { IThresholds } from "../music/MusicAnalyzerWorker";
import { IAnalysisFrame } from "../../util/musicAnalyzer";
import { IConnectedDevice, prodFeature, setFeatureIntensity } from "../../util/buttplugHelpers";
import { ButtplugContext } from "../../contexts/ButtplugContext";
import { SettableBand } from "../band/Band";

import "./Buttplug.scss";
import MusicAnalyzerContext from "../../contexts/AudioStreamContext";

interface IFeatureIntensity {
    beatEnergy: number,
    totalAmplitude: number,
}

// interface IButtplugProps {
//     frame: IAnalysisFrame | undefined,
// }

// export const ButtplugToMusicWorker = ({frame} : IButtplugProps) => {

//     const { connectedButtplugs } = useContext(ButtplugContext);

//     useEffect(()=>{
//         if(frame && connectedButtplugs[0]){
//             const intensity = (Math.round((frame.beatEnergy * thresholds.beatEnergy + frame.totalAmplitude*thresholds.totalAmplitude) * 10)/10);
//             setFeatureIntensity(connectedButtplugs[0], 0, Math.max(Math.min(intensity, 1), 0));
//         }
//     }, [frame, thresholds, connectedButtplugs]);

//     return <></>;

// }

interface IButtplugConnectedDeviceProps{
    device: IConnectedDevice
}
const ButtplugConnectedDevice = ({device} : IButtplugConnectedDeviceProps) => {

    const [intensities, setIntensities] = useState<IFeatureIntensity[]>([])
    const musicAnalyzer = useContext(MusicAnalyzerContext);
    // const { buttplugClient, connectedButtplugs } = useContext(ButtplugContext);
    const analysisFrame = musicAnalyzer.getAnalysisFrame();

    useEffect(()=>{
        setIntensities(device.features.map((feature) => {
            return {
                beatEnergy: 0,
                totalAmplitude: 0,
            } as IFeatureIntensity
        }))
    }, [device]);

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

    //This is dirty, literally calling updates to the device from the rendering of this element.
    //Also, let's try to make a method for setIntensity on a IConnectedDeviceFeature.  I think it's NYI
    device.features.forEach((feature, featureIndex) => {
        if(intensities.length === 0) return;
        const newIntensity = analysisFrame.beatEnergy * intensities[featureIndex].beatEnergy
            + analysisFrame.totalAmplitude * intensities[featureIndex].totalAmplitude
        setFeatureIntensity(
            device,
            featureIndex,
            newIntensity,
        )
        // feature.setIntensity(
        //     analysisFrame.beatEnergy * intensities[featureIndex].beatEnergy
        //     + analysisFrame.totalAmplitude * intensities[featureIndex].totalAmplitude
        // );
    })


    return(<div className="buttplugDevice">
        <h2>{device.device.Name}</h2>
        <div className="featureList">
            {intensities.map((_, featureIndex) => 
                <div className="feature">
                    <h3>Amp</h3>
                    <SettableBand outputValue={musicAnalyzer.getAnalysisFrame().totalAmplitude} onInputValueSet={(value: any) => {updateIntensity(featureIndex, "totalAmplitude", value)}} />
                    <h3>BeatEnergy</h3>
                    <SettableBand outputValue={musicAnalyzer.getAnalysisFrame().beatEnergy} onInputValueSet={(value: any) => {updateIntensity(featureIndex, "beatEnergy", value)}}  />
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


    const [time, setTime] = useState(Date.now());

    useEffect(() => {
        setInterval(() => setTime(Date.now()), 1000/60);
    }, []);

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