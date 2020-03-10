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
      <>
        <section className="hero is-fullheight">
          <div className="hero-body home-page-background">
            <div className="container home-page is-paddingless is-marginless">
              <div className="columns is-centered">
                <form className="column is-half" onSubmit={this.handleSubmit}>

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
          <div className="color-overlay"></div>
        </section>
      </>
    )
  }
 
}

export default Home