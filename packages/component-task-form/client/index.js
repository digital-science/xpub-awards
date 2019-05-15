import TaskForm from './components/task-form';
import MultipleStageTaskForm from './components/multiple-stage-task-form';

import withFormField from './components/fields/withFormField';
import withFormFieldData from './components/fields/withFormFieldData';

import useTimedMinimumDisplay from './hooks/useTimedMinimumDisplay';


function taskFormForFormDefinition(formDefinition) {

    return (formDefinition && formDefinition.extends === "MulitpleStages") ? MultipleStageTaskForm : TaskForm;
}


export { taskFormForFormDefinition, TaskForm, MultipleStageTaskForm,
    withFormField, withFormFieldData, useTimedMinimumDisplay };