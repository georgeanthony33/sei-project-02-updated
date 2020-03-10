import React from 'react'
import axios from 'axios'
import MapGL, { Marker } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN
import { Link } from 'react-router-dom'
const apiKey = process.env.MY_API_KEY

class EventShow extends React.Component {
  state = {
    searchResult: null
  }

  componentDidMount() {
    const eventId = this.props.match.params.id
    this.searchEvents(eventId)
  }

  searchEvents = async (eId) => {
    try {
      const { data } = await axios.get(`https://www.skiddle.com/api/v1/events/${eId}/?api_key=${apiKey}`)
      this.setState({ searchResult: data.results })
    } catch (err) {
      console.log(err)
    }
  }

  render() {
    if (!this.state.searchResult) return null
    const { searchResult } = this.state
    return (
      <>
        <nav className="navbar has-background-primary is-size-4">
          <div className="container has-text-white">
            <div className="navbar-brand">
              <Link className="navbar-item has-text-weight-semibold has-text-white" to="/">🕺🏻 FunFindr</Link>
            </div>
            <div className="navbar-end">
              <Link className="navbar-item has-text-white is-size-5" to="/events">Back to Search</Link>
            </div>
          </div>
        </nav>

        <div className="show-banner">
          <div className="container">
            <div className="columns">
              <div className="column is-three-quarters">
                <h2 className="title is-2">{searchResult.eventname}</h2>
                <h4 className="title is-5">{searchResult.description}</h4>
                <br />
                <div className="columns">
                  <div className="column is-half">
                    <h4 className="title is-5">📍 {searchResult.venue.name}</h4>
                    <h4 className="title is-5">👤 Min Age: {searchResult.MinAge}</h4>
                  </div>
                  <div className="column is-half">
                    <h4 className="title is-5">📅  {searchResult.date}</h4>
                    <h4 className="title is-5">🕒  {searchResult.openingtimes.doorsopen}</h4>
                  </div>
                </div>
                <br />
                
              </div>
              <div className="column is-one-quarter">
                <figure className="image show-image-fig">
                  <img src={searchResult.largeimageurl} alt={searchResult.name} className="show-image" />
                </figure>
              </div>
            </div>
          </div>
        </div>
          
        <div className="show-page-background">
          <div className="show-page-body">
            <div className="columns">
              <div className="column is-7 has-text-centered map">
                <MapGL
                  mapboxApiAccessToken={mapboxToken}
                  height={'400px'}
                  width={'100%'}
                  mapStyle="mapbox://styles/mapbox/streets-v9"
                  zoom={13}
                  latitude={searchResult.venue.latitude * 1}
                  longitude={searchResult.venue.longitude * 1}
                >
                  {searchResult.venue.latitude &&
                  <Marker
                    latitude={searchResult.venue.latitude * 1}
                    longitude={searchResult.venue.longitude * 1}
                  >
                    <div className="marker"></div>
                  </Marker>
                  }
                </MapGL>
              </div>
              <div className="column is-1"></div>
              <div className="column is-4">
                <h4 className="title is-4 address-details">📍 {searchResult.venue.name}</h4>
                <p className="content is-medium is-marginless">{searchResult.venue.address}</p>
                <p className="content is-medium is-marginless">{searchResult.venue.town}</p>
                <p className="content is-medium is-marginless">{searchResult.venue.postcode}</p>
                <p className="content is-medium is-marginless">{searchResult.venue.city}</p>
                <br />
                <p className="content is-medium is-marginless">Tel: {searchResult.venue.phone}</p>
                <br />
                <p className="content is-medium is-marginless has-text-weight-semibold">Entry Price: {searchResult.entryprice}</p>
              </div>
            </div>       
          </div>
        </div>
      </>
    )
  }
}

export default EventShow