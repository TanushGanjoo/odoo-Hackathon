import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/react'
import { getCalendar } from '../api'
import type { CalendarEvent } from '../types'

interface CalendarPanelProps {
  tripId: string
}

export function CalendarPanel({
  tripId,
}: CalendarPanelProps) {
  const { getToken } = useAuth()

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCalendar() {
      try {
        const token = await getToken()

        if (!token) {
          throw new Error('Authentication token unavailable')
        }

        const data = await getCalendar(tripId, token)

        setEvents(data.events)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load calendar',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadCalendar()
  }, [tripId, getToken])

  if (loading) {
    return <div className="planner-card">Loading calendar...</div>
  }

  return (
    <section className="planner-card">
      <div className="planner-card-header">
        <div>
          <p className="planner-eyebrow">ITINERARY</p>
          <h2>Trip calendar</h2>
        </div>
      </div>

      {error && <p className="planner-error">{error}</p>}

      {!error && events.length === 0 ? (
        <div className="planner-empty">
          Nothing scheduled yet.
        </div>
      ) : (
        <div className="calendar-list">
          {events.map((event) => (
            <article
              className="calendar-event"
              key={`${event.type}-${event.id}`}
            >
              <div className="calendar-event-date">
                {new Date(event.startDate).toLocaleDateString()}
              </div>

              <div className="calendar-event-content">
                <span className="calendar-event-type">
                  {event.type === 'stop' ? 'STOP' : 'ACTIVITY'}
                </span>

                <h3>{event.title}</h3>

                {event.city && <p>{event.city.name}</p>}

                {event.scheduledTime && (
                  <span>{event.scheduledTime}</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}