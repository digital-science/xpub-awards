import React, { useState, useEffect } from 'react';
import Spinner from 'ds-awards-theme/components/spinner';

import useTimedMinimumDisplay from './../hooks/useTimedMinimumDisplay';

import TaskFormData from './../utils/TaskFormData';
import useGetInstanceQuery from './../queries/getInstance';
import useUpdateInstance from './../mutations/updateInstance';
import useCompleteInstanceTask from './../mutations/completeInstanceTask';

import FieldRegistry from './registry';
import FieldListing from './field-listing';

import debounce from 'lodash/debounce';
import pick from 'lodash/pick';


export default function TaskForm({ instanceId, taskId, instanceType, formDefinition, workflowDescription, wasSubmitted }) {

    const {fetchFields, topLevelFields} = resolveFieldsRequiredForForm(formDefinition.elements, FieldRegistry);
    const { data, error, loading, refetch, networkStatus } = useGetInstanceQuery(instanceId, instanceType, fetchFields);
    const [formData, setFormData] = useState(null);
    const [showIsSaving, displayIsSavingMessage, removeIsSavingMessage] = useTimedMinimumDisplay(1500);
    const completeInstanceTask = useCompleteInstanceTask(instanceType);
    const updateInstance = useUpdateInstance(instanceType);

    function _updateInstanceFromFormData() {

        if(!formData) {
            return Promise.resolve();
        }

        const modifiedDataSet = formData.getModifiedData();
        if(!modifiedDataSet) {
            return Promise.resolve();
        }

        const {data} = modifiedDataSet;
        const input = {
            id: instanceId,
            ...data
        };

        // FIXME: need to filter updated data based on the allowed input for the data type

        return updateInstance(input).then(() => {
            formData.updateForSubmittedModifications(modifiedDataSet);
        });
    }

    const refetchFormData = () => {
        return refetch();
    };

    // Upon receiving the initial data set, pick the top level fields from the data set and initialise a
    // new form data set with these initial values.

    useEffect(() => {
        setFormData(new TaskFormData(pick(data.result, topLevelFields)));
    }, [data]);


    useEffect(() => {

        if(!formData) {
            return;
        }

        const formDataWasChanged = debounce(() => {

            const t = displayIsSavingMessage();

            _updateInstanceFromFormData().then(() => {
                removeIsSavingMessage(t);
            }).catch(err => {
                removeIsSavingMessage(t, true);
                console.error(`Unable to save form data due to: ` + err.toString());
            });

        }, 2000);

        formData.on('modified', formDataWasChanged);

        return (() => {
            formData.off('modified', formDataWasChanged);
            formDataWasChanged.cancel();
        });

    }, [formData]);

    const submitTaskOutcome = (outcomeType, options) => {

        console.log("------");
        console.log("Submit task outcome: ");
        console.dir(outcomeType);
        console.dir(options);

        // From the task definition we want to find the outcome requested.
        // The outcome can have state variable changes requested alongside it that need
        // to be sent to the server at the same time.

        const outcome = formDefinition.findMatchingOutcome(outcomeType);
        if(!outcome) {
            throw new Error(`Unable to find matching outcome for outcome type (${outcomeType})`);
        }

        console.dir(outcome);

        // Determine state changes that have been requested, fields should be filtered down to those that are
        // marked as being state variables within the tasks model definition.

        if(outcome.result === "Complete") {

            const state = instanceType.filterObjectToStateVariables(outcome._graphqlState || {});

            console.log("state change !!!");
            console.dir(state);

            return completeInstanceTask(instanceId, taskId, state).then(result => {

                console.log(`Completed task[${taskId}] for instance[${instanceId}]`);

                if(wasSubmitted) {
                    return wasSubmitted(outcome, state);
                }
            });
        }
    };


    if(loading) {
        return <div>Loading</div>;
    }

    if(error) {
        return <div>Error: {error}</div>;
    }


    if(!data || !data.result) {
        console.dir(data);
        return <div>Instance Not Found</div>
    }

    const { id, tasks } = data.result;
    if(!tasks || !tasks.filter(t => t.id === taskId).length) {
        return <div>Task Not Found</div>
    }

    return formData ? (
        <div className="task-form" style={{padding: "20px", position:"relative"}}>
            <div style={{position:'absolute', top:0, left: "500px", visibility:showIsSaving ? "visible" : "hidden"}}>
                <Spinner /> <span>Saving&hellip;</span>
            </div>

            {/*<div>InstanceId: {instanceId}</div>*/}
            {/*<div>TaskId: {taskId}</div>*/}

            <div>
                <FieldListing elements={formDefinition.elements} fieldRegistry={FieldRegistry} formData={formData} refetchFormData={refetchFormData}
                    instanceId={instanceId} instanceType={instanceType} taskId={taskId} submitTaskOutcome={submitTaskOutcome} />
            </div>

        </div>
    ) : (
        <div>Loading</div>
    );
};


function resolveFieldsRequiredForForm(elements, registry) {

    const fetchFields = {};
    const topLevelFields = {};

    if(!elements || !elements.length) {
        return [];
    }

    function _addToFieldSet(set, v) {
        if(!v) {
            return;
        }
        if(v instanceof Array) {
            v.forEach(vv => set[vv] = true);
        } else {
            set[v] = true;
        }
    }

    function addToFetchFields(v) {
        _addToFieldSet(fetchFields, v);
    }

    function addToTopLevelFields(v) {
        _addToFieldSet(topLevelFields, v);
    }

    // NOTE: this current solution doesn't resolve multiple levels of fields on the same top level field being requested etc.
    // we would need to merge these down to get a fully merged data set

    elements.forEach(e => {

        const component = registry[e.type];

        if(component && component.bindingResolver) {
            const field = component.bindingResolver(e);

            if(typeof field === "string") {
                addToFetchFields(field);
                addToTopLevelFields(field);
            } else if(field) {
                addToFetchFields(field.fetch);
                addToTopLevelFields(field.topLevel);
            }
        }
    });

    return {fetchFields:Object.keys(fetchFields), topLevelFields:Object.keys(topLevelFields)};
}