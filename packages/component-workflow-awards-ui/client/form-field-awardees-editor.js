import React, { Fragment, useState, useEffect } from 'react';
import Spinner from 'ds-awards-theme/components/spinner';
import pick from 'lodash/pick';

import { withFormField, useTimedMinimumDisplay, fetchFields } from 'component-task-form/client';
import { FaTimes } from 'react-icons/fa';

import useSetInstanceAssociatedAwardeesMutation from './mutations/setInstanceAssociatedAwardees';
import useCreateAwardeeMutation from './mutations/createAwardee';
import useUpdateAwardeeMutation from './mutations/updateAwardee';

import _Label from 'ds-awards-theme/components/label';
import TextInput from 'ds-awards-theme/components/text-input';
import { SmallPlainButton } from 'ds-awards-theme/components/button';
import BorderedElement from 'ds-awards-theme/components/bordered-element';
import DataTable from 'ds-awards-theme/components/data-table';
import styled from 'styled-components';

import PersonIcon from 'ds-awards-theme/static/person.svg';


const Label = styled(_Label)`
    display: block;
`;


// FIXME: while we are going off to the server and creating a new awardee / updating an awardee we should
// prevent any user navigation etc (the state should be one of an async operation being underway).


function AwardeeEditor({ awardee, actionText, action }) {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [affiliation, setAffiliation] = useState("");
    const [validState, setValidState] = useState(false);

    const [operationPending, showOperationPending, removeOperationPending] = useTimedMinimumDisplay(500);


    useEffect(() => {
        if(awardee) {
            setFirstName(awardee.firstName || "");
            setLastName(awardee.lastName || "");
            setEmail(awardee.email || "");
            setAffiliation(awardee.affiliation || "");
        } else {
            setFirstName("");
            setLastName("");
            setEmail("");
            setAffiliation("");
        }
    }, [awardee]);

    useEffect(() => {

        const newValidState = (firstName && lastName && email);

        if(newValidState !== validState) {
            setValidState(newValidState);
        }

    }, [firstName, lastName, email, affiliation]);


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

        const t = showOperationPending(true);

        return action(newAwardee, awardee).then(() => {

            removeOperationPending(t);
            resetState();
        });
    };

    const inputForField = (value, set, label) => {
        const changeHandler = (event) => {
            set(event.target.value);
        };
        return (
            <div>
                <Label>{label}</Label>
                <TextInput type="text" value={value} onChange={changeHandler} disabled={operationPending} />
            </div>
        );
    };

    const disableAddAwardee = operationPending || !validState;

    return (
        <div>
            <AwardeeEditorHolder>
                {inputForField(firstName, setFirstName, "First name")}
                {inputForField(lastName, setLastName, "Last name")}
                {inputForField(email, setEmail, "Email")}
                {inputForField(affiliation, setAffiliation, "Affiliation")}
            </AwardeeEditorHolder>

            <SmallPlainButton onClick={performAction} disabled={disableAddAwardee} aria-disabled={disableAddAwardee}>{actionText}</SmallPlainButton>
            {operationPending ? <Spinner small={true} message={"Saving\u2026"} /> : null}
        </div>
    );
}


const AwardeeEditorHolder = styled.div`
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  > div {
      flex: 0 calc(50% - 10px);
      margin-bottom: 5px;
  }
`;


const AwardeeEditorWrapper = BorderedElement(styled.div`

  box-sizing: border-box;
  
  > label {
    margin-bottom: 10px;
  }
`);




