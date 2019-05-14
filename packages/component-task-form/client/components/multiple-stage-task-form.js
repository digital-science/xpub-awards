import React, { Fragment, useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';

import useTimedMinimumDisplay from './../hooks/useTimedMinimumDisplay';
import useFormInstanceData from './../hooks/useInstanceDataForForm';

import FieldListing from './field-listing';

import Button from 'ds-awards-theme/components/button';


/* Form has multiple stages, the form definition will consist of a collection of "Stages" and each of these will be used
 * to generate different pages within the staged form.
 * TODO: validations between each step, and the required data at each stage and pre-requisites to move onto the next stage will need to be specifiable.   */



function MultipleStageTaskForm({instanceId, taskId, instanceType, formDefinition, workflowDescription, wasSubmitted, autoSave=true}) {

    const elements = formDefinition ? formDefinition.elements : null;
    const stages = useMemo(() => {

        if(!elements) {
            return null;
        }

        return elements.map(element => {

            if(element.type !== "Stage") {
                return null;
            }

            const r = {
                elements: element.children
            };

            if(r.elements) {
                const stageButtons = r.elements.filter(e => e.type === "StageButton");

                if(stageButtons.length) {
                    r.elements = r.elements.filter(e => e.type !== "StageButton");
                    r.buttons = stageButtons;
                }
            }

            if(element.options) {
                r.options = element.options;
            }

            return r;

        }).filter(s => !!s);

    }, [elements]);

    const [currentStage, setCurrentStage] = useState(stages && stages.length ? stages[0] : null);

    useEffect(() => {
        setCurrentStage(stages && stages.length ? stages[0] : null);
    }, [stages]);


    const [showIsSaving, displayIsSavingMessage, removeIsSavingMessage] = useTimedMinimumDisplay(1500);

    const fd = useFormInstanceData(instanceId, taskId, instanceType, formDefinition, workflowDescription, wasSubmitted, autoSave, displayIsSavingMessage, removeIsSavingMessage);
    const {instance, error, loading, task, submitTaskOutcome, formData, refetchFormData, fieldRegistry} = fd;



    if(loading) {
        return <div>Loading</div>;
    }

    if(error) {
        return <div>Error: {error}</div>;
    }

    if(!instance) {
        return <div>Instance Not Found</div>
    }

    if(!task) {
        return <div>Task Not Found</div>
    }

    if(!currentStage) {
        return <div>No Current Stage</div>;
    }


    const currentStageIndex = stages.indexOf(currentStage);
    const canChangeToNextStage = (currentStageIndex !== -1 && currentStageIndex + 1 < stages.length);
    const canChangeToPrevStage = (currentStageIndex > 0);

    const changeToNextStage = () => {
        setCurrentStage(stages[currentStageIndex + 1]);
    };

    const changeToPrevStage = () => {
        setCurrentStage(stages[currentStageIndex - 1]);
    };

    return (
        <Fragment>
            <StageHolder>
                {currentStage.options && currentStage.options.label ? <StageLabel className="stage-label">{currentStage.options.label}</StageLabel> : null}
                <div>
                    {/* Field Listing displayed for the current  */}
                    <FieldListing elements={currentStage.elements} fieldRegistry={fieldRegistry} formData={formData} refetchFormData={refetchFormData}
                        instanceId={instanceId} instanceType={instanceType} taskId={taskId} submitTaskOutcome={submitTaskOutcome} />
                </div>
            </StageHolder>

            <StagesButtonHolder className="stage-buttons">

                {canChangeToPrevStage ? <StageButton onClick={changeToPrevStage}>Previous Step</StageButton> : null}
                {canChangeToNextStage ? <StageButton onClick={changeToNextStage}>Next Step</StageButton> : null}
                {currentStage.buttons ? currentStage.buttons.map((button, indx) => {

                    const options = button.options;

                    const clickStageButton = () => {
                        if(options && options.outcome) {
                            return submitTaskOutcome(options.outcome, options);
                        }
                    };

                    return <StageButton key={indx} onClick={clickStageButton}>{options && options.label ? options.label : "Commit"}</StageButton>;

                }) : null }

            </StagesButtonHolder>
        </Fragment>
    );
}


const StageHolder = styled.div`
    min-width: 750px;
    margin-bottom: 20px;
`;


const StageLabel = styled.div`
    font-size: 19px;
    /*font-family: NovcentoSansWideBook;*/
    font-family: ProximaNovaLight;
    text-transform: uppercase;
    margin-bottom: 14px;
`;



const StagesButtonHolder = styled.div`
    padding: 20px;
    margin-top: 20px;
    margin-bottom: -20px;
    margin-left: -20px;
    margin-right: -20px;
    
    display: flex;
    justify-content: flex-end;
    
    background: #f2f2f2;
    
    > button {
        margin-left: 5px;
    }
`;

const StageButton = ({className, children, ...rest}) => {

    return <Button className={`${className || ''} stage-button`} {...rest}>{children}</Button>
};




export default MultipleStageTaskForm;