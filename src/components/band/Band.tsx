import React from "react";
import "./Band.scss";
import ReactSlider from 'react-slider'

interface ISettableBandParams {
    outputValue: number;
    onInputValueSet: Function;
}

const SettableBand = ({ outputValue, onInputValueSet }: ISettableBandParams) => {

    const onSliderValueChange = (value : any) => { onInputValueSet(value); }

    return (<div className="band">
        <div className="background"></div>
        <div className="negativeBackground-wrapper">
            <div className="negativeBackground" style={{ "height": `${(1 - outputValue) * 100}%` }}></div>
        </div>
        { onInputValueSet ? 
            <ReactSlider
                className="band-slider"
                thumbClassName="band-thumb"
                trackClassName="band-track"
                defaultValue={0.9}
                min={0}
                max={1}
                invert={true}
                step={0.01}
                onChange={onSliderValueChange}
                orientation="vertical"
                // renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
            /> : ""
        }
    </div>)
}

export default SettableBand;