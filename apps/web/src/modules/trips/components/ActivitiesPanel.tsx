import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/react'
import {
  deleteActivity,
  getActivities,
} from '../api'
import type { TripActivity } from '../types'

interface ActivitiesPanelProps {
  tripId: string
  stopId: string
}

export function ActivitiesPanel({
  tripId,
  stopId,
}: ActivitiesPanelProps) {
  const { getToken } = useAuth()

  const [activities, setActivities] = useState<TripActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadActivities() {
    setLoading(true)

    try {
      const token = await getToken()

      if (!token) {
        throw new Error('Authentication token unavailable')
      }

      const data = await getActivities(
        tripId,
        stopId,
        token,
      )

      setActivities(data)
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load activities',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadActivities()
  }, [tripId, stopId])

  async function handleDelete(activityId: string) {
    try {
      const token = await getToken()

      if (!token) {
        throw new Error('Authentication token unavailable')
      }

      await deleteActivity(
        tripId,
        stopId,
        activityId,
        token,
      )

      setActivities((current) =>
        current.filter(
          (item) => item.id !== activityId,
        ),
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete activity',
      )
    }
  }

  if (loading) {
    return (
      <div className="planner-card">
        Loading activities...
      </div>
    )
  }

  return (
    <section className="planner-card">
      <div className="planner-card-header">
        <div>
          <p className="planner-eyebrow">
            STOP ACTIVITIES
          </p>
          <h2>Things to do</h2>
        </div>
      </div>

      {error && (
        <p className="planner-error">
          {error}
        </p>
      )}

      {activities.length === 0 ? (
        <div className="planner-empty">
          No activities scheduled for this stop yet.
        </div>
      ) : (
        <div className="activity-list">
          {activities.map((item) => (
            <article
              className="activity-item"
              key={item.id}
            >
              <div>
                <h3>{item.activity.name}</h3>

                {item.notes && (
                  <p>{item.notes}</p>
                )}

                <div className="activity-meta">
                  {item.scheduledDate && (
                    <span>
                      {new Date(
                        item.scheduledDate,
                      ).toLocaleDateString()}
                    </span>
                  )}

                  {item.scheduledTime && (
                    <span>
                      {item.scheduledTime}
                    </span>
                  )}

                  {item.customCost !== null && (
                    <span>
                      ₹
                      {Number(
                        item.customCost,
                      ).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="danger-button"
                onClick={() =>
                  void handleDelete(item.id)
                }
              >
                Delete
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}