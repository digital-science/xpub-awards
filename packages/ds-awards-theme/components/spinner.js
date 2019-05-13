import React from 'react';
import './spinner.css';

function Spinner({center}) {
    return (
        <div className={`loader ${center ? 'center' : ''}`} />
    );
}

export default Spinner;