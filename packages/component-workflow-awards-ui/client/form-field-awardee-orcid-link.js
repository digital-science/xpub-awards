import React from 'react';
import config from 'config';

import {withFormField, fetchFields, withFormFieldData} from 'component-task-form/client';
import useUnlinkIdentityFromAwardee from './mutations/unlinkIdentityFromAwardee';

import './form-field-awardee-orcid-link.css';

const { orcidUrl, orcidDisplayUrl } = config['orcid-paths'];


function FormFieldAwardeeORCIDLink({ binding, formData, refetchFormData, instanceId }) {

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
        <div className="form-field-awardee-orcid-link">
            <div className="awardee-detail">
                <b>Awardee:</b> {awardee.firstName} {awardee.lastName} {awardee.affiliation ? <span> &ndash; {awardee.affiliation}</span> : null}
                <br />
                <b>Email:</b> {awardee.email}
            </div>

            <div className="identity-holder">
                { identity ?
                    (<div className="linked-identity">
                        <b>Linked Identity</b>
                        <div>
                            <div>{identity.displayName}</div>
                            <a href="https://orcid.org">
                                <img alt="ORCID logo" src="https://orcid.org/sites/default/files/images/orcid_16x16.png" width="16" height="16" hspace="4" /></a>
                            <a href={orcidLink(identity)}>{orcidLink(identity, true)}</a>

                            <div className="unlink-holder">
                                <button onClick={unlinkIdentityFromAwardee}>Unlink ORCiD</button>
                            </div>
                        </div>
                    </div>)
                    :
                    (<div className="unlinked-identity">
                        <div>Link ORCID Identity with Awardee</div>

                        <button id="connect-orcid-button" onClick={registerORCIDIdentityToAwardee}>
                            <img id="orcid-id-icon" src="https://orcid.org/sites/default/files/images/orcid_24x24.png" width="24" height="24" alt="ORCID iD icon"/>
                            Register or Connect your ORCID iD
                        </button>
                    </div>)
                }
            </div>
        </div>
    );
}


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
