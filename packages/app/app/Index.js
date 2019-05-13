import React from 'react';
import { Dashboard } from 'component-dashboard/client';

export default ({history, children}) => <Dashboard history={history}>{children}</Dashboard>;
