import React from 'react';
import styled from 'styled-components';

import HomeIcon from 'ds-awards-theme/static/home.svg';
import ExpandIcon from 'ds-awards-theme/static/expand.svg';
import AwardIcon from 'ds-awards-theme/static/award.svg';


const Sidebar = styled.nav`
    background: rgb(62,56,120);
    background: linear-gradient(180deg, rgba(62,56,120,1) 0%, rgba(51,175,188,1) 100%);
    
    order: -1;
    width: 76px;
    padding-top: 7px;
    
    > div {
        padding: 15px 25px;
    }
    
    > div.selected {
        background: #33afbc;
    }
    
    @media (min-width: 768px) {
        flex: 0 0 76px;
    }
`;

export default () => {
    return (
        <Sidebar>
            <div className="selected">
                <img alt="Home" src={HomeIcon} />
            </div>
            <div>
                <img alt="Expand" src={ExpandIcon} />
            </div>
            <div>
                <img alt="Award" src={AwardIcon} />
            </div>
        </Sidebar>
    );
};

