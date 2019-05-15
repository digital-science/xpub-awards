import TaskForm from './components/task-form';
import MultipleStageTaskForm from './components/multiple-stage-task-form';

import withFormField, { fetchFields, mergeFetchFields } from './components/fields/withFormField';
import withFormFieldData from './components/fields/withFormFieldData';

import useTimedMinimumDisplay from './hooks/useTimedMinimumDisplay';


export { withFormField, fetchFields, mergeFetchFields, withFormFieldData }

export { useTimedMinimumDisplay }

export { TaskForm, MultipleStageTaskForm  };


/* Return the "taskForm" for the provided form definition.  */
function taskFormForFormDefinition(formDefinition) {
    return (formDefinition && formDefinition.extends === "MulitpleStages") ? MultipleStageTaskForm : TaskForm;
}

export { taskFormForFormDefinition }