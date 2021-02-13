import React from "react";
import { AudioDevicePicker } from "../components/music/MusicAnalyzerWorker";
import { ButtplugScanButton } from "../components/buttplug/Buttplug";

const Navbar = () => {
    return(<div>
        <AudioDevicePicker />
        <ButtplugScanButton />
    </div>);
}

export default Navbar;