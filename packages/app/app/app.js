import React from 'react';
import ReactDOM from 'react-dom';
import theme from 'ds-awards-theme';
import Root from './Root';
import { createBrowserHistory } from 'history';
import Routes from './routes';


import SetupWorkflowAwardsUI from 'component-workflow-awards-ui/client/setup';
SetupWorkflowAwardsUI();

const history = createBrowserHistory();

const makeApolloConfig = ({ cache, link, ...config }) => {
    return {
        cache,
        link,
        ...config
    };
};

const render = () => {
    ReactDOM.render(
        <React.Fragment>
            <Root
                connectToWebSocket={false}
                history={history}
                makeApolloConfig={makeApolloConfig}
                routes={<Routes />}
                theme={theme}
            />
            <div id="ps-modal-root" style={{ height: 0 }} />
        </React.Fragment>,
        document.getElementById('root')
    );
};

render();


/*
const render = () => {
  ReactDOM.render(
    <React.Fragment>
      <ModalProvider>
        <HindawiJournalProvider journal={journal}>
          <JournalProvider journal={journal}>
            <Root
              connectToWebSocket={false}
              history={history}
              makeApolloConfig={makeApolloConfig}
              routes={<Routes />}
              store={store}
              theme={theme}
            />
          </JournalProvider>
        </HindawiJournalProvider>
      </ModalProvider>
      <div id="ps-modal-root" style={{ height: 0 }} />
    </React.Fragment>,
    document.getElementById('root'),
  )
} */
