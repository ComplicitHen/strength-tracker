'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className={className || "text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"}
    >
      Sign out
    </button>
  )
}
