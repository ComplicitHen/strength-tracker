import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get recent workouts with exercises
  const { data: recentWorkouts } = await supabase
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
    .limit(5)

  // Get personal records (max weight for each exercise)
  const { data: personalRecords } = await supabase
    .from('workout_exercises')
    .select(`
      exercise_id,
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
    .eq('workout.user_id', user.id)
    .order('weight', { ascending: false })

  // Process personal records to get max weight per exercise
  const recordsMap = new Map()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  personalRecords?.forEach((record: any) => {
    if (!recordsMap.has(record.exercise_id)) {
      recordsMap.set(record.exercise_id, {
        exercise: record.exercise,
        weight: record.weight,
        date: record.workout.workout_date,
      })
    }
  })
  const topRecords = Array.from(recordsMap.values()).slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {profile?.full_name || 'there'}!
        </h1>
        {profile?.current_weight && (
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Current weight: {profile.current_weight} lbs
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <Link
          href="/workouts/new"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          + Log New Workout
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Workouts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recent Workouts
            </h2>
            <Link href="/workouts" className="text-blue-600 dark:text-blue-400 hover:underline">
              View all
            </Link>
          </div>
          {recentWorkouts && recentWorkouts.length > 0 ? (
            <div className="space-y-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {recentWorkouts.map((workout: any) => (
                <div key={workout.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {format(new Date(workout.workout_date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {workout.workout_exercises?.length || 0} exercises
                      </p>
                    </div>
                    {workout.body_weight && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {workout.body_weight} lbs
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {workout.workout_exercises?.slice(0, 3).map((we: any) => (
                      <span key={we.id} className="inline-block mr-3">
                        {we.exercise.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No workouts logged yet.</p>
              <Link href="/workouts/new" className="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
                Log your first workout
              </Link>
            </div>
          )}
        </div>

        {/* Personal Records */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Personal Records
            </h2>
            <Link href="/progress" className="text-blue-600 dark:text-blue-400 hover:underline">
              View all
            </Link>
          </div>
          {topRecords && topRecords.length > 0 ? (
            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {topRecords.map((record: any) => (
                <div key={record.exercise.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {record.exercise.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(record.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {record.weight} lbs
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No personal records yet.</p>
              <p className="text-sm mt-1">Start logging workouts to track your PRs!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
