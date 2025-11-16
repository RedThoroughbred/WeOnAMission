import { useState, useEffect } from 'react'
import { useTenant } from './useTenant'
import { useAuth } from './useAuth'
import { api } from '../services/api'

export function useNotifications() {
  const { churchId } = useTenant()
  const { userProfile } = useAuth()
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!churchId || !userProfile) return

    // Only admins get notifications
    if (userProfile.role !== 'admin' && userProfile.role !== 'superadmin') {
      setCount(0)
      setLoading(false)
      return
    }

    loadNotificationCount()

    // Refresh every 30 seconds
    const interval = setInterval(loadNotificationCount, 30000)
    return () => clearInterval(interval)
  }, [churchId, userProfile])

  const loadNotificationCount = async () => {
    try {
      let totalCount = 0

      // Count pending documents
      const documents = await api.getPendingDocuments(churchId)
      totalCount += documents.length

      // Count pending memories
      const memories = await api.getPendingMemories(churchId)
      totalCount += memories.length

      // Count unanswered questions
      const questions = await api.getQuestions(churchId, 'submitted')
      totalCount += questions.length

      setCount(totalCount)
    } catch (error) {
      console.error('Error loading notification count:', error)
      setCount(0)
    } finally {
      setLoading(false)
    }
  }

  return { count, loading, refresh: loadNotificationCount }
}
