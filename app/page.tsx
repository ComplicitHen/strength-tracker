import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
          Strength Tracker
        </h1>
        <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-8">
          Track your workouts, monitor your progress, and achieve your fitness goals
        </p>
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center items-center">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-3 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3 text-lg font-semibold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Log Workouts
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Easily track exercises, sets, reps, and weight for every workout session
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Track Progress
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Visualize your strength gains with charts and personal records
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Stay Motivated
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor body weight trends and celebrate your achievements
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
