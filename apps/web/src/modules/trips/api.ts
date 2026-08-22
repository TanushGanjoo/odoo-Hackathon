import type {
  CalendarResponse,
  ChecklistItem,
  CreateActivityInput,
  CreateExpenseInput,
  CreateStopInput,
  CreateTripInput,
  Stop,
  Trip,
  TripActivity,
  TripExpense,
  UpdateActivityInput,
  UpdateExpenseInput,
  UpdateStopInput,
  UpdateTripInput,
} from './types'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function request<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ error: 'Request failed' }))

    throw new Error(
      body.error || `Request failed (${response.status})`,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

/* =========================
   CURRENT USER
========================= */

export async function getMe(token: string) {
  return request<{
    user: {
      id: string
      clerkUserId: string
      email: string
      name?: string | null
      photoUrl?: string | null
    }
  }>('/api/me', token)
}

/* =========================
   TRIPS
========================= */

export async function getTrip(
  tripId: string,
  token: string,
): Promise<Trip> {
  const data = await request<{ trip: Trip }>(
    `/api/trips/${tripId}`,
    token,
  )

  return data.trip
}

export async function createTrip(
  input: CreateTripInput,
  token: string,
): Promise<Trip> {
  const data = await request<{ trip: Trip }>(
    '/api/trips',
    token,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )

  return data.trip
}

export async function updateTrip(
  tripId: string,
  input: UpdateTripInput,
  token: string,
): Promise<Trip> {
  const data = await request<{ trip: Trip }>(
    `/api/trips/${tripId}`,
    token,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  )

  return data.trip
}

export async function deleteTrip(
  tripId: string,
  token: string,
): Promise<void> {
  await request<void>(
    `/api/trips/${tripId}`,
    token,
    {
      method: 'DELETE',
    },
  )
}

/* =========================
   STOPS
========================= */

export async function getStops(
  tripId: string,
  token: string,
): Promise<Stop[]> {
  const data = await request<{ stops: Stop[] }>(
    `/api/trips/${tripId}/stops`,
    token,
  )

  return data.stops
}

export async function createStop(
  tripId: string,
  input: CreateStopInput,
  token: string,
): Promise<Stop> {
  const data = await request<{ stop: Stop }>(
    `/api/trips/${tripId}/stops`,
    token,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )

  return data.stop
}

export async function updateStop(
  tripId: string,
  stopId: string,
  input: UpdateStopInput,
  token: string,
): Promise<Stop> {
  const data = await request<{ stop: Stop }>(
    `/api/trips/${tripId}/stops/${stopId}`,
    token,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  )

  return data.stop
}

export async function deleteStop(
  tripId: string,
  stopId: string,
  token: string,
): Promise<void> {
  await request<void>(
    `/api/trips/${tripId}/stops/${stopId}`,
    token,
    {
      method: 'DELETE',
    },
  )
}

/* =========================
   ACTIVITIES
========================= */

export async function getActivities(
  tripId: string,
  stopId: string,
  token: string,
): Promise<TripActivity[]> {
  const data = await request<{ activities: TripActivity[] }>(
    `/api/trips/${tripId}/stops/${stopId}/activities`,
    token,
  )

  return data.activities
}

export async function createActivity(
  tripId: string,
  stopId: string,
  input: CreateActivityInput,
  token: string,
): Promise<TripActivity> {
  const data = await request<{ activity: TripActivity }>(
    `/api/trips/${tripId}/stops/${stopId}/activities`,
    token,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )

  return data.activity
}

export async function updateActivity(
  tripId: string,
  stopId: string,
  activityId: string,
  input: UpdateActivityInput,
  token: string,
): Promise<TripActivity> {
  const data = await request<{ activity: TripActivity }>(
    `/api/trips/${tripId}/stops/${stopId}/activities/${activityId}`,
    token,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  )

  return data.activity
}

export async function deleteActivity(
  tripId: string,
  stopId: string,
  activityId: string,
  token: string,
): Promise<void> {
  await request<void>(
    `/api/trips/${tripId}/stops/${stopId}/activities/${activityId}`,
    token,
    {
      method: 'DELETE',
    },
  )
}

/* =========================
   CALENDAR
========================= */

export async function getCalendar(
  tripId: string,
  token: string,
): Promise<CalendarResponse> {
  return request<CalendarResponse>(
    `/api/trips/${tripId}/calendar`,
    token,
  )
}

/* =========================
   CHECKLIST
========================= */

export async function getChecklist(
  tripId: string,
  token: string,
): Promise<ChecklistItem[]> {
  const data = await request<{ items: ChecklistItem[] }>(
    `/api/trips/${tripId}/checklist`,
    token,
  )

  return data.items
}

export async function createChecklistItem(
  tripId: string,
  input: {
    item: string
    isChecked?: boolean
  },
  token: string,
): Promise<ChecklistItem> {
  const data = await request<{ item: ChecklistItem }>(
    `/api/trips/${tripId}/checklist`,
    token,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )

  return data.item
}

export async function updateChecklistItem(
  tripId: string,
  itemId: string,
  input: {
    item?: string
    isChecked?: boolean
  },
  token: string,
): Promise<ChecklistItem> {
  const data = await request<{ item: ChecklistItem }>(
    `/api/trips/${tripId}/checklist/${itemId}`,
    token,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  )

  return data.item
}

export async function deleteChecklistItem(
  tripId: string,
  itemId: string,
  token: string,
): Promise<void> {
  await request<void>(
    `/api/trips/${tripId}/checklist/${itemId}`,
    token,
    {
      method: 'DELETE',
    },
  )
}

/* =========================
   EXPENSES
========================= */

export async function getExpenses(
  tripId: string,
  token: string,
): Promise<TripExpense[]> {
  const data = await request<{ expenses: TripExpense[] }>(
    `/api/trips/${tripId}/expenses`,
    token,
  )

  return data.expenses
}

export async function createExpense(
  tripId: string,
  input: CreateExpenseInput,
  token: string,
): Promise<TripExpense> {
  const data = await request<{ expense: TripExpense }>(
    `/api/trips/${tripId}/expenses`,
    token,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )

  return data.expense
}

export async function updateExpense(
  tripId: string,
  expenseId: string,
  input: UpdateExpenseInput,
  token: string,
): Promise<TripExpense> {
  const data = await request<{ expense: TripExpense }>(
    `/api/trips/${tripId}/expenses/${expenseId}`,
    token,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  )

  return data.expense
}

export async function deleteExpense(
  tripId: string,
  expenseId: string,
  token: string,
): Promise<void> {
  await request<void>(
    `/api/trips/${tripId}/expenses/${expenseId}`,
    token,
    {
      method: 'DELETE',
    },
  )
}