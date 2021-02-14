import React, { useState } from "react";
import { AudioDevicePicker } from "../components/music/MusicAnalyzerWorker";
import { ButtplugScanButton } from "../components/buttplug/Buttplug";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./navbar.scss";

import { faCog } from "@fortawesome/free-solid-svg-icons";
import { SimpleModal } from "../components/modal/modal";
 

const Navbar = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    return(<div className="navbar">
        {/* <ButtplugScanButton /> */}
        <span className="spacer" />
        {/* <AudioDevicePicker /> */}
        <FontAwesomeIcon icon={faCog} className="buttonIcon" onClick={openModal}/>
        <SimpleModal isOpen={isModalOpen} close={closeModal} title={"Settings"}>
            <h2>Audio Device</h2>
            <AudioDevicePicker />

            {/* <h2>Hello</h2>
            <button>close</button>
            <div>I am a modal</div>
            <form>
            <input />
            <button>tab navigation</button>
            <button>stays</button>
            <button>inside</button>
            <button>the modal</button>
            </form> */}
        </SimpleModal>
        
    </div>);
}

export default Navbar;
