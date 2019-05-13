import React, { Fragment, useMemo, useContext } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { WorkflowDescriptionContext } from 'client-workflow-model'
import { TaskForm } from 'component-task-form/client';


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



const AwardeeListing = ({submission, awardees, awardeeAcceptances}) => {

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
                return <AwardeeListingElement key={a.awardee.id} submission={submission} {...a} />
            }) : null}
        </AwardeeListingHolder>
    );
};




const AwardeeListingElement = styled(({className=null, submission, awardee, acceptance}) => {

    const isPending = (acceptance && acceptance.acceptanceOutcome === null);
    const hasAccepted = (acceptance && acceptance.acceptanceOutcome === "Accepted");
    const submissionPhase = (submission && submission.tasks && submission.tasks.find(task => task.formKey === 'custom:submission'));

    const acceptanceTask = (acceptance && acceptance.tasks && acceptance.tasks.find(task => task.formKey === 'custom:acceptance'));
    const confirmTask = (acceptance && acceptance.tasks && acceptance.tasks.find(task => task.formKey === 'custom:confirm-awardee'));

    const LinkWrapper = ({children}) => {
        if(acceptanceTask) {
            return (
                <Link to={`/task/awardee-acceptance/${acceptance.id}/${acceptanceTask.formKey.replace(/^custom:/ig, "")}/${acceptanceTask.id}`}>
                    {children}
                </Link>
            );
        }

        if(confirmTask) {
            return (
                <Link to={`/task/awardee-acceptance/${acceptance.id}/${confirmTask.formKey.replace(/^custom:/ig, "")}/${confirmTask.id}`}>
                    {children}
                </Link>
            );
        }

        return <Fragment>{children}</Fragment>;
    };

    const WorkflowDescription = useContext(WorkflowDescriptionContext);
    /*const confirmAwardeeOverlay = useMemo(() => {

        if(!awardee || !acceptance || !confirmTask) {
            return;
        }

        const instanceType = WorkflowDescription.findInstanceTypeForUrlName('awardee-acceptance');
        const formDefinition = instanceType.formDefinitionForFormName('confirm-awardee');

        const wasSubmitted = () => { console.log("inline form was submitted"); };

        return (
            <div>
                <TaskForm instanceId={acceptance.id} instanceType={instanceType} taskId={confirmTask.id}
                    formDefinition={formDefinition} workflowDescription={WorkflowDescription}
                    wasSubmitted={wasSubmitted}/>
            </div>
        );

    }, [awardee, acceptance, confirmTask]);*/

    return (
        <li className={`${className || ''} ${hasAccepted ? 'accepted' : ''} ${isPending ? 'pending' : ''} ${submissionPhase ? 'submission' : ''}`}>
            <LinkWrapper>
                <AwardAcceptanceDetails className="acceptance-details" awardee={awardee} acceptance={acceptance} hasAccepted={hasAccepted} />

                <span>{awardee.firstName} {awardee.lastName}</span>

                {awardee.identity && awardee.identity.identityId ?
                    <img alt="ORCID logo" className="orcid" src="https://orcid.org/sites/default/files/images/orcid_16x16.png" hspace="4" /> : null}

                {/*confirmAwardeeOverlay*/}

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