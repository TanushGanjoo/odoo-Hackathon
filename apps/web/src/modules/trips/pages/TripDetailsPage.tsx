import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/react'
import {
  deleteStop,
  deleteTrip,
  getStops,
  getTrip,
} from '../api'
import type { Stop, Trip } from '../types'

interface TripDetailsPageProps {
  tripId: string
  onDeleted?: () => void
}

export function TripDetailsPage({
  tripId,
  onDeleted,
}: TripDetailsPageProps) {
  const { getToken } = useAuth()

  const [trip, setTrip] = useState<Trip | null>(null)
  const [stops, setStops] = useState<Stop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken()

        if (!token) {
          throw new Error('Authentication token unavailable')
        }

        const [tripData, stopData] = await Promise.all([
          getTrip(tripId, token),
          getStops(tripId, token),
        ])

        setTrip(tripData)
        setStops(stopData)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load trip',
        )
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [tripId, getToken])

  async function handleDeleteStop(stopId: string) {
    const token = await getToken()

    if (!token) {
      setError('Authentication token unavailable')
      return
    }

    try {
      await deleteStop(tripId, stopId, token)

      setStops((current) =>
        current.filter((stop) => stop.id !== stopId),
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete stop',
      )
    }
  }

  async function handleDeleteTrip() {
    const token = await getToken()

    if (!token) {
      setError('Authentication token unavailable')
      return
    }

    try {
      await deleteTrip(tripId, token)
      onDeleted?.()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete trip',
      )
    }
  }

  if (loading) {
    return (
      <div className="trip-details-loading">
        Loading trip...
      </div>
    )
  }

  if (error) {
    return <div className="planner-error">{error}</div>
  }

  if (!trip) {
    return <div className="planner-empty">Trip not found.</div>
  }

  return (
    <main className="trip-details">
      <header className="trip-details-header">
        {trip.coverPhoto && (
          <img
            src={trip.coverPhoto}
            alt=""
            className="trip-cover"
          />
        )}

        <div className="trip-title-block">
          <p className="planner-eyebrow">MY TRIP</p>

          <h1>{trip.name}</h1>

          {trip.description && (
            <p>{trip.description}</p>
          )}

          <div className="trip-meta">
            {trip.startDate && (
              <span>
                {new Date(
                  trip.startDate,
                ).toLocaleDateString()}
              </span>
            )}

            {trip.endDate && (
              <span>
                →
                {new Date(
                  trip.endDate,
                ).toLocaleDateString()}
              </span>
            )}

            {trip.budgetLimit !== null &&
              trip.budgetLimit !== undefined && (
                <span>
                  Budget ₹
                  {Number(trip.budgetLimit).toFixed(2)}
                </span>
              )}
          </div>
        </div>

        <button
          type="button"
          className="danger-button"
          onClick={() => void handleDeleteTrip()}
        >
          Delete trip
        </button>
      </header>

      <section className="stops-section">
        <div className="planner-card-header">
          <div>
            <p className="planner-eyebrow">ITINERARY</p>
            <h2>Stops</h2>
          </div>
        </div>

        {stops.length === 0 ? (
          <div className="planner-empty">
            No stops added to this trip yet.
          </div>
        ) : (
          <div className="stops-list">
            {stops.map((stop) => (
              <article
                key={stop.id}
                className="stop-card"
              >
                <div className="stop-number">
                  {stop.orderIndex + 1}
                </div>

                <div className="stop-content">
                  <h3>{stop.city.name}</h3>

                  <p>
                    {new Date(
                      stop.startDate,
                    ).toLocaleDateString()}
                    {' → '}
                    {new Date(
                      stop.endDate,
                    ).toLocaleDateString()}
                  </p>
                </div>

                <button
                  type="button"
                  className="danger-button"
                  onClick={() =>
                    void handleDeleteStop(stop.id)
                  }
                >
                  Remove
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}