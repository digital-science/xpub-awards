import React from 'react';
import styled from 'styled-components';

import PersonIcon from 'ds-awards-theme/static/person.svg';


const Header = styled.header`
    min-height: 68px;
    line-height: 68px;
    margin-left: 30px;
    font-size: 36px;
    font-family: NovcentoSansWideLight, sans-serif;
    text-transform: uppercase;
    color: #3e3476;
`;

const Person = styled.div`
    line-height: 36px;
    height: 36px;
    padding: 16px;
    display: inline-block;
    float: right;

    > img {
        height: 36px;
    }
    
    > span {
        margin-left: 10px;
    
        color: black;
        text-transform: none;
        font-size: 15px;
        font-family: AcuminProLight, sans-serif;
            
        height: 100%;
        display: inline-block;
        vertical-align: top;
    }
`;

export default ({hideUser=false}) => {
    return (
        <Header>
            Award Submission Portal
            {!hideUser ? (
                <Person>
                    <img alt="person" src={PersonIcon} />
                    <span>Jared Watts</span>
                </Person>)
                : null}
        </Header>
    );
};