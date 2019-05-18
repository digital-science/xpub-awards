import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import moment from 'moment';

import { WorkflowDescriptionContext } from 'client-workflow-model';

import useCreateTaskMutation from './../mutations/createTask';
import useGetAwardSubmissions from './../queries/getAwardSubmissions';

import AwardeeListing from './awardee-listing';
import Spinner from 'ds-awards-theme/components/spinner';

import InlineTaskFormPopoverTrigger from 'component-task-form/client/components/inline-popover-task-form';

import AwardIconImage from 'ds-awards-theme/static/award.svg';
import PublishAwardIconImage from './../static/publish-award.svg';
import EditIconImage from './../static/edit.svg';
import BinIconImage from './../static/bin.svg';

import './dashboard.css';


const DashboardHolder = styled.div`
    padding: 32px;
`;


const AssignNewButton = styled.button`
    display: inline-block;
    height: 30px;
    
    font-size: 17px;
    line-height: 30px;
    border: none;
    background: none;
    font-family: NovcentoSansWideNormal, sans-serif;
    text-transform: uppercase;
    
    cursor: pointer;

    > span {
        display: inline-block;
        font-size: 30px;
        color: #3779a0;
    }
`;

const ActiveAwardsHeader = styled.div`
    font-size: 17px;
    font-family: NovcentoSansWideBook, sans-serif;
    text-transform: uppercase;
`;

const DashboardTable = styled.table`

    table-layout: fixed;
    margin-top: 18px;
    width: 100%;
    
    border: none;
    border-spacing: 0;
    border-collapse: collapse;
    
    font-family: QuicksandRegular, sans-serif;

    tbody:before {
        content: "-";
        display: block;
        line-height: 11px;
        color: transparent;
    }

    th {
        background: white;
        padding: 14px 20px;
        font-size: 17px;
        text-align: left;
        
        border-right: 1px solid #ebebeb;
    }
    
    tbody {
        font-size: 15px;
    }
    
    tbody tr {
        border-bottom: 2px solid #ebebeb;
    }
    
    .small {
        width: 100px;
    }
    
    .actions {
        width: 75px;
    }
        
    .status {
        width: 110px;
    }

`;


function Dashboard(props) {

    const testing_TaskID = 'AwardSubmission';

    const workflowDescription = useContext(WorkflowDescriptionContext);
    const createNewTask = useCreateTaskMutation(testing_TaskID);
    const createTaskUrl = (id, taskName, taskId) => {
        return `/task/award-submission/${id}/${taskName}/${taskId}`;
    };
    const { history, children } = props;

    const taskDefinition = workflowDescription.findInstanceType(testing_TaskID);


    function handleCreateNewTask() {
        createNewTask().then(data => {
            const { id, tasks } = data;
            if(id && tasks && tasks.length) {

                const tasksWithForms = taskDefinition.primaryTasksFromTaskList(tasks);
                if(tasksWithForms && tasksWithForms.length) {
                    const primaryTask = tasksWithForms[0];
                    history.push(createTaskUrl(id, primaryTask.formKey.replace(/custom:/gi, ""), primaryTask.id));
                }
            }
        });
    }


    const { data, error, loading, refetch } = useGetAwardSubmissions(true);

    const refreshDashboard = () => {
        return refetch();
    };


    return (
        <DashboardHolder>

            <ActiveAwardsHeader>Active Awardes Submissions</ActiveAwardsHeader>

            <DashboardTable>
                <thead>
                    <tr className="heading">
                        <th>Award Name</th>
                        <th className="small">Date</th>
                        <th className="small status">Status</th>
                        <th>Awardees</th>
                        <th className="small actions">Actions</th>
                    </tr>
                </thead>
                <tbody>

                    {loading ? (
                        <tr>
                            <td colSpan={5}>
                                <Spinner center={true}/>
                            </td>
                        </tr>) : null
                    }

                    {error ? (
                        <tr>
                            <td colSpan={5}>
                                An error occurred while loading the active award submissions.
                            </td>
                        </tr>) : null
                    }

                    {
                        data.submissions ?
                            data.submissions.map(submission =>
                                <ActiveAwardSubmissionTableRow submission={submission} workflowDescription={workflowDescription}
                                    key={submission.id} refreshDashboard={refreshDashboard} />
                            ) : null
                    }
                </tbody>
            </DashboardTable>

            <AssignNewButton onClick={handleCreateNewTask}>
                <span>+</span>Assign New Award&hellip;
            </AssignNewButton>

            {children}

        </DashboardHolder>
    );
}


const SubmissionRow = styled.tr`
    background-color: white;
    
    td {
        padding: 15px;
    }
    
    td.date > span {
        color: darkgrey;
    }
`;

const SubmissionStatusPill = styled.div`
    display: inline-block;
    color: white;
    font-family: SFCompactDisplayRegular, sans-serif;
    text-transform: uppercase;
    font-size: 12px;
    background-color: #98cff1;
    padding: 3px 8px;
    border-radius: 3px;
    letter-spacing: 0.05em;
    
    &.submission {
        background-color: #adadad;
    }
    
    &.acceptance {
        background-color: #8dc56d;
    }
    
    &.decision {
        background-color: #FFC107;
    }
`;

const AwardIconHolder = styled.div`
    display: inline-block;
    width: 46px;
    height: 46px;
    background-color: #dddddd;
    border-radius: 23px;
    float: left;
    margin-right: 10px;
    
    > img {
        margin: auto auto;
        width: 24px;
        display: block;
        padding-top: 7px;
    }
`;

