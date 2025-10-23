'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Exercise } from '@/lib/types/database.types'

type WorkoutExerciseInput = {
  exercise_id: string
  exercise_name: string
  sets: number
  reps: number
  weight: number
  notes?: string
}

export default function NewWorkoutPage() {
  const router = useRouter()
  const supabase = createClient()

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0])
  const [bodyWeight, setBodyWeight] = useState('')
  const [workoutNotes, setWorkoutNotes] = useState('')
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExerciseInput[]>([])
  const [selectedExerciseId, setSelectedExerciseId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      // Load exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .order('name')

      if (exercisesError) throw exercisesError
      setExercises(exercisesData || [])

      // Load user's current weight
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('current_weight')
          .eq('id', user.id)
          .single()

        if (profile?.current_weight) {
          setBodyWeight(profile.current_weight.toString())
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const addExercise = () => {
    if (!selectedExerciseId) return

    const exercise = exercises.find(e => e.id === selectedExerciseId)
    if (!exercise) return

    setWorkoutExercises([
      ...workoutExercises,
      {
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        sets: 3,
        reps: 10,
        weight: 0,
        notes: '',
      },
    ])
    setSelectedExerciseId('')
  }

  const updateExercise = (index: number, field: keyof WorkoutExerciseInput, value: string | number) => {
    const updated = [...workoutExercises]
    updated[index] = { ...updated[index], [field]: value }
    setWorkoutExercises(updated)
  }

  const removeExercise = (index: number) => {
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (workoutExercises.length === 0) {
      setError('Please add at least one exercise')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          workout_date: workoutDate,
          body_weight: bodyWeight ? parseFloat(bodyWeight) : null,
          notes: workoutNotes || null,
        })
        .select()
        .single()

      if (workoutError) throw workoutError

      // Insert workout exercises
      const workoutExercisesData = workoutExercises.map(we => ({
        workout_id: workout.id,
        exercise_id: we.exercise_id,
        sets: we.sets,
        reps: we.reps,
        weight: we.weight,
        notes: we.notes || null,
      }))

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercisesData)

      if (exercisesError) throw exercisesError

      router.push('/workouts')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workout')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Log New Workout
      </h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workout Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Workout Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Body Weight (lbs)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={bodyWeight}
                onChange={(e) => setBodyWeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Workout Notes
            </label>
            <textarea
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="How did you feel? Any observations?"
            />
          </div>
        </div>

        {/* Add Exercise */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Add Exercises
          </h2>
          <div className="flex gap-3">
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select an exercise...</option>
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name} ({exercise.category})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addExercise}
              disabled={!selectedExerciseId}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>

        {/* Exercise List */}
        {workoutExercises.length > 0 && (
          <div className="space-y-4">
            {workoutExercises.map((we, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {we.exercise_name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeExercise(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sets
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={we.sets}
                      onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reps
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={we.reps}
                      onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.5"
                      value={we.weight}
                      onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes (optional)
                  </label>
                  <input
                    type="text"
                    value={we.notes || ''}
                    onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., felt easy, need to increase weight"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || workoutExercises.length === 0}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? 'Saving...' : 'Save Workout'}
          </button>
        </div>
      </form>
    </div>
  )
}
