import React, { useEffect, useContext, useState } from "react";
import { IConnectedDevice, prodFeature, setFeatureIntensity } from "../../util/buttplugHelpers";
import { ButtplugContext } from "../../contexts/ButtplugContext";
import { SettableBand } from "../band/Band";

import "./Buttplug.scss";
import MusicAnalyzerContext from "../../contexts/AudioStreamContext";
import { Box, Button, Paper, Typography } from "@material-ui/core";

interface IFeatureIntensity {
    beatEnergy: number,
    totalAmplitude: number,
}

interface IButtplugConnectedDeviceProps {
    device: IConnectedDevice
}
const ButtplugConnectedDevice = ({ device }: IButtplugConnectedDeviceProps) => {

    const [intensities, setIntensities] = useState<IFeatureIntensity[]>([])
    const musicAnalyzer = useContext(MusicAnalyzerContext);
    // const { buttplugClient, connectedButtplugs } = useContext(ButtplugContext);
    const analysisFrame = musicAnalyzer.getAnalysisFrame();

    useEffect(() => {
        setIntensities(device.features.map((feature) => {
            return {
                beatEnergy: 0,
                totalAmplitude: 0,
            } as IFeatureIntensity
        }))
    }, [device]);

    const updateIntensity = (featureIndex: number, intensityType: string, intensityValue: number) => {
        const newIntensities = [...intensities];
        if (intensityType === "beatEnergy") {
            newIntensities[featureIndex].beatEnergy = intensityValue;
        }
        if (intensityType === "totalAmplitude") {
            newIntensities[featureIndex].totalAmplitude = intensityValue;
        }

        setIntensities(newIntensities);
    };

    //This is dirty, literally calling updates to the device from the rendering of this element.
    //Also, let's try to make a method for setIntensity on a IConnectedDeviceFeature.  I think it's NYI
    device.features.forEach((feature, featureIndex) => {
        if (intensities.length === 0 || !analysisFrame) return;
        const newIntensity = analysisFrame.beatEnergy * intensities[featureIndex].beatEnergy
            + analysisFrame.totalAmplitude * intensities[featureIndex].totalAmplitude
        setFeatureIntensity(
            device,
            featureIndex,
            newIntensity,
        )
    })


    return (<Paper>
        <Box p={3} m={3}>
            <Typography variant="h2">{device.device.Name}</Typography>
            <Box display="flex" flexDirection="row" >
                {intensities.map((_, featureIndex) =>
                    <Box p={3} flexGrow={1}>
                        {analysisFrame ?
                            <>
                                <Typography variant="h5">Amp</Typography>
                                <SettableBand outputValue={musicAnalyzer.getAnalysisFrame().totalAmplitude} onInputValueSet={(value: any) => { updateIntensity(featureIndex, "totalAmplitude", value) }} />
                                <Typography variant="h5">BeatEnergy</Typography>
                                <SettableBand outputValue={musicAnalyzer.getAnalysisFrame().beatEnergy} onInputValueSet={(value: any) => { updateIntensity(featureIndex, "beatEnergy", value) }} />
                                <Box p={1} display="flex" justifyContent="center">
                                    <Button variant="outlined" onClick={() => prodFeature(device, featureIndex)}>Identify</Button>
                                </Box>
                            </>
                            :
                            <div><p>Waiting for Audio</p></div>
                        }

                    </Box>
                )}
            </Box>
        </Box>
    </Paper>);
}

export const ButtplugConnectedDeviceList = () => {

    const { buttplugClient, connectedButtplugs } = useContext(ButtplugContext);


    const [time, setTime] = useState(Date.now());

    useEffect(() => {
        setInterval(() => setTime(Date.now()), 1000 / 60);
    }, []);

    if (buttplugClient) {
        return (
            <div>
                <div>{
                    connectedButtplugs.map((connectedDevice) => <ButtplugConnectedDevice device={connectedDevice} />
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
        return (
        <Box display="flex" justifyContent="center">
            <Button color="primary" variant="contained" onClick={buttplugScan} size="large">
                Add Device
            </Button>
        </Box>);
    }

    return <p>Loading...</p>
}