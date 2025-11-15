// API Service - Real Supabase operations
// Mirrors functionality from the old api.js

import { getSupabase } from '../lib/config'

// Helper to add timeout to Supabase queries
const withTimeout = async (promise, timeoutMs = 10000, operationName = 'Query') => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`${operationName} timeout after ${timeoutMs}ms`)), timeoutMs)
  )

  return Promise.race([promise, timeoutPromise])
}

export const api = {
  // ==================== STUDENTS ====================

  async getMyStudents(churchId, userId) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('students')
      .select('*')
      .eq('church_id', churchId)
      .eq('parent_id', userId)
      .order('full_name')

    if (error) throw error
    return data || []
  },

  async getAllStudents(churchId) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('students')
      .select('*')
      .eq('church_id', churchId)
      .order('full_name')

    if (error) throw error
    return data || []
  },

  async getStudent(studentId, churchId) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('students')
      .select('*')
      .eq('id', studentId)
      .eq('church_id', churchId)
      .single()

    if (error) throw error
    return data
  },

  async createStudent(studentData, churchId, userId) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('students')
      .insert([{ ...studentData, parent_id: userId, church_id: churchId }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateStudent(studentId, updates, churchId) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('students')
      .update(updates)
      .eq('id', studentId)
      .eq('church_id', churchId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteStudent(studentId, churchId) {
    const sb = getSupabase()
    const { error } = await sb
      .from('students')
      .delete()
      .eq('id', studentId)
      .eq('church_id', churchId)

    if (error) throw error
  },

  // ==================== PAYMENTS ====================

  async getMyPayments(churchId, userId) {
    const sb = getSupabase()
    // Get payments for students where parent_id matches userId
    const { data, error } = await sb
      .from('payments')
      .select('*, students!inner(full_name, parent_id)')
      .eq('church_id', churchId)
      .eq('students.parent_id', userId)
      .order('payment_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getAllPayments(churchId) {
    const sb = getSupabase()
    const { data, error} = await sb
      .from('payments')
      .select('*, students(full_name, parent_id)')
      .eq('church_id', churchId)
      .order('payment_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createPayment(paymentData, churchId) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('payments')
      .insert([{ ...paymentData, church_id: churchId }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ==================== DOCUMENTS ====================

  async getMyDocuments(churchId, userId) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('documents')
      .select('*, students(full_name)')
      .eq('church_id', churchId)
      .eq('uploaded_by', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getAllDocuments(churchId) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('documents')
      .select('*, students(full_name)')
      .eq('church_id', churchId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getPendingDocuments(churchId) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('documents')
      .select('*, students(full_name), users(full_name)')
      .eq('church_id', churchId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async updateDocumentStatus(documentId, status, churchId) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('documents')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', documentId)
      .eq('church_id', churchId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ==================== TRIP MEMORIES ====================

  async getApprovedMemories(churchId) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('trip_memories')
      .select('*, students(full_name)')
      .eq('church_id', churchId)
      .eq('status', 'approved')
      .order('submitted_at', { ascending: false })

    if (error) throw error

    // Convert storage paths to public URLs
    const memoriesWithUrls = (data || []).map(memory => ({
      ...memory,
      photo_url: memory.photo_path
        ? sb.storage.from('trip-photos').getPublicUrl(memory.photo_path).data.publicUrl
        : null
    }))

    return memoriesWithUrls
  },

  async getPendingMemories(churchId) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('trip_memories')
      .select('*, students(full_name)')
      .eq('church_id', churchId)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false })

    if (error) throw error

    // Convert storage paths to public URLs
    const memoriesWithUrls = (data || []).map(memory => ({
      ...memory,
      photo_url: memory.photo_path
        ? sb.storage.from('trip-photos').getPublicUrl(memory.photo_path).data.publicUrl
        : null
    }))

    return memoriesWithUrls
  },

  async updateMemoryStatus(memoryId, status, churchId) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('trip_memories')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', memoryId)
      .eq('church_id', churchId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ==================== EVENTS ====================

  async getEvents(churchId) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('events')
      .select('*')
      .eq('church_id', churchId)
      .order('event_date')

    if (error) throw error
    return data || []
  },

  async createEvent(eventData, churchId) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('events')
      .insert([{ ...eventData, church_id: churchId }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateEvent(eventId, updates, churchId) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .eq('church_id', churchId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteEvent(eventId, churchId) {
    const sb = getSupabase()
    const { error } = await sb
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('church_id', churchId)

    if (error) throw error
  },

  // ==================== ADMIN STATS ====================

  async getAdminStats(churchId) {
    console.log('📊 API: getAdminStats called with churchId:', churchId)
    const sb = getSupabase()

    // Get all stats in parallel with 10 second timeout
    const [studentsRes, paymentsRes, documentsRes, memoriesRes, eventsRes] = await withTimeout(
      Promise.all([
        sb.from('students').select('id', { count: 'exact' }).eq('church_id', churchId),
        sb.from('payments').select('amount').eq('church_id', churchId),
        sb.from('documents').select('id', { count: 'exact' }).eq('church_id', churchId).eq('status', 'pending'),
        sb.from('trip_memories').select('id', { count: 'exact' }).eq('church_id', churchId).eq('status', 'pending'),
        sb.from('events').select('id', { count: 'exact' }).eq('church_id', churchId).gte('event_date', new Date().toISOString()),
      ]),
      10000,
      'getAdminStats'
    )

    console.log('📊 API: Query results:')
    console.log('  - Students:', studentsRes.count, 'Error:', studentsRes.error)
    console.log('  - Payments:', paymentsRes.data?.length, 'payments, Error:', paymentsRes.error)
    console.log('  - Pending Documents:', documentsRes.count, 'Error:', documentsRes.error)
    console.log('  - Pending Memories:', memoriesRes.count, 'Error:', memoriesRes.error)
    console.log('  - Upcoming Events:', eventsRes.count, 'Error:', eventsRes.error)

    // Check for errors
    if (studentsRes.error) console.error('❌ Students query error:', studentsRes.error)
    if (paymentsRes.error) console.error('❌ Payments query error:', paymentsRes.error)
    if (documentsRes.error) console.error('❌ Documents query error:', documentsRes.error)
    if (memoriesRes.error) console.error('❌ Memories query error:', memoriesRes.error)
    if (eventsRes.error) console.error('❌ Events query error:', eventsRes.error)

    // Calculate total payments
    const totalPaid = paymentsRes.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    console.log('📊 API: Total paid calculated:', totalPaid)

    const stats = {
      totalStudents: studentsRes.count || 0,
      totalPaid,
      pendingDocuments: documentsRes.count || 0,
      pendingMemories: memoriesRes.count || 0,
      upcomingEvents: eventsRes.count || 0,
    }

    console.log('📊 API: Returning stats:', stats)
    return stats
  },

  // ==================== SUPER ADMIN - CHURCHES ====================

  async getAllChurches() {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('churches')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  },

  async getChurch(churchId) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('churches')
      .select('*')
      .eq('id', churchId)
      .single()

    if (error) throw error
    return data
  },

  async createChurch(churchData) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('churches')
      .insert([churchData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateChurch(churchId, updates) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('churches')
      .update(updates)
      .eq('id', churchId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getChurchStats(churchId) {
    const sb = getSupabase()

    const [studentsRes, usersRes] = await Promise.all([
      sb.from('students').select('id', { count: 'exact' }).eq('church_id', churchId),
      sb.from('users').select('id', { count: 'exact' }).eq('church_id', churchId),
    ])

    return {
      studentCount: studentsRes.count || 0,
      userCount: usersRes.count || 0,
    }
  },

  // ==================== SUPER ADMIN - USERS ====================

  async getAllUsers() {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('users')
      .select('*, churches!church_id(name)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getUsersByChurch(churchId) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('users')
      .select('*')
      .eq('church_id', churchId)
      .order('full_name')

    if (error) throw error
    return data || []
  },

  async updateUser(userId, updates) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteUser(userId) {
    const sb = getSupabase()
    const { error } = await sb
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) throw error
  },
}
