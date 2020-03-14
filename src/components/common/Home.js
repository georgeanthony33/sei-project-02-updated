import React from 'react'

class Home extends React.Component {
  state = {
    searchValues: {
      searchWord: '',
      searchDate: '',
      searchLocation: ''
    }
  }

  handleChange = e => {
    if (typeof e.target.value === Date) {
      e.target.value = e.target.value.toISOString().slice(0,10)
    }
    const searchValues = { ...this.state.searchValues, [e.target.name]: e.target.value }
    this.setState({ searchValues })
  }

  handleSubmit = e => {
    e.preventDefault()
    localStorage.setItem('searchWord', this.state.searchValues.searchWord)
    localStorage.setItem('searchDate', this.state.searchValues.searchDate)
    localStorage.setItem('searchLocation', this.state.searchValues.searchLocation)
    this.props.history.push('/events')
  }

  render() {
    return (
      <div className="homepage-outer-container">

        <div className="color-overlay"></div>

        <div className="homepage-inner-container">
          <div className="title-outer-container">
            <div className="title-inner-container">
              <h1 className="home-title">FunFindr</h1>
              <br />
              <h4 className="title is-3 has-text-white has-text-centered home-subtitle">Search for your favourite events, any time, any place!</h4>
            </div>
          </div>

          <div className="search-outer-container">
            <div className="columns is-centered">
              
              <form className="column" onSubmit={this.handleSubmit}>

                <div className="columns is-centered">
                  <div className="column">
                    <div className="field">
                      <div className="control">
                        <input className="input is-rounded event-input is-primary" type="text" name="searchWord" value={this.state.searchValues.searchWord} onChange={this.handleChange} placeholder="Find your event" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="columns is-centered">
                  <div className="column is-half">
                    <div className="field">
                      <div className="control">
                        <input className="input is-rounded is-primary" type="date" name="searchDate" value={this.state.searchValues.searchDate} onChange={this.handleChange} />
                      </div>
                    </div>
                  </div>
                  <div className="column is-half">
                    <div className="field">
                      <div className="control">
                        <input className="input is-rounded is-primary" type="text" name="searchLocation" value={this.state.searchValues.searchLocation} onChange={this.handleChange} placeholder="Anywhere"/>
                      </div>
                    </div>
                  </div>
                </div>
                  
                <div className="columns is-centered">
                  <div className="column is-half">
                    <div className="field">
                      <div className="control">
                        <button type="submit" className="button is-fullwidth is-primary is-size-5">Search</button>
                      </div>
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
          </div>
        </div>
      </div>
    )
  }
 
}

export default Home