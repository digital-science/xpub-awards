import TaskForm from './components/task-form';
import MultipleStageTaskForm from './components/multiple-stage-task-form';
import SideBySideHeroTaskForm from './components/side-by-side-hero-task-form';

import withFormField, { fetchFields, mergeFetchFields } from './components/fields/withFormField';
import withFormFieldData from './components/fields/withFormFieldData';

import useTimedMinimumDisplay from './hooks/useTimedMinimumDisplay';


export { withFormField, fetchFields, mergeFetchFields, withFormFieldData }

export { useTimedMinimumDisplay }

export { TaskForm, MultipleStageTaskForm, SideBySideHeroTaskForm  };


/* Return the "taskForm" for the provided form definition.  */
const TaskFormMap = {
    'MulitpleStages': MultipleStageTaskForm,
    'SideBySideHeroPanels': SideBySideHeroTaskForm,
    'Simple': TaskForm
};

function taskFormForFormDefinition(formDefinition) {

    return ((formDefinition && formDefinition.extends) ? TaskFormMap[formDefinition.extends] : TaskForm) || TaskForm;
}

export { taskFormForFormDefinition }