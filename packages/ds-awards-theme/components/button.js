import React from 'react';
import styled from 'styled-components';


const Button = ({tag, children=null, ...rest}) => {

    if(tag) {
        return <tag {...rest}>{children}</tag>
    }
    return <button {...rest}>{children}</button>
};

export default styled(Button)`
    
    background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #349fb4), color-stop(1, #3781a3));
    background:-moz-linear-gradient(top, #349fb4 5%, #3781a3 100%);
    background:-webkit-linear-gradient(top, #349fb4 5%, #3781a3 100%);
    background:-o-linear-gradient(top, #349fb4 5%, #3781a3 100%);
    background:-ms-linear-gradient(top, #349fb4 5%, #3781a3 100%);
    background:linear-gradient(to bottom, #349fb4 5%, #3781a3 100%);
    filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#349fb4', endColorstr='#3781a3',GradientType=0);
    background-color:#349fb4;
    -moz-border-radius:28px;
    -webkit-border-radius:28px;
    border-radius:28px;
    display:inline-block;
    cursor:pointer;
    color:#ffffff;
    font-family: NovcentoSansWideNormal;
    font-size:15px;
    padding:6px 24px;
    text-decoration:none;
    text-transform: uppercase;
        
    &:hover {
        background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #3781a3), color-stop(1, #349fb4));
        background:-moz-linear-gradient(top, #3781a3 5%, #349fb4 100%);
        background:-webkit-linear-gradient(top, #3781a3 5%, #349fb4 100%);
        background:-o-linear-gradient(top, #3781a3 5%, #349fb4 100%);
        background:-ms-linear-gradient(top, #3781a3 5%, #349fb4 100%);
        background:linear-gradient(to bottom, #3781a3 5%, #349fb4 100%);
        filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#3781a3', endColorstr='#349fb4',GradientType=0);
        background-color:#3781a3;
    }
    &:active {
        position:relative;
        top:1px;
    }

`;




