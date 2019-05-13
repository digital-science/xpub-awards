import React, { Fragment } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import styled, { createGlobalStyle } from 'styled-components';

import Header from './Header';
import Footer from './Footer';
import Sidebar from './Siderbar';


import './base.css';

const GlobalStyles = createGlobalStyle`
  body {
    height: 100vh;
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale; 
  }
`;

/*
const App = ({ autosave, journal = {}, goTo, children }) => (
    <Fragment>
        <GlobalStyles />
        <Container>
            <PageContent>{children}</PageContent>
        </Container>
    </Fragment>
);
*/

const App = ({ autosave, journal = {}, goTo, children }) => (
    <Fragment>
        <GlobalStyles />
        <Header/>
        <div className="HolyGrail-body">
            <main className="HolyGrail-content">{children}</main>
            <Sidebar>Nav</Sidebar>
        </div>
        <Footer/>
    </Fragment>
);


export default DragDropContext(HTML5Backend)(App);

const Container = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
`;

const PageContent = styled.main`
    flex: 1;
    overflow-y: auto;
`;

/*

import React, { Fragment } from 'react'
import { Route } from 'react-router'
import { DragDropContext } from 'react-dnd'
import { Footer } from 'component-hindawi-ui'
import HTML5Backend from 'react-dnd-html5-backend'
import styled, { createGlobalStyle } from 'styled-components'
import { AppBar } from 'component-authentication/client'
import { AutosaveIndicator, SubmitDraft } from 'component-submission/client'
import { queries } from 'component-dashboard/client'

const GlobalStyles = createGlobalStyle`
  body {
    height: 100vh;
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`

const HideOnPath = ({ component: Component, pathname }) => (
  <Route
    render={({ location }) => {
      if (location.pathname === pathname) return null
      return <Component />
    }}
  />
)

const App = ({ autosave, journal = {}, goTo, children }) => (
  <Fragment>
    <GlobalStyles />
    <Container>
      <HideOnPath
        component={() => (
          <AppBar
            autosaveIndicator={AutosaveIndicator}
            queries={{
              getManuscripts: queries.getManuscripts,
            }}
            submitButton={SubmitDraft}
          />
        )}
        pathname="/404"
      />

      <PageContent>{children}</PageContent>

      <HideOnPath component={Footer} pathname="/404" />
    </Container>
  </Fragment>
)

export default DragDropContext(HTML5Backend)(App)

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`

const PageContent = styled.main`
  flex: 1;
  overflow-y: auto;
`
*/