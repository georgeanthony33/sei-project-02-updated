import React from 'react'
import { Link } from 'react-router-dom'

const EventCard = ({ eventname, id, largeimageurl, venue, date }) => {
  return (
    <div key={id} className="column is-one-quarter-desktop is-one-third-tablet is-half-mobile">
      <Link to={`/events/${id}`} className="focus-border-is-danger">
        <div className="card card-border">
          <div className="card-header">
            <h4 className="card-header-title">{eventname}</h4>
          </div>
          <div className="card-image">
            <figure className="image">
              <img src={largeimageurl} alt={eventname} />
            </figure>
          </div>
          <div className="card-content">
            <h5 className="title is-6">📌 {venue.name}</h5>
            <h5 className="title is-6">📍 {venue.town}</h5>
            <h5 className="title is-6">📅 {date}</h5>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default EventCard