import React from 'react';
import styled from 'styled-components';

const Sidebar = styled.nav`
    background: rgb(62,56,120);
    background: linear-gradient(180deg, rgba(62,56,120,1) 0%, rgba(51,175,188,1) 100%);
    
    > div {
        padding: 15px 25px;
    }
    
    > div.selected {
        background: #33afbc;
    }
    
`;

export default () => {
    return (
        <Sidebar className="HolyGrail-nav">

            <div className="selected">
                <img src="/images/home.svg" />
            </div>
            <div>
                <img src="/images/expand.svg" />
            </div>
            <div>
                <img src="/images/award.svg" />
            </div>

        </Sidebar>
    );
};

