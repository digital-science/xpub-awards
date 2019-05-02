import React, { useContext } from 'react';
import { Link } from 'react-router-dom'

import { WorkflowDescriptionContext } from 'client-workflow-model';

import useCreateTaskMutation from './../mutations/createTask';
import useGetAwardSubmissions from './../queries/getAwardSubmissions';

import './dashboard.css'


function Dashboard(props) {

    const testing_TaskID = 'AwardSubmission';

    const workflowDescription = useContext(WorkflowDescriptionContext);
    const createNewTask = useCreateTaskMutation(testing_TaskID);
    const createTaskUrl = (id, taskName, taskId) => {
        return `/task/award-submission/${id}/${taskName}/${taskId}`;
    };
    const { history } = props;

    const taskDefinition = workflowDescription.findInstanceType(testing_TaskID);

    console.dir(workflowDescription);


    function handleCreateNewTask() {
        createNewTask().then(data => {
            const { id, tasks } = data;
            if(id && tasks && tasks.length) {

                const tasksWithForms = taskDefinition.primaryTasksFromTaskList(tasks);
                console.dir(tasksWithForms);

                if(tasksWithForms && tasksWithForms.length) {
                    const primaryTask = tasksWithForms[0];
                    history.push(createTaskUrl(id, primaryTask.formKey.replace(/custom:/gi, ""), primaryTask.id));
                }
            }
        });
    }


    const { data, error, loading } = useGetAwardSubmissions(true);
    let activeSubmissions = null;

    if(loading) {
        activeSubmissions = <div>Loading</div>;
    } else if(error) {
        activeSubmissions = <div>Error loading active award submissions.</div>;
    } else if(data && data.submissions) {
        activeSubmissions = <AwardSubmissionListing submissions={data.submissions} workflowDescription={workflowDescription} />;
    }

    return (
        <div className="dashboard" style={{padding:"20px"}}>
            <div>
                {activeSubmissions}
            </div>

            <button className="create-basic" onClick={handleCreateNewTask}>
                Begin New Submission
            </button>
        </div>
    );
}


function AwardSubmissionListing( {submissions, workflowDescription} ) {

    if(!submissions.length) {
        return <div>No Active Award Submissions</div>;
    }

    return (
        <ol className="submission-listing">
            {
                submissions.map(submission => {
                    return (
                        <li key={submission.id}>
                            <AwardSubmissionRow submission={submission} workflowDescription={workflowDescription} />
                        </li>
                    );
                })
            }
        </ol>
    );
}


function AwardSubmissionRow( {submission, workflowDescription} ) {

    console.dir(submission);

    const { awardees = [], awardeeAcceptances = [] } = submission;
    let awardeesListing;

    if(awardees.length) {

        awardeesListing = (
            <ol className="awardees-listing">
                {
                    awardees.map(awardee => {
                        return (
                            <li key={awardee.id}>
                                {awardee.firstName} {awardee.lastName}{awardee.affiliation ? <span> &ndash; {awardee.affiliation}</span> : null}
                            </li>
                        );
                    })
                }
            </ol>);

    } else {
        awardeesListing = <div>No Awardees</div>;
    }


    let tasksListing = null;

    if(submission.tasks && submission.tasks.length) {
        tasksListing = submission.tasks.map(task => {

            const niceFormKey = task.formKey.replace(/^custom:/ig, "");

            return (
                <tr key={task.id}>
                    <td>
                        Task: <Link to={`/task/award-submission/${submission.id}/${niceFormKey}/${task.id}`} >{niceFormKey}</Link>
                    </td>
                </tr>
            );
        });
    }


    let awardAcceptancesListing = null;

    if(submission.awardeeAcceptances && submission.awardeeAcceptances.length) {

        awardAcceptancesListing = submission.awardeeAcceptances.map(acceptance => {

            //acceptanceOutcome
            //publishingOutcome
            //tasks

            const awardee = acceptance.awardee;

            return (
                <tr key={acceptance.id}>
                    <td>{awardee.firstName} {awardee.lastName}</td>
                    <td>{acceptance.acceptanceOutcome || "Pending"}</td>
                    <td>{acceptance.publishingOutcome || <span>&ndash;</span> }</td>
                    <td>
                        {
                            acceptance.tasks ? (
                                <ol>
                                    {
                                        acceptance.tasks.map(task => {
                                            const niceFormKey = task.formKey.replace(/^custom:/ig, "");
                                            return (
                                                <li key={task.id}>
                                                    <Link to={`/task/awardee-acceptance/${acceptance.id}/${niceFormKey}/${task.id}`} >{niceFormKey}</Link>
                                                </li>
                                            );
                                        })
                                    }
                                </ol>
                            ) : null
                        }
                    </td>
                </tr>
            );

        });
    }

    return (
        <div>
            <b>{submission.id}</b>
            {tasksListing ? (
                <div>
                    <table className="task-listing">
                        <thead>
                            <tr>
                                <th>Award Tasks</th>
                            </tr>
                        </thead>
                        <tbody>{tasksListing}</tbody>
                    </table>
                </div>
            ) : null}

            {awardeesListing}

            {
                awardAcceptancesListing ? (
                    <div>
                        <table className="task-listing">
                            <thead>
                                <tr>
                                    <th>Awardee</th>
                                    <th>Acceptance</th>
                                    <th>Publishing</th>
                                    <th>Tasks</th>
                                </tr>
                            </thead>
                            <tbody>{awardAcceptancesListing}</tbody>
                        </table>
                    </div>
                ) : null
            }
        </div>
    );
}


export default Dashboard;