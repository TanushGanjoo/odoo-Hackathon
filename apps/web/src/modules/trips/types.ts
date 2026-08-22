export interface City {
  id: number
  name: string
  country?: string | null
}

export interface Stop {
  id: string
  tripId: string
  cityId: number
  orderIndex: number
  startDate: string
  endDate: string
  city: City
}

export interface Trip {
  id: string
  userId: string
  name: string
  description?: string | null
  startDate?: string | null
  endDate?: string | null
  coverPhoto?: string | null
  budgetLimit?: number | null
  isPublic: boolean
  stops: Stop[]
}

export interface CreateTripInput {
  name: string
  description?: string
  startDate?: string
  endDate?: string
  coverPhoto?: string
  budgetLimit?: number
  isPublic?: boolean
}

export interface UpdateTripInput {
  name?: string
  description?: string | null
  startDate?: string | null
  endDate?: string | null
  coverPhoto?: string | null
  budgetLimit?: number | null
  isPublic?: boolean
}

export interface CreateStopInput {
  cityId: number
  orderIndex: number
  startDate: string
  endDate: string
}

export interface UpdateStopInput {
  cityId?: number
  orderIndex?: number
  startDate?: string
  endDate?: string
}

export interface TripActivity {
  id: string
  stopId: string
  activityId: number
  scheduledDate: string | null
  scheduledTime: string | null
  customCost: number | null
  notes: string | null
  activity: {
    id: number
    name: string
    cost: number | null
  }
}

export interface CalendarEvent {
  type: 'stop' | 'activity'
  id: string
  title: string
  startDate: string
  endDate: string
  scheduledTime?: string | null
  city?: City
  notes?: string | null
  cost?: number | null
}

export interface CalendarResponse {
  trip: {
    id: string
    name: string
    startDate: string
    endDate: string
  }
  events: CalendarEvent[]
}

export interface ChecklistItem {
  id: string
  tripId: string
  item: string
  isChecked: boolean
}

export type ExpenseCategory =
  | 'transport'
  | 'stay'
  | 'activities'
  | 'meals'
  | 'other'

export interface TripExpense {
  id: string
  tripId: string
  category: ExpenseCategory
  amount: number
  paidBy: string | null
  note: string | null
  payer?: {
    id: string
    name?: string | null
  } | null
}

export interface CreateExpenseInput {
  category: ExpenseCategory
  amount: number
  paidBy?: string | null
  note?: string | null
}

export interface UpdateExpenseInput {
  category?: ExpenseCategory
  amount?: number
  paidBy?: string | null
  note?: string | null
}

export interface CreateActivityInput {
  activityId: number
  scheduledDate?: string
  scheduledTime?: string
  customCost?: number
  notes?: string
}

export interface UpdateActivityInput {
  activityId?: number
  scheduledDate?: string | null
  scheduledTime?: string | null
  customCost?: number | null
  notes?: string | null
}