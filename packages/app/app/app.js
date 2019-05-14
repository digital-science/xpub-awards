import React from 'react';
import ReactDOM from 'react-dom';
import theme from 'ds-awards-theme';
import Root from './Root';
//import { Root } from 'pubsweet-client';
import { createBrowserHistory } from 'history';

// import { ModalProvider } from 'component-modal'

import Routes from './routes';
// import { JournalProvider } from 'xpub-journal'
// import { JournalProvider as HindawiJournalProvider } from 'component-journal-info'

// import * as journal from './config/journal'


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
