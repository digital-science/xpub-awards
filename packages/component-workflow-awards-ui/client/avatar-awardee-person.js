import React from 'react';
import styled from 'styled-components';

import PersonIcon from 'ds-awards-theme/static/person.svg';


export default styled(({className, awardee}) => {

    return (
        <span className={className}>
            <AwardeePersonIcon />
            {awardee.firstName} {awardee.lastName}
            {awardee.affiliation ? <AwardeeAffiliation>{awardee.affiliation}</AwardeeAffiliation> : null}
        </span>
    );
})`
    display: inline-block;
    font-family: ProximaNovaLight,sans-serif;
    padding: 2px 5px;
    background: #ececec;
    border: 1px dashed #b7b7b7;
    border-radius: 5px;
`;


const AwardeePersonIcon = styled(({className}) => {
    return <div className={className}><img src={PersonIcon} /></div>;
})`
    display: inline-block;
    width: 12px;
    height: 12px;
    vertical-align: top;
    margin-top: 1px;
    margin-right: 3px;
    
    > img {
        opacity: 0.25;
    }
`;

const AwardeeAffiliation = styled.span`
  color: #5f5f5f;
  
  :before {
    content: " / ";
    color: #cccccc;
  }
`;