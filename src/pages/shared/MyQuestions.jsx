import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import PortalLayout from '../../components/layout/PortalLayout'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../components/ui'
import { MessageSquare, Plus, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { useTenant } from '../../hooks/useTenant'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'

export default function MyQuestions() {
  const location = useLocation()
  const { churchId, church } = useTenant()
  const { user, userProfile } = useAuth()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAskQuestion, setShowAskQuestion] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [expandedQuestions, setExpandedQuestions] = useState(new Set())

  // Determine portal role based on URL path
  const getPortalRole = () => {
    const path = location.pathname
    if (path.startsWith('/super-admin')) return 'superadmin'
    if (path.startsWith('/admin')) return 'admin'
    if (path.startsWith('/student')) return 'student'
    if (path.startsWith('/parent')) return 'parent'
    return userProfile?.role || 'parent'
  }

  useEffect(() => {
    if (churchId) {
      loadMyQuestions()
    }
  }, [churchId])

  const loadMyQuestions = async () => {
    setLoading(true)
    try {
      const data = await api.getMyQuestions(churchId)
      setQuestions(data)
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitQuestion = async (e) => {
    e.preventDefault()
    if (!questionText.trim()) return

    setSubmitting(true)
    try {
      await api.submitQuestion(questionText, 'question', churchId)
      alert('Question submitted! An administrator will respond soon.')
      setQuestionText('')
      setShowAskQuestion(false)
      await loadMyQuestions()
    } catch (error) {
      console.error('Error submitting question:', error)
      alert('Failed to submit question: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleQuestion = (questionId) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedQuestions(newExpanded)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
      case 'complete':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="w-3 h-3" />
            Answered
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {status}
          </span>
        )
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <PortalLayout title="My Questions" role={getPortalRole()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Questions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Ask questions and view responses from administrators
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowAskQuestion(!showAskQuestion)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ask a Question
          </Button>
        </div>

        {/* Ask Question Form */}
        {showAskQuestion && (
          <Card>
            <CardHeader>
              <CardTitle>Submit a Question</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Question
                  </label>
                  <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows={4}
                    placeholder="What would you like to know?"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={submitting || !questionText.trim()}>
                    {submitting ? 'Submitting...' : 'Submit Question'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAskQuestion(false)
                      setQuestionText('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Questions List */}
        <Card>
          <CardHeader>
            <CardTitle>{questions.length} Question{questions.length !== 1 ? 's' : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Questions Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You haven't submitted any questions yet.
                </p>
                <Button onClick={() => setShowAskQuestion(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ask Your First Question
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((question) => (
                  <Card key={question.id} className="overflow-hidden">
                    <button
                      onClick={() => toggleQuestion(question.id)}
                      className="w-full px-6 py-4 flex items-start justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <MessageSquare className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white mb-1">
                              {question.question}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <span>{formatDate(question.created_at)}</span>
                              <span>•</span>
                              {getStatusBadge(question.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                      {expandedQuestions.has(question.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>

                    {expandedQuestions.has(question.id) && question.response && (
                      <div className="px-6 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/10">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                              Administrator Response
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {question.response}
                            </p>
                            {question.response_at && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Responded on {formatDate(question.response_at)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {expandedQuestions.has(question.id) && !question.response && (
                      <div className="px-6 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/10">
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                              Awaiting Response
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              An administrator will respond to your question soon.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}
