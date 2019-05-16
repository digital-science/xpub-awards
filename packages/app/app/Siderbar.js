import React from 'react';
import styled from 'styled-components';

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

