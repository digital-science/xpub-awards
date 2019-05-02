import React from 'react'
import { Route, Switch } from 'react-router'
/*import { Dashboard } from 'component-dashboard/client'
import {
  Login,
  SignUp,
  InfoPage,
  ResetPassword,
  ConfirmAccout,
  SetNewPassword,
  AuthenticatedComponent,
  SignUpFromInvitation,
} from 'component-authentication/client'
import { EQSDecision, EQADecision } from 'component-screening/client'
import { EmailResponse, ManuscriptDetails } from 'component-chief-minus/client'
import { SubmissionConfirmation, Wizard } from 'component-submission/client'
import { AdminDashboard, AdminUsers, AdminRoute } from 'component-admin/client'
import { UserProfilePage, ChangePassword } from 'component-user-profile/client'

import FourOFour from './FourOFour'
import ReviewerRedirect from './ReviewerRedirect'
import ManuscriptRedirect from './ManuscriptRedirect'*/

import AwardsApps from './AwardsApp'
import Index from './Index'
import WorkflowPrimaryTask from './WorkflowPrimaryTask'

const Routes = () => (
    <AwardsApps>
        <Switch>
            <Route component={Index} exact path="/" />
            <Route component={WorkflowPrimaryTask} path="/task/:type/:instanceId/:taskName/:taskId" />
        </Switch>
    </AwardsApps>
);

export default Routes
