


import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Modal from 'react-modal';
import "./modal.scss";

interface ISettingsModalProps{
    isOpen: boolean,
    close: Function,
    title: string,
    children: any,
}

const SimpleModal = ({isOpen, close, title, children}: ISettingsModalProps) => {


    return(<Modal
        isOpen={isOpen}
        onAfterOpen={()=>{}}
        onRequestClose={()=>{close()}}
        className="modal--base-content"
        overlayClassName="modal--overlay"
        contentLabel={title}
    >
        <div className="topContent">
            <h2 className="title">{title}</h2>
            <span className="spacer"/>
            <FontAwesomeIcon icon={faTimes} className="closeButton" onClick={()=>{close()}}/>
        </div>
        <div className="content">
            {children}
        </div>
    </Modal>);
}

export { SimpleModal };