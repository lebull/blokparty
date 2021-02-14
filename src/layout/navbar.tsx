import React from "react";
import { AudioDevicePicker } from "../components/music/MusicAnalyzerWorker";
import { ButtplugScanButton } from "../components/buttplug/Buttplug";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./navbar.scss";
import { faCog } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
    return(<div className="navbar">
        {/* <ButtplugScanButton /> */}
        <span className="spacer" />
        {/* <AudioDevicePicker /> */}
        <FontAwesomeIcon icon={faCog} className="icon"/>
    </div>);
}

export default Navbar;