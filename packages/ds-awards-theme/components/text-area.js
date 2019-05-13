import React from 'react';
import styled from 'styled-components';
import BorderedElement from './bordered-element'


const _TextArea = ({children=null, ...rest}) => {
    return <textarea{...rest}>{children}</textarea>
};

const TextArea = BorderedElement(_TextArea);

export default styled(TextArea)`
    font-family: ProximaNovaLight;
    font-size: 16px;
    color: black;
`;
