import React from 'react'
import { Link } from 'react-router-dom'

const ErrorPage = () => (
  <>
    <nav className="navbar has-background-primary is-size-4 no-result-navbar">
      <div className="container has-text-white">
        <div className="navbar-brand">
          <Link className="navbar-item has-text-weight-semibold has-text-white" to="/">🕺🏻 FunFindr</Link>
        </div>
        <div className="navbar-end">
          <Link className="navbar-item has-text-white is-size-5" to="/">Back to Search</Link>
        </div>
      </div>
    </nav>
    <section className="hero is-fullheight-with-navbar has-background-dark no-result-background">
      <div className="hero-body has-background-dark">
        <div className="container">
          <p className="title is-1 has-text-centered has-text-white">Oop something went wrong. Please try again.</p>
        </div>
      </div>
    </section>
  </>
)

export default ErrorPage