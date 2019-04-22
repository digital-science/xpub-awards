import React from 'react';
import ReactDOM from 'react-dom';
import theme from 'ds-awards-theme';
import { Root } from 'pubsweet-client';
import { withClientState } from 'apollo-link-state';
import createHistory from 'history/createBrowserHistory';
// import { ModalProvider } from 'component-modal'

import Routes from './routes';
// import { JournalProvider } from 'xpub-journal'
// import { JournalProvider as HindawiJournalProvider } from 'component-journal-info'

// import * as journal from './config/journal'

// wait for PS to stop supporting redux
const store = {
    subscribe: () => {},
    dispatch: () => {},
    getState: () => {}
};

const history = createHistory();

const makeApolloConfig = ({ cache, link, ...config }) => {
    const clientState = withClientState({
        cache,
        resolvers: {
            Mutation: {
                updateAutosave: (_, { params }, { cache }) => {
                    const data = {
                        autosave: {
                            __typename: 'AutosaveState',
                            ...params
                        }
                    };
                    cache.writeData({ data });
                    return null;
                }
            }
        },
        defaults: {
            autosave: {
                __typename: 'AutosaveState',
                error: null,
                updatedAt: null,
                inProgress: false
            }
        }
    });

    return {
        cache,
        link: clientState.concat(link),
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
                store={store}
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
