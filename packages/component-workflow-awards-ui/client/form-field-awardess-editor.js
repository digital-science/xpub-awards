import React, { useState, useEffect } from 'react';
import Spinner from 'ds-awards-theme/components/spinner';
import pick from 'lodash/pick';

import { withFormField } from 'component-task-form/client';
import { FaTimes } from 'react-icons/fa';

import useSetInstanceAssociatedAwardeesMutation from './mutations/setInstanceAssociatedAwardees';
import useCreateAwardeeMutation from './mutations/createAwardee';



// FIXME: while we are going off to the server and creating a new awardee / updating an awardee we should
// prevent any user navigation etc (the state should be one of an async operation being underway).


function AwardeeEditor({ awardee, actionText, action }) {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [affiliation, setAffiliation] = useState("");
    const [operationPending, setOperationPending] = useState(false);

    useEffect(() => {
        if(awardee) {
            setFirstName(awardee.firstName || "");
            setLastName(awardee.firstName || "");
            setEmail(awardee.email || "");
            setAffiliation(awardee.affiliation || "");
        } else {
            setFirstName("");
            setLastName("");
            setEmail("");
            setAffiliation("");
        }
    }, [awardee]);


    function resetState() {
        setFirstName("");
        setLastName("");
        setEmail("");
        setAffiliation("");
    }

    const performAction = function() {

        const newAwardee = {};

        if(awardee && awardee.id) {
            newAwardee.id = awardee.id;
        }

        newAwardee.firstName = firstName.trim();
        newAwardee.lastName = lastName.trim();

        if(affiliation && affiliation.trim()) {
            newAwardee.affiliation = affiliation.trim();
        }

        if(email && email.trim()) {
            newAwardee.email = email.trim();
        }

        setOperationPending(true);

        return action(newAwardee).then(() => {

            setOperationPending(false);
            resetState();
        });
    };

    const inputForField = (value, set, label) => {
        const changeHandler = (event) => {
            set(event.target.value);
        };
        return <div><label>{label}: <input type="text" value={value} onChange={changeHandler} disabled={operationPending} /></label></div>;
    };

    return (
        <div>
            <div style={{marginBottom:"10px"}}>
                {inputForField(firstName, setFirstName, "First name")}
                {inputForField(lastName, setLastName, "Last name")}
                {inputForField(email, setEmail, "Email")}
                {inputForField(affiliation, setAffiliation, "Affiliation")}
            </div>
            <button onClick={performAction} disabled={operationPending} aria-disabled={operationPending}>{actionText}</button>
            {operationPending ? <div style={{display:"inline-block", marginLeft:'10px'}}><Spinner /> <span>Saving&hellip;</span></div> : null}
        </div>
    );
}





function FormFieldAwardeesEditor({formData, binding, instanceId, instanceType, options = {}}) {

    //const {value, handleInputChange} = useFormValueBinding(props.formData, props.binding, "", (v) => v || "");


    // use state to track the currently edited item
    // state to track a new item being added

    // on create, create a new awardee
    // on edit, update the existing awardee (keep associated identity??)
    // on delete, un-associate it from the parent object???

    const [awardeesListing, setAwardeesListing] = useState([]);
    const setInstanceAssociatedAwardees = useSetInstanceAssociatedAwardeesMutation(instanceType, binding);
    const createAwardee = useCreateAwardeeMutation();

    const formDataWasChanged = function _formDataWasChanged(form, field, v) {
        setAwardeesListing(form.getFieldValue(field) || []);
    };

    useEffect(() => {

        if(!formData || !binding) {
            return;
        }

        formData.on(`field.${binding}`, formDataWasChanged);
        setAwardeesListing(formData.getFieldValue(binding) || []);

        return function cleanup() {
            formData.off(`field.${binding}`, formDataWasChanged);
        };

    }, [formData, binding]);


    const confirmAwardeeFromEditor = (awardee) => {

        const awardeeInput = pick(awardee, ['firstName', 'lastName', 'affiliation', 'email']);

        // FIXME: need to check to ensure all required fields are present etc. before creating an awardee instance

        return createAwardee(awardeeInput).then(awardeeId => {

            awardee.id = awardeeId;

            const newAwardees = awardeesListing ? awardeesListing.slice(0) : [];
            newAwardees.push(awardee);

            setAwardeesListing(newAwardees);

            return setInstanceAssociatedAwardees(instanceId, newAwardees.map(a => a.id));
        });
    };

    const removeAwardee = (awardee) => {

        if(!awardeesListing || !awardeesListing.length) {
            return Promise.resolve();
        }

        const newAwardees = awardeesListing.filter(a => a.id !== awardee.id);
        setAwardeesListing(newAwardees);

        return setInstanceAssociatedAwardees(instanceId, newAwardees.map(a => a.id));
    };

    const awardeeList = awardeesListing.map(awardee => {
        return (
            <li key={awardee.id || awardee._temp_id}>
                <span>{awardee.firstName} {awardee.lastName}</span>
                {awardee.email ? <React.Fragment> &ndash; <em>{awardee.email}</em></React.Fragment>  : null}
                {awardee.affiliation ? <span style={{color:"darkgrey"}}> &ndash; {awardee.affiliation}</span>  : null}
                <FaTimes onClick={() => { removeAwardee(awardee); }} />
            </li>
        );
    });

    return (
        <div style={{padding: '15px'}}>
            <b style={{marginBottom:"5px"}}>Awardees Editor (for binding: {binding})</b>
            {options.label ? <label>{options.label}</label> : null}
            <AwardeeEditor action={confirmAwardeeFromEditor} actionText={"Add Awardee"} />
            <ol>
                {awardeeList}
            </ol>
        </div>
    );
}

export default withFormField(FormFieldAwardeesEditor, (element) => {

    // From the GraphQL endpoint we want to fetch the file set along with the associated name, size, type etc.
    // The top level field that we are interested in (that comes in via the formData data set is the binding values).

    const topLevel = element.binding;
    const fetch = `${element.binding} {
        id
        firstName
        lastName
        affiliation
        email
    }`;

    return {topLevel, fetch};
});