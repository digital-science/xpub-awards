import React, { useState, useMemo, useEffect } from 'react';

import useSubmitTaskOutcome from './useSubmitTaskOutcome';

import useGetInstanceQuery from './../queries/getInstance';
import useUpdateInstance from './../mutations/updateInstance';

import resolveFieldsForFormElements from './../utils/resolveFieldsForFormElements';

import FieldRegistry from './../components/registry';
import TaskFormData from "../utils/TaskFormData";

import pick from "lodash/pick";
import debounce from "lodash/debounce";


/* Hook that does the heavy lifting when setting up a form. It will resolve the set of data fields required to display
 * the form (this includes any complex objects with sub-fields etc). When a listing of fields is obtained it will
 * then fetch the instance data from the GraphQL endpoint.
 * The hook then configures updating the instance (via the GraphQL endpoint) when form data has been changed. Automatic
 * updates (debounced) can also be configured, with UI notifications of updates available via the "SavingMessage"
 * callbacks provided to the hook.
 * */


export default function useFormInstanceData(instanceId, taskId, instanceType, formDefinition, workflowDescription, wasSubmitted,
                                            enableAutoSave=true, displayIsSavingMessage=null, removeIsSavingMessage=null) {


    const { fetchFields, topLevelFields } = useMemo(() => {
        return resolveFieldsForFormElements(formDefinition.elements, FieldRegistry);
    }, [formDefinition]);

    const { data, error, loading, refetch } = useGetInstanceQuery(instanceId, instanceType, fetchFields);

    const submitTaskOutcome = useSubmitTaskOutcome(instanceId, taskId, formDefinition, instanceType, wasSubmitted);
    const updateInstance = useUpdateInstance(instanceType);

    const [formData, setFormData] = useState(null);


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


    useEffect(() => {

        // Upon receiving the initial data set, pick the top level fields from the data set and initialise a
        // new form data set with these initial values.

        setFormData(new TaskFormData(pick(data.result, topLevelFields)));

    }, [data]);


    useEffect(() => {

        if(!formData) {
            return;
        }

        const formDataWasChanged = debounce(() => {

            const t = displayIsSavingMessage ? displayIsSavingMessage() : null;

            _updateInstanceFromFormData().then(() => {

                if(displayIsSavingMessage && removeIsSavingMessage) {
                    removeIsSavingMessage(t);
                }

            }).catch(err => {

                if(displayIsSavingMessage && removeIsSavingMessage) {
                    removeIsSavingMessage(t, true);
                }
                console.error(`Unable to save form data due to: ` + err.toString());
            });

        }, 2000);

        formData.on('modified', formDataWasChanged);

        return (() => {
            formData.off('modified', formDataWasChanged);
            formDataWasChanged.cancel();
        });

    }, [formData]);

    const instance = data ? data.result : null;
    const tasks = (data && data.result) ? data.result.tasks : null;
    const task = (tasks && tasks.length) ? tasks.find(t => t.id === taskId) : null;

    return {
        fetchFields,
        topLevelFields,

        data,
        error,
        loading,

        instance,
        task,

        submitTaskOutcome,
        formData,
        refetchFormData,

        fieldRegistry:FieldRegistry
    };
};