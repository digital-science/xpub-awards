import React, { Fragment, useMemo, useContext } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaQuestionCircle } from 'react-icons/fa'

import { WorkflowDescriptionContext } from 'client-workflow-model'
import { TaskForm } from 'component-task-form/client';

import InlineTaskFormPopoverTrigger from 'component-task-form/client/components/inline-popover-task-form';


const AwardeeListingHolder = styled.ol`
    list-style: none;
    margin: 0;
    padding: 0;
    
    li:after {
        content: '\\002C\\0020';
    }
    
    li.pending:after {
        content: '';
    }
    
    li:last-child:after {
        content: '';
    }
`;



const AwardeeListing = ({submission, awardees, awardeeAcceptances, refreshDashboard}) => {

    const awardeeListing = useMemo(() => {

        if(!awardees || !awardees.length) {
            return null;
        }

        const acceptanceMap = {};

        awardeeAcceptances.forEach(aa => {
            if(aa && aa.awardee && aa.awardee.id) {
                acceptanceMap[aa.awardee.id] = aa;
            }
        });

        return awardees.map(awardee => {
            const r = {awardee};
            if(awardee.id && acceptanceMap.hasOwnProperty(awardee.id)) {
                r.acceptance = acceptanceMap[awardee.id];
            }
            return r;
        });

    }, [awardees, awardeeAcceptances]);

    if(!awardeeListing) {
        return null;
    }

    return (
        <AwardeeListingHolder>
            {awardeeListing ? awardeeListing.map(a => {
                return <AwardeeListingElement key={a.awardee.id} submission={submission} refreshDashboard={refreshDashboard} {...a} />
            }) : null}
        </AwardeeListingHolder>
    );
};




const AwardeeListingElement = styled(({className=null, submission, awardee, acceptance, refreshDashboard}) => {

    const isPending = (acceptance && acceptance.acceptanceOutcome === null);
    const hasAccepted = (acceptance && acceptance.acceptanceOutcome === "Accepted");
    const submissionPhase = (submission && submission.tasks && submission.tasks.find(task => task.formKey === 'custom:submission'));

    const acceptanceTask = (acceptance && acceptance.tasks && acceptance.tasks.find(task => task.formKey === 'custom:acceptance'));
    const confirmTask = (acceptance && acceptance.tasks && acceptance.tasks.find(task => task.formKey === 'custom:confirm-awardee'));

    const WorkflowDescription = useContext(WorkflowDescriptionContext);
    const taskFormParameters = useMemo(() => {

        if(!awardee || !acceptance || !confirmTask) {
            return null;
        }

        const instanceType = WorkflowDescription.findInstanceTypeForUrlName('awardee-acceptance');
        const formDefinition = instanceType.formDefinitionForFormName('confirm-awardee');

        const wasSubmitted = () => {
            refreshDashboard();
        };

        return {
            instanceId: acceptance.id,
            instanceType,
            taskId: confirmTask ? confirmTask.id : null,
            formDefinition: formDefinition,
            workflowDescription: WorkflowDescription,
            wasSubmitted
        };

    }, [awardee, acceptance, confirmTask]);


    const LinkWrapper = ({children}) => {
        if(acceptanceTask) {
            return (
                <Link to={`/award/${acceptance.id}/${acceptanceTask.formKey.replace(/^custom:/ig, "")}`}>
                    {children}
                </Link>
            );
        }

        if(confirmTask) {
            return (
                <InlineTaskFormPopoverTrigger {...taskFormParameters}>
                    {children}
                </InlineTaskFormPopoverTrigger>
            );
            /*<Link to={`/task/awardee-acceptance/${acceptance.id}/${confirmTask.formKey.replace(/^custom:/ig, "")}/${confirmTask.id}`}>
                </Link>*/
        }

        return <Fragment>{children}</Fragment>;
    };

    const hasInlineTask = !!confirmTask;

    return (
        <li className={`${className || ''} ${hasAccepted ? 'accepted' : ''} ${isPending ? 'pending' : ''} ${submissionPhase ? 'submission' : ''} ${hasInlineTask ? 'task' : ''}`}>
            <LinkWrapper>
                <AwardAcceptanceDetails className="acceptance-details" awardee={awardee} acceptance={acceptance} hasAccepted={hasAccepted} />

                <span>{awardee.firstName} {awardee.lastName}</span>

                {awardee.identity && awardee.identity.identityId ?
                    <img alt="ORCID logo" className="orcid" src="https://orcid.org/sites/default/files/images/orcid_16x16.png" hspace="4" /> : null}

                {hasInlineTask ? <FaQuestionCircle /> : null}

            </LinkWrapper>
        </li>
    );

})`
    
    display: inline-block;
    margin-right: 5px;
    
    > a {
        color: initial;
        text-decoration: none;
    }
    > a:visited {
        color: initial;
    }
    
    img.orcid {
        vertical-align: top;
        width: 12px;
        height: 12px;
    }
    
    .acceptance-details {
        margin-right: 3px;
    }
    
    &.pending {
        color: #757575;
        background: #ededed;
        padding: 3px 4px;
        border-radius: 6px;
        border: 1px dashed #9e9e9ea1;
    }
    
    &.submission {
        color: #777777;
    }
    
    &.task {
        color: #757575;
        background: aliceblue;
        padding: 3px 4px;
        border-radius: 6px;
        border: 1px dashed #9dcef9;
        cursor: pointer;
    }
    
    &.task svg {
      color: #9dcef9;
      vertical-align: top;
    }
`;



const AwardAcceptanceDetails = styled(({className, acceptance, hasAccepted}) => {
    return (
        <div className={`${className || ''} ${hasAccepted ? 'accepted' : ''}`}>
            <img alt="person icon" className={hasAccepted ? 'accepted' : 'not-accepted'} src="/images/person.svg" />
        </div>
    );
})`
    display: inline-block;
    width: 15px;
    height: 15px;
    vertical-align: top;
    
    img.not-accepted {
        opacity: 0.25;
    }
`;




export default AwardeeListing;