import React from "react";
import "./Band.scss";

interface ISettableBandParams {
    outputValue: number;
    onInputValueSet: Function;
}

const SettableBand = ({outputValue, onInputValueSet} : ISettableBandParams) => <div className="band">
    <div className="background"></div>
    <div className="negativeBackground" style={{"height": `${(1-outputValue) * 100}%`}}></div>
</div>

export default SettableBand;