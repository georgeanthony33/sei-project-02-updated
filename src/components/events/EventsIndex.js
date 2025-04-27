import React from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import EventCard from './EventCard'

const skiddleAccessToken = process.env.SKIDDLE_ACCESS_TOKEN
const mapboxAccessToken = process.env.MAPBOX_ACCESS_TOKEN

class EventsIndex extends React.Component {
  state = {
    searchValues: {
      searchWord: '',
      searchDate: '',
      searchLocation: ''
    },
    eventCoordinates: [],
    eventSearchResult: []
  }

  componentDidMount() {
    const searchWord = localStorage.getItem('searchWord')
    let searchDate = localStorage.getItem('searchDate')
    const searchLocation = localStorage.getItem('searchLocation')
    if (!searchDate) {
      searchDate = new Date().toISOString().slice(0,10)
    }
    this.setState({
      ...this.state, 
      searchValues: {
        searchWord,
        searchDate,
        searchLocation
      }
    })
    searchLocation
      ?
      this.findCoordinates(searchLocation)
      :
      this.searchEventsNoLocation(searchWord, searchDate)
  }

  searchEventsNoLocation = async (word, minDate) => {
    try {
      const { data } = await axios.get(`https://www.skiddle.com/api/v1/events/search/?api_key=${skiddleAccessToken}&keyword=${word}&minDate=${minDate}&limit=100&order=distance&description=1`)
      this.setState({ eventSearchResult: data.results })
      this.checkSearch(data)
    } catch (err) {
      console.log(err)
    }
  }

  findCoordinates = async (location) => {
    try {
      const locationData = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?&access_token=${mapboxAccessToken}`)
      const eventCoordinates = [locationData.data.features[0].center[0], locationData.data.features[0].center[1]]
      this.setState({ eventCoordinates })
      this.searchEventsWithLocation(this.state.searchValues.searchWord, this.state.searchValues.searchDate, this.state.eventCoordinates[0], this.state.eventCoordinates[1])
    } catch (err) {
      console.log(err)
    }
  }

  searchEventsWithLocation = async (word, minDate, longitude, latitude) => {
    try {
      const { data } = await axios.get(`https://www.skiddle.com/api/v1/events/search/?api_key=${skiddleAccessToken}&keyword=${word}&minDate=${minDate}&latitude=${latitude}&longitude=${longitude}&radius=10&limit=100&order=distance&description=1`)
      this.setState({ eventSearchResult: data.results })
      this.checkSearch(data)
    } catch (err) {
      console.log(err)
    }
  }

  checkSearch = (data) => {
    if (data.results.length === 0) {
      this.props.history.push('/events/no-results')
    }
  }

  render() {
    return (
      <div className="index-page has-background-dark">
        <nav className="navbar is-primary has-text-weight-semibold is-size-4">
          <div className="container">
            <div className="navbar-brand">
              <Link className="navbar-item" to="/">🕺🏻 FunFindr</Link>
            </div>
          </div>
        </nav>
        <section className="section has-background-dark">
          <div className="container">
            <div className="columns is-mobile is-multiline">
              {this.state.eventSearchResult.map(event =>( 
                <EventCard key={event.id} {...event}/>
              ))
              }
            </div>
          </div>
        </section>
      </div>
    )
  }
}

export default EventsIndex