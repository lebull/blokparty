import React from "react";
import "./Band.scss";
import ReactSlider from 'react-slider'


interface ISettableBandParams extends IIndicatorBand {
    onInputValueSet: Function;
    defaultValue?: number;
}

const SettableBand = ({ outputValue, onInputValueSet, min=0, max=1, orientation="horizontal", defaultValue=0}: ISettableBandParams) => {

    const onSliderValueChange = (value : any) => { 
        if(onInputValueSet){
            onInputValueSet(value);
        }
    }
    return (<div className={`settableBand settableBand__${orientation}`}>
        <IndicatorBand outputValue={outputValue} min={min} max={max} orientation={orientation} />
        <ReactSlider
            className={`slider slider__${orientation}`}
            thumbClassName={`thumb`}
            trackClassName={`track`}
            defaultValue={defaultValue}
            min={min}
            max={max}
            invert={orientation === "vertical"}
            step={0.01}
            onChange={onSliderValueChange}
            orientation={orientation}
            // renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
        />
    </div>)
}

interface IIndicatorBand{
    outputValue: number;
    min?: number;
    max?: number;
    orientation?: "horizontal" | "vertical";
}

const IndicatorBand = ({ outputValue, min=0, max=1, orientation="horizontal"}: IIndicatorBand) => {
    
    const getPercentHeight = (reverse : boolean = false) =>{
        const outputValueScales = ((outputValue - min) / (max-min));
        if(reverse){
            return outputValueScales * 100;
        }
        return (1 - outputValueScales) * 100;
    }

    return (<div className={`band band__${orientation}`}>
            { orientation === "horizontal" ?
                <div className="positiveBackground-wrapper">
                    <div className="positiveBackground" style={{ "width": `${getPercentHeight(true)}%` }}></div>
                </div>
                :
                <div className="negativeBackground-wrapper">
                    <div className="negativeBackground" style={{ "height": `${getPercentHeight()}%` }}></div>
                </div>
            }
    </div>)
}

export { IndicatorBand, SettableBand }