function FormFieldAwardeesEditor({formData, binding, instanceId, instanceType, refetchFormData, options = {}}) {

    //const {value, handleInputChange} = useFormValueBinding(props.formData, props.binding, "", (v) => v || "");


    // use state to track the currently edited item
    // state to track a new item being added

    // on create, create a new awardee
    // on edit, update the existing awardee (keep associated identity??)
    // on delete, un-associate it from the parent object???

    const [awardeesListing, setAwardeesListing] = useState([]);
    const [focusedAwardee, setFocusedAwardee] = useState(null);
    const setInstanceAssociatedAwardees = useSetInstanceAssociatedAwardeesMutation(instanceType, binding);
    const createAwardee = useCreateAwardeeMutation();
    const updateAwardee = useUpdateAwardeeMutation();

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


    const confirmAwardeeFromEditor = (awardeeData, awardee) => {

        // FIXME: need to check to ensure all required fields are present etc. before creating an awardee instance

        const awardeeInput = pick(awardeeData, ['firstName', 'lastName', 'affiliation', 'email']);

        if(awardee) {

            const clearFocusedAwardee = (focusedAwardee === awardee);

            awardeeInput.id = awardee.id;

            return updateAwardee(awardeeInput).then(() => {

                if(clearFocusedAwardee) {
                    setFocusedAwardee(null);
                }
                return refetchFormData();
            });
        }

        return createAwardee(awardeeInput).then(awardeeId => {

            const newAwardee = Object.assign({id: awardeeId}, awardeeData);
            const newAwardees = awardeesListing ? awardeesListing.slice(0) : [];

            newAwardees.push(newAwardee);
            setAwardeesListing(newAwardees);

            return setInstanceAssociatedAwardees(instanceId, newAwardees.map(a => a.id));
        });
    };

    const editAwardee = (awardee) => {
        setFocusedAwardee(awardee === focusedAwardee ? null : awardee);
    };

    const removeAwardee = (awardee) => {

        if(!awardeesListing || !awardeesListing.length) {
            return Promise.resolve();
        }

        const newAwardees = awardeesListing.filter(a => a.id !== awardee.id);
        setAwardeesListing(newAwardees);

        if(focusedAwardee === awardee) {
            setFocusedAwardee(null);
        }

        return setInstanceAssociatedAwardees(instanceId, newAwardees.map(a => a.id));
    };


    return (
        <AwardeeEditorWrapper>
            {options.label ? <Label>{options.label}</Label> : null}

            <AwardeeEditor awardee={focusedAwardee} action={confirmAwardeeFromEditor} actionText={focusedAwardee ? "Update Awardee" : "Add Awardee"} />

            {awardeesListing.length ?
                <AwardeeListingTable awardees={awardeesListing} focusedAwardee={focusedAwardee} editAwardee={editAwardee} removeAwardee={removeAwardee} /> : null}
        </AwardeeEditorWrapper>
    );
}



const AwardeePersonIcon = styled(({className}) => {
    return <div className={className}><img src={PersonIcon} /></div>;
})`
    display: inline-block;
    width: 12px;
    height: 12px;
    vertical-align: top;
    margin-top: 2px;
    margin-right: 3px;
    
    > img {
        opacity: 0.25;
    }
`;

function _AwardeeListingTable({className, awardees, focusedAwardee, editAwardee, removeAwardee}) {

    return (
        <DataTable className={className}>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Affiliation</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>

                <tr className="separator" />

                {awardees.map(awardee => {

                    return (
                        <tr className={awardee === focusedAwardee ? "focused" : ""} key={awardee.id || awardee._temp_id} onClick={() => { editAwardee(awardee); }}>
                            <td>
                                <AwardeePersonIcon />
                                {awardee.firstName} {awardee.lastName}
                            </td>
                            <td>{awardee.email || null}</td>
                            <td>{awardee.affiliation || null}</td>
                            <td>
                                <FaTimes onClick={() => { removeAwardee(awardee); }} />
                            </td>
                        </tr>
                    );
                })}

            </tbody>
        </DataTable>
    )
}

const AwardeeListingTable = styled(_AwardeeListingTable)`
    margin-top: 20px;
    
    .focused {
      outline: 1px dashed #c7c7c7;
      background: #f1f1f1;
    }
    
    tbody tr {
      cursor: pointer;
    }
    
    tr.separator {
      height: 3px;
    }
`;




export default withFormField(FormFieldAwardeesEditor, (element) => {

    // From the GraphQL endpoint we want to fetch the file set along with the associated name, size, type etc.
    // The top level field that we are interested in (that comes in via the formData data set is the binding values).

    const topLevel = element.binding;
    const fetch = fetchFields(element.binding, `id, firstName, lastName, affiliation, email`);

    return {topLevel, fetch};
});