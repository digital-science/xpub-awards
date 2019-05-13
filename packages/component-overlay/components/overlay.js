import React from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';

Modal.setAppElement(document.getElementById('root'));

const customStyles = {
    overlay: {
        backgroundColor: '#00000090',
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },

    content : {
        position: "unset",
        top: null,
        left: null,
        bottom: null,
        right: null,
        /*top                 : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)'*/
    }
};


function _OverlayHeader({className, heading, hasClose, close}) {
    return (
        <div className={className}>
            <span>{heading}</span>
            {hasClose ? <button onClick={close}>x</button> : null}
        </div>
    )
}

const OverlayHeader = styled(_OverlayHeader)`

    margin: -20px;
    padding: 20px;
    border-bottom: 1px solid #d1d1d1;
    
    > span {
        font-size: 28px;
        font-family: NovcentoSansWideLight, sans-serif;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    button {
        margin-right: 10px;
        float: right;
    }
`;



function Overlay({children, heading, hasClose, close, style, ...rest}) {
    return (
        <Modal style={style || customStyles} {...rest}>
            <OverlayHeader heading={"Assign New Award"} hasClose={hasClose} close={close} />
            {children}
        </Modal>
    );
}

export default Overlay;