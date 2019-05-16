import React from 'react';
import config from 'config';
import styled from 'styled-components';

import { withFormField, fetchFields, withFormFieldData } from 'component-task-form/client';
import useUnlinkIdentityFromAwardee from './mutations/unlinkIdentityFromAwardee';

import { BlockLabel } from 'ds-awards-theme/components/label';
import { SmallPlainButton } from 'ds-awards-theme/components/button';

const { orcidUrl, orcidDisplayUrl } = config['orcid-paths'];


function FormFieldAwardeeORCIDLink({ binding, formData, refetchFormData, instanceId, options={} }) {

    const [awardee, _] = withFormFieldData(formData, binding, null);
    const unlinkIdentityFromAwardeeMutation = useUnlinkIdentityFromAwardee();

    if(!awardee) {
        return <span>No awardee present to link to ORCID identity.</span>;
    }

    const { identity, id: awardeeId } = awardee;

    const registerORCIDIdentityToAwardee = () => {

        console.log("Link ORCID with identity:");
        console.dir(awardee);

        const redirect = encodeURIComponent(window.location.pathname);
        const queryAcceptanceId = encodeURIComponent(instanceId);
        const queryAwardeeId = encodeURIComponent(awardeeId);

        window.location = `/orcid/link?acceptanceId=${queryAcceptanceId}&awardeeId=${queryAwardeeId}&redirect=${redirect}`;
    };

    const unlinkIdentityFromAwardee = () => {

        console.log("Unlink ORCID with identity:");
        console.dir(awardee);
        console.dir(identity);

        if(!awardeeId) {
            return;
        }

        unlinkIdentityFromAwardeeMutation(awardeeId).then(() => {
            return refetchFormData();
        });
    };

    function orcidLink(identity, display) {
        const url = display ? orcidDisplayUrl : orcidUrl;
        return `https://${url}/${identity.identityId}`;
    }

    return (
        <ORCIDLinkHolder className={identity ? "linked" : "unlinked"}>

            {options.label ? <BlockLabel>{options.label}</BlockLabel> : null}

            <div className="identity-holder">
                { identity ?
                    <LinkedORCIDInfoSection awardee={awardee} identity={identity} orcidLink={orcidLink(identity)}
                        orcidDisplayLink={orcidLink(identity, true)} unlinkIdentityFromAwardee={unlinkIdentityFromAwardee} />
                    :
                    <SetupORCIDInfoSection awardee={awardee} registerORCIDIdentityToAwardee={registerORCIDIdentityToAwardee}/>
                }
            </div>
        </ORCIDLinkHolder>
    );
}


const ORCIDLinkHolder = styled.div`
  display: inline-block;
  
  &.unlinked {
    background: aliceblue;
    padding: 10px;
    border-radius: 5px;
    border: 1px dashed #9dcef9;
  }
`;



const LinkedORCIDInfoSection = styled(({className, awardee, identity, orcidLink, orcidDisplayLink, unlinkIdentityFromAwardee}) => {

    return (
        <div className={className}>

            <LinkedORCIDHolder>
                <a href="https://orcid.org">
                    <img alt="ORCID logo" src="https://orcid.org/sites/default/files/images/orcid_16x16.png" width="16" height="16" />
                </a>
                <a href={orcidLink}>{orcidDisplayLink}</a>
                <span> ({identity.displayName})</span>
            </LinkedORCIDHolder>

            <div className="unlink-holder">
                <SmallPlainButton onClick={unlinkIdentityFromAwardee}>Unlink ORCiD</SmallPlainButton>
            </div>
        </div>
    );
})`

`;

const LinkedORCIDHolder = styled.div`
    font-family: ProximaNovaLight, sans-serif;
    background: aliceblue;
    padding: 10px;
    border-radius: 5px;
    border: 1px dashed #9dcef9;
    margin-bottom: 5px;
    
    > a {
      color: initial;
    }
    
    img {
      vertical-align: top;
      padding-right: 5px;
    }
    
    span {
      color: #616161;
    }
`;


const SetupORCIDInfoSection = styled(({className, awardee, registerORCIDIdentityToAwardee}) => {

    return (
        <div className={className}>
            <ORCIDLinkButton registerORCIDIdentityToAwardee={registerORCIDIdentityToAwardee} />

            <span className="note">
                No ORCID has currently been linked for <em>{awardee.firstName} {awardee.lastName}</em>.
                <br />
                Click the button above to connect your ORCID account.
            </span>
        </div>
    );
})`
  
  font-family: ProximaNovaLight, sans-serif;
  
  > .note {
    margin-top: 10px;
    display: block;
    color: #424242;
    font-size: 12px;
  }
`;


const ORCIDLinkButton = styled(({className, registerORCIDIdentityToAwardee}) => {

    return (
        <button className={className} onClick={registerORCIDIdentityToAwardee}>
            <img src="https://orcid.org/sites/default/files/images/orcid_24x24.png" width="24" height="24" alt="ORCID iD icon"/>
            Register or Connect your ORCID iD
        </button>
    );
})`

    border: 1px solid #D3D3D3;
    padding: .3em;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 1px 1px 3px #999;
    cursor: pointer;
    color: #999;
    font-weight: bold;
    font-size: .8em;
    line-height: 24px;
    vertical-align: middle;
    margin-top: 5px;

    &:hover{
        border: 1px solid #338caf;
        color: #338caf;
    }
    
    > img {
        display: block;
        margin: 0 .5em 0 0;
        padding: 0;
        float: left;
    }
`;





export default withFormField(FormFieldAwardeeORCIDLink, (element) => {

    // From the GraphQL endpoint we want to fetch the file set along with the associated name, size, type etc.
    // The top level field that we are interested in (that comes in via the formData data set is the binding values).

    if (!element.binding) {
        return null;
    }

    const topLevel = element.binding;
    const fetch = fetchFields(element.binding, `id, firstName, lastName, affiliation, email, identity`);
    fetch[element.binding].identity = fetchFields(`id, type, identityId, displayName, displayAffiliation`);

    return {topLevel, fetch};
});
