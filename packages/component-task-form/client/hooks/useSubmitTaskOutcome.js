import useCompleteInstanceTask from './../mutations/completeInstanceTask';


export default  function useSubmitTaskOutcome(instanceId, taskId, formDefinition, instanceType, wasSubmitted) {

    const completeInstanceTask = useCompleteInstanceTask(instanceType);

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

    return submitTaskOutcome;
}