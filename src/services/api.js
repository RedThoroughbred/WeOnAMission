// API Service - Real Supabase operations
// Mirrors functionality from the old api.js

import { getSupabase } from '../lib/config'

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
    const { data, error } = await sb
      .from('payments')
      .select('*, students(full_name)')
      .eq('church_id', churchId)
      .eq('user_id', userId)
      .order('payment_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getAllPayments(churchId) {
    const sb = getSupabase()
    const { data, error} = await sb
      .from('payments')
      .select('*, students(full_name), users(full_name)')
      .eq('church_id', churchId)
      .order('payment_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createPayment(paymentData, churchId, userId) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('payments')
      .insert([{ ...paymentData, church_id: churchId, user_id: userId }])
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
      .order('uploaded_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getAllDocuments(churchId) {
    const sb = getSupabase()
    const { data, error } = await sb
      .from('documents')
      .select('*, students(full_name), users(full_name)')
      .eq('church_id', churchId)
      .order('uploaded_at', { ascending: false })

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
      .order('uploaded_at', { ascending: false })

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
    return data || []
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
    return data || []
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
    const sb = getSupabase()

    // Get all stats in parallel
    const [studentsRes, paymentsRes, documentsRes, memoriesRes, eventsRes] = await Promise.all([
      sb.from('students').select('id', { count: 'exact' }).eq('church_id', churchId),
      sb.from('payments').select('amount').eq('church_id', churchId),
      sb.from('documents').select('id', { count: 'exact' }).eq('church_id', churchId).eq('status', 'pending'),
      sb.from('trip_memories').select('id', { count: 'exact' }).eq('church_id', churchId).eq('status', 'pending'),
      sb.from('events').select('id', { count: 'exact' }).eq('church_id', churchId).gte('event_date', new Date().toISOString()),
    ])

    // Calculate total payments
    const totalPaid = paymentsRes.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    return {
      totalStudents: studentsRes.count || 0,
      totalPaid,
      pendingDocuments: documentsRes.count || 0,
      pendingMemories: memoriesRes.count || 0,
      upcomingEvents: eventsRes.count || 0,
    }
  },
}