const AwardDetailsColumn = styled.td`
    position: relative;
`;

const AwardIcon = () => {
    return (
        <AwardIconHolder>
            <img alt="award" src={AwardIconImage} />
        </AwardIconHolder>
    );
};

const EditIcon = styled(({className}) => {
    return <img alt="edit award" className={className} src={EditIconImage} />;
})`
    height: 20px;
    display: inline;
    margin-right: 5px;
`;

const DeleteIcon = styled(({className}) => {
    return <img alt="delete award" className={className} src={BinIconImage} />;
})`
    height: 20px;
    display: inline;
    margin-right: 5px;
`;

const PublishIcon = styled(({className}) => {
    return (
        <div className={className}>
            <img alt="publish award"  src={PublishAwardIconImage} />
        </div>
    );
})`
    display: inline-block;
    margin-right: 5px;
    position: relative;
    background: aliceblue;
    padding: 5px;
    border-radius: 30px;
    border: 1px dashed #9dcef9;
    margin-left: -5px;
    padding-bottom: 4px;
    cursor: pointer;
    
    > img {
        height: 20px;
    }
    
`;



// FIXME: the determinations below need to be sourced from the DSL description of the workflow
// the entire dashboard will need a configuration that can be loaded

const AwardSubmissionStatusMapping = {
};

const AwardSubmissionStatus = {
    Submission: 'submission',       // waiting for initial data to to be submitted
    Acceptance: 'acceptance',       // awaiting awardee acceptance decisions
    Confirmation: 'confirmation',       // awaiting awardee acceptance decisions
    Decision: 'decision'
};

AwardSubmissionStatusMapping[AwardSubmissionStatus.Submission] = {
    text:"Submission",
    className: "submission"
};

AwardSubmissionStatusMapping[AwardSubmissionStatus.Acceptance] = {
    text:"Acceptance",
    className: "acceptance"
};

AwardSubmissionStatusMapping[AwardSubmissionStatus.Confirmation] = {
    text:"Confirmations",
    className: "confirmation"
};

AwardSubmissionStatusMapping[AwardSubmissionStatus.Decision] = {
    text:"Decision",
    className: "decision"
};


function ActiveAwardSubmissionTableRow({submission, workflowDescription, refreshDashboard}) {

    // Determine the current status to apply to the submission.
    const { tasks, awardeeAcceptances } = submission;
    const submissionTask = (tasks && tasks.length && tasks.find(task => task.formKey === "custom:submission"));
    const decisionTask = (tasks && tasks.length && tasks.find(task => task.formKey === "custom:final-decision"));



    let currentStatus = AwardSubmissionStatus.Submission;

    if(tasks && tasks.length) {

        if(decisionTask) {
            currentStatus = AwardSubmissionStatus.Decision;
        }

    } else if(awardeeAcceptances && awardeeAcceptances.length) {

        // Determine the total number of award acceptances still pending etc.

        const pendingAwardAcceptances = awardeeAcceptances.filter(aa => aa.acceptanceOutcome === null);
        const pendingAwardPublishing = awardeeAcceptances.filter(aa => aa.publishingOutcome === null);

        if(pendingAwardAcceptances.length) {
            currentStatus = AwardSubmissionStatus.Acceptance;
        } else if(pendingAwardPublishing.length) {
            currentStatus = AwardSubmissionStatus.Confirmation;
        }
    }

    const status = AwardSubmissionStatusMapping[currentStatus];
    let submissionTaskEdit = submissionTask ? (
        <Link to={`/task/award-submission/${submission.id}/${submissionTask.formKey.replace(/^custom:/ig, "")}/${submissionTask.id}`} >
            <EditIcon />
        </Link>
    ) : null;


    const decisionTaskFormParameters = useMemo(() => {

        if(!submission || !decisionTask) {
            return null;
        }

        const instanceType = workflowDescription.findInstanceTypeForUrlName('award-submission');
        const formDefinition = instanceType.formDefinitionForFormName('final-decision');

        return {
            instanceId: submission.id,
            instanceType,
            taskId: decisionTask.id ,
            formDefinition: formDefinition,
            workflowDescription: workflowDescription,
            wasSubmitted: () => {
                refreshDashboard();
            }
        };

    }, [submission, decisionTask]);


    const decisionTaskButton = (decisionTask && decisionTaskFormParameters) ? (
        <InlineTaskFormPopoverTrigger {...decisionTaskFormParameters}>
            <PublishIcon />
        </InlineTaskFormPopoverTrigger>
    ) : null;


    return (
        <SubmissionRow>
            <AwardDetailsColumn>
                <AwardIcon />
                <div>Award Name</div>
            </AwardDetailsColumn>
            <td className="date">
                {submission.date ? moment(submission.date).format("MMMM D, YYYY") : <span>&ndash;</span>}
            </td>
            <td className="small status">
                <SubmissionStatusPill className={status.className}>{status.text}</SubmissionStatusPill>
            </td>
            <td>
                <AwardeeListing submission={submission} awardees={submission.awardees} awardeeAcceptances={submission.awardeeAcceptances} refreshDashboard={refreshDashboard} />
            </td>
            <td className="small actions">
                {decisionTaskButton}
                {submissionTaskEdit}
                <DeleteIcon />
            </td>
        </SubmissionRow>
    );
}


export default Dashboard;