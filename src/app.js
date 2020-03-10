import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import './stylesheets/main.scss'
import 'bulma'

import Home from './components/common/Home'
import EventsIndex from './components/events/EventsIndex'
import EventShow from './components/events/EventShow'
import NoResults from './components/events/NoResults'
import ErrorPage from './components/common/ErrorPage'

const App = () => (
  <BrowserRouter>
    <>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/events/no-results" component={NoResults} />
        <Route path="/events/:id" component={EventShow} />
        <Route path="/events" component={EventsIndex} />
        <Route path="/*" component={ErrorPage} />
      </Switch>
    </>
  </BrowserRouter>
)

ReactDOM.render(
  <App />,
  document.getElementById('root')
)