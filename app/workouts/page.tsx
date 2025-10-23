'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

type WorkoutWithExercises = {
  id: string
  workout_date: string
  body_weight: number | null
  notes: string | null
  workout_exercises: {
    id: string
    exercise_id: string
    sets: number
    reps: number
    weight: number
    notes: string | null
    exercise: {
      id: string
      name: string
      category: string
    }
  }[]
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([])
  const [filteredWorkouts, setFilteredWorkouts] = useState<WorkoutWithExercises[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadWorkouts()
  }, [])

  useEffect(() => {
    filterWorkouts()
  }, [workouts, searchTerm, startDate, endDate])

  const loadWorkouts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (
            *,
            exercise:exercises (*)
          )
        `)
        .eq('user_id', user.id)
        .order('workout_date', { ascending: false })

      if (error) throw error
      setWorkouts(data || [])
    } catch (err) {
      console.error('Failed to load workouts:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterWorkouts = () => {
    let filtered = workouts

    if (searchTerm) {
      filtered = filtered.filter(workout =>
        workout.workout_exercises.some(we =>
          we.exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    if (startDate) {
      filtered = filtered.filter(workout => workout.workout_date >= startDate)
    }

    if (endDate) {
      filtered = filtered.filter(workout => workout.workout_date <= endDate)
    }

    setFilteredWorkouts(filtered)
  }

  const handleDeleteWorkout = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return

    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadWorkouts()
    } catch (err) {
      console.error('Failed to delete workout:', err)
    }
  }

  const calculateVolume = (workout: WorkoutWithExercises) => {
    return workout.workout_exercises.reduce(
      (total, we) => total + (we.sets * we.reps * we.weight),
      0
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Workout History
        </h1>
        <Link
          href="/workouts/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Log New Workout
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search exercises
            </label>
            <input
              type="text"
              placeholder="Search by exercise name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        {(searchTerm || startDate || endDate) && (
          <button
            onClick={() => {
              setSearchTerm('')
              setStartDate('')
              setEndDate('')
            }}
            className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Workouts List */}
      {filteredWorkouts.length > 0 ? (
        <div className="space-y-4">
          {filteredWorkouts.map((workout) => (
            <div key={workout.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {format(new Date(workout.workout_date), 'EEEE, MMMM d, yyyy')}
                  </h2>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {workout.body_weight && (
                      <span>Body weight: {workout.body_weight} lbs</span>
                    )}
                    <span>Exercises: {workout.workout_exercises.length}</span>
                    <span>Total volume: {calculateVolume(workout).toLocaleString()} lbs</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteWorkout(workout.id)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  Delete
                </button>
              </div>

              {workout.notes && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{workout.notes}</p>
                </div>
              )}

              <div className="space-y-3">
                {workout.workout_exercises.map((we) => (
                  <div key={we.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {we.exercise.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {we.sets} sets × {we.reps} reps @ {we.weight} lbs
                        </p>
                        {we.notes && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
                            {we.notes}
                          </p>
                        )}
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {we.exercise.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {workouts.length === 0 ? 'No workouts logged yet.' : 'No workouts match your filters.'}
          </p>
          {workouts.length === 0 && (
            <Link
              href="/workouts/new"
              className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Log your first workout
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
