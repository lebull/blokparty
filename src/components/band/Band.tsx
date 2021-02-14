import React from "react";
import "./Band.scss";
import ReactSlider from 'react-slider'


interface ISettableBandParams {
    outputValue: number;
    onInputValueSet?: Function;
    min?: number;
    max?: number;
    orientation?: "horizontal" | "vertical";
}

const SettableBand = ({ outputValue, onInputValueSet, min=0, max=1, orientation="horizontal"}: ISettableBandParams) => {

    const onSliderValueChange = (value : any) => { 
        if(onInputValueSet){
            onInputValueSet(value);
        }
    }
    
    const getPercentHeight = (reverse : boolean = false) =>{
        const outputValueScales = ((outputValue - min) / (max-min));
        if(reverse){
            return outputValueScales * 100;
        }
        return (1 - outputValueScales) * 100;
    }

    return (<div className={`band band--${orientation}`}>
        
            { orientation === "horizontal" ?
                <div className="positiveBackground-wrapper">
                    <div className="positiveBackground" style={{ "width": `${getPercentHeight(true)}%` }}></div>
                </div>
                :
                <div className="negativeBackground-wrapper">
                    <div className="negativeBackground" style={{ "height": `${getPercentHeight()}%` }}></div>
                </div>
            }
            
    
        { onInputValueSet ? 
            <ReactSlider
                className={`band-slider band-slider--${orientation}`}
                thumbClassName={`band-thumb band-thumb--${orientation}`}
                trackClassName={`band-track band-track--${orientation}`}
                defaultValue={0.9}
                min={min}
                max={max}
                invert={orientation === "vertical"}
                step={0.01}
                onChange={onSliderValueChange}
                orientation={orientation}
                // renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
            /> : ""
        }
    </div>)
}

export default SettableBand;