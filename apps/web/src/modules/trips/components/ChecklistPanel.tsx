import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '@clerk/react'
import {
  createChecklistItem,
  deleteChecklistItem,
  getChecklist,
  updateChecklistItem,
} from '../api'
import type { ChecklistItem } from '../types'

interface ChecklistPanelProps {
  tripId: string
}

export function ChecklistPanel({
  tripId,
}: ChecklistPanelProps) {
  const { getToken } = useAuth()

  const [items, setItems] = useState<ChecklistItem[]>([])
  const [newItem, setNewItem] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadChecklist() {
      try {
        const token = await getToken()

        if (!token) {
          throw new Error('Authentication token unavailable')
        }

        const data = await getChecklist(tripId, token)
        setItems(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load checklist',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadChecklist()
  }, [tripId, getToken])

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const value = newItem.trim()

    if (!value) {
      return
    }

    try {
      const token = await getToken()

      if (!token) {
        throw new Error('Authentication token unavailable')
      }

      const item = await createChecklistItem(
        tripId,
        {
          item: value,
          isChecked: false,
        },
        token,
      )

      setItems((current) => [...current, item])
      setNewItem('')
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create checklist item',
      )
    }
  }

  async function handleToggle(item: ChecklistItem) {
    try {
      const token = await getToken()

      if (!token) {
        throw new Error('Authentication token unavailable')
      }

      const updated = await updateChecklistItem(
        tripId,
        item.id,
        {
          isChecked: !item.isChecked,
        },
        token,
      )

      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === updated.id
            ? updated
            : currentItem,
        ),
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update checklist item',
      )
    }
  }

  async function handleDelete(itemId: string) {
    try {
      const token = await getToken()

      if (!token) {
        throw new Error('Authentication token unavailable')
      }

      await deleteChecklistItem(
        tripId,
        itemId,
        token,
      )

      setItems((current) =>
        current.filter((item) => item.id !== itemId),
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete checklist item',
      )
    }
  }

  if (loading) {
    return (
      <section className="planner-card">
        Loading checklist...
      </section>
    )
  }

  return (
    <section className="planner-card">
      <div className="planner-card-header">
        <div>
          <p className="planner-eyebrow">PREPARATION</p>
          <h2>Checklist</h2>
        </div>
      </div>

      {error && (
        <p className="planner-error">
          {error}
        </p>
      )}

      <form
        className="checklist-form"
        onSubmit={handleAdd}
      >
        <input
          value={newItem}
          onChange={(event) =>
            setNewItem(event.target.value)
          }
          placeholder="Add something to pack or prepare..."
          maxLength={200}
        />

        <button type="submit">Add</button>
      </form>

      <div className="checklist-list">
        {items.length === 0 ? (
          <div className="planner-empty">
            No checklist items yet.
          </div>
        ) : (
          items.map((item) => (
            <div
              className="checklist-item"
              key={item.id}
            >
              <label>
                <input
                  type="checkbox"
                  checked={item.isChecked}
                  onChange={() =>
                    void handleToggle(item)
                  }
                />

                <span
                  className={
                    item.isChecked
                      ? 'checked'
                      : ''
                  }
                >
                  {item.item}
                </span>
              </label>

              <button
                type="button"
                className="icon-danger"
                onClick={() =>
                  void handleDelete(item.id)
                }
                aria-label={`Delete ${item.item}`}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  )
}