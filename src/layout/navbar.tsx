import React, { useState } from "react";
import { AudioDevicePicker } from "../components/music/MusicAnalyzerWorker";
import "./navbar.scss";
import { SimpleModal } from "../components/modal/modal";
import { AppBar, IconButton, Toolbar, Box, Typography } from "@material-ui/core";
import SettingsIcon from '@material-ui/icons/Settings';


const Navbar = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    return (<>
        <AppBar className="navbar" position="static">
            <Toolbar>
                <Typography variant="h6">BleatPulse</Typography>
                <Box display='flex' flexGrow={1} />
                <IconButton color="inherit" size="medium" aria-label="settings" onClick={openModal}>
                    <SettingsIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
        <SettingsModal isOpen={isModalOpen} close={closeModal} />
    </>);
}

export default Navbar;

const SettingsModal = ({ isOpen, close }: any) => <SimpleModal isOpen={isOpen} close={close} title={"Settings"}>
    <h2>Audio Device</h2>
    <AudioDevicePicker />
</SimpleModal>