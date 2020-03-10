import React from 'react'
import { Link } from 'react-router-dom'

class NavBar extends React.Component {
  state = { navOpen: false,
    searchValue: '',
    searchResult: null }

  handleChange = e => {
    this.setState({ searchValue: e.target.value })
  }

  handleSubmit = e => {
    e.preventDefault()
    localStorage.setItem('searchdata', this.state.searchValue)
    window.location.href = '/events'
  }

  toggleNavbar = () => {
    this.setState({ navOpen: !this.state.navOpen })
  }

  render() {
    return (
      <nav>
        <Link className="home-button" to="/">Home</Link>
        <form className="search-nav" onSubmit={this.handleSubmit}>
          <input className="search-bar-nav" type="text" value={this.state.searchValue} onChange={this.handleChange} placeholder="FIND YOUR EVENT"></input>
          <button type="submit" className="search-button-nav">Search</button>
        </form>
      </nav>
    )
  }
}

export default NavBar