'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

type ExerciseHistory = {
  exercise_id: string
  exercise_name: string
  data: {
    date: string
    weight: number
    volume: number
  }[]
}

export default function ProgressPage() {
  const [selectedExercise, setSelectedExercise] = useState<string>('')
  const [exercises, setExercises] = useState<{ id: string; name: string }[]>([])
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistory | null>(null)
  const [bodyWeightData, setBodyWeightData] = useState<{ date: string; weight: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState<'weight' | 'volume'>('weight')

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedExercise) {
      loadExerciseHistory(selectedExercise)
    }
  }, [selectedExercise])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load body weight history
      const { data: workouts } = await supabase
        .from('workouts')
        .select('workout_date, body_weight')
        .eq('user_id', user.id)
        .not('body_weight', 'is', null)
        .order('workout_date')

      if (workouts) {
        setBodyWeightData(
          workouts.map(w => ({
            date: format(new Date(w.workout_date), 'MMM d'),
            weight: w.body_weight,
          }))
        )
      }

      // Load exercises that user has performed
      const { data: performedExercises } = await supabase
        .from('workout_exercises')
        .select(`
          exercise:exercises (
            id,
            name
          ),
          workout:workouts!inner (
            user_id
          )
        `)
        .eq('workout.user_id', user.id)

      if (performedExercises) {
        const uniqueExercises = new Map()
        performedExercises.forEach((pe: any) => {
          if (pe.exercise) {
            uniqueExercises.set(pe.exercise.id, pe.exercise)
          }
        })
        const exercisesList = Array.from(uniqueExercises.values())
        setExercises(exercisesList)
        if (exercisesList.length > 0) {
          setSelectedExercise(exercisesList[0].id)
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadExerciseHistory = async (exerciseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('workout_exercises')
        .select(`
          sets,
          reps,
          weight,
          exercise:exercises (
            id,
            name
          ),
          workout:workouts!inner (
            user_id,
            workout_date
          )
        `)
        .eq('exercise_id', exerciseId)
        .eq('workout.user_id', user.id)
        .order('workout.workout_date')

      if (data && data.length > 0) {
        const history: ExerciseHistory = {
          exercise_id: exerciseId,
          exercise_name: (data[0] as any).exercise.name,
          data: data.map((item: any) => ({
            date: format(new Date(item.workout.workout_date), 'MMM d'),
            weight: item.weight,
            volume: item.sets * item.reps * item.weight,
          })),
        }
        setExerciseHistory(history)
      }
    } catch (err) {
      console.error('Failed to load exercise history:', err)
    }
  }

  const exportToCSV = () => {
    if (!exerciseHistory) return

    const headers = ['Date', 'Weight (lbs)', 'Volume (lbs)']
    const rows = exerciseHistory.data.map(d => [d.date, d.weight, d.volume])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exerciseHistory.exercise_name}_progress.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Progress Tracking
      </h1>

      {/* Body Weight Chart */}
      {bodyWeightData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Body Weight Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bodyWeightData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Body Weight (lbs)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Exercise Progress Chart */}
      {exercises.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Exercise Progress
            </h2>
            <div className="flex gap-3">
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setChartType('weight')}
              className={`px-4 py-2 rounded-md ${
                chartType === 'weight'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Weight Progress
            </button>
            <button
              onClick={() => setChartType('volume')}
              className={`px-4 py-2 rounded-md ${
                chartType === 'volume'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Volume Progress
            </button>
          </div>

          {exerciseHistory && exerciseHistory.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={exerciseHistory.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={chartType}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name={chartType === 'weight' ? 'Weight (lbs)' : 'Volume (lbs)'}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>No data available for this exercise yet.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No workout data available yet.
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Start logging workouts to see your progress!
          </p>
        </div>
      )}
    </div>
  )
}
