import React from 'react';
import { Route, Switch } from 'react-router';

import AwardsApps from './AwardsApp';
import Index from './Index';
import WorkflowTaskFormModal from './WorkflowTaskFormModal';
import AwardAcceptanceTaskForm from './AwardAcceptanceTaskForm';


const Routes = () => (

    <Switch>
        <Route path="/award/:instanceId/acceptance" render={props=> {
            return (
                <AwardsApps hideSidebar={true} hideUser={true}>
                    <AwardAcceptanceTaskForm {...props} />
                </AwardsApps>
            )
        }} />

        <Route path="/" render={props => {
            return (
                <AwardsApps>
                    <Index history={props.history} />
                    <Route component={WorkflowTaskFormModal} path="/task/:type/:instanceId/:taskName/:taskId" />
                </AwardsApps>
            );
        }} />

    </Switch>
);

export default Routes
