import React from "react";
import "./Band.scss";
import ReactSlider from 'react-slider'

interface ISettableBandParams {
    outputValue: number;
    onInputValueSet?: Function;
    min?: number;
    max?: number;
}

const SettableBand = ({ outputValue, onInputValueSet, min=0, max=1, }: ISettableBandParams) => {

    const onSliderValueChange = (value : any) => { 
        if(onInputValueSet){
            onInputValueSet(value);
        }
    }
    
    const getPercentHeight = () =>{
        const outputValueScales = ((outputValue - min) / (max-min));
        return (1 - outputValueScales) * 100;
    }

    return (<div className="band">
        <div className="background"></div>
        <div className="negativeBackground-wrapper">
            <div className="negativeBackground" style={{ "height": `${getPercentHeight()}%` }}></div>
        </div>
        { onInputValueSet ? 
            <ReactSlider
                className="band-slider"
                thumbClassName="band-thumb"
                trackClassName="band-track"
                defaultValue={0.9}
                min={min}
                max={max}
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