'use client'
import { answers, Question } from '@/components/Question'
import React from 'react'

type QuestionType = {
  id?: string
  text: string
  // Add other properties based on your actual question structure
}

type PageStatus = 'loading' | 'success' | 'empty' | 'not-found' | 'invalid-id' | 'error' | 'offline'

const FEEDBACK_TIMEOUT_MS = 30000

const TakeInterviewPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = React.use(params)

  const [questions, setQuestions] = React.useState<QuestionType[]>([])
  const [answers, setAnswers] = React.useState<answers>([])
  const [isFeedbackGenerated, setIsFeedbackGenerated] = React.useState(false)

  // Page (question-loading) state
  const [pageStatus, setPageStatus] = React.useState<PageStatus>('loading')
  const [pageError, setPageError] = React.useState<string | null>(null)
  const [isFetching, setIsFetching] = React.useState(false)
  const [fetchRetryCount, setFetchRetryCount] = React.useState(0)

  // Feedback submission state
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [feedbackError, setFeedbackError] = React.useState<string | null>(null)
  const [sessionExpired, setSessionExpired] = React.useState(false)
  const [submitRetryCount, setSubmitRetryCount] = React.useState(0)

  const abortRef = React.useRef<AbortController | null>(null)

  // Derive "all questions answered" without mutating state during render
  React.useEffect(() => {
    if (questions.length > 0 && answers.length === questions.length && !isFeedbackGenerated) {
      setIsFeedbackGenerated(true)
    }
  }, [questions.length, answers.length, isFeedbackGenerated])

  React.useEffect(() => {
    console.log('Answers updated:', answers)
  }, [answers])

  const fetchQuestions = React.useCallback(async () => {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      setPageStatus('invalid-id')
      setPageError('The interview link appears to be invalid or malformed.')
      return
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setPageStatus('offline')
      setPageError('No internet connection.')
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsFetching(true)
    setPageStatus('loading')
    setPageError(null)

    try {
      const res = await fetch('/api/vapi/get-all-questions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewId: id }),
        signal: controller.signal,
      })

      if (res.status === 401 || res.status === 403) {
        setSessionExpired(true)
        setPageStatus('error')
        setPageError('Your session has expired. Please sign in again.')
        return
      }

      if (res.status === 404) {
        setPageStatus('not-found')
        setPageError('We could not find this interview. It may have been removed or the link is incorrect.')
        return
      }

      if (!res.ok) {
        setPageStatus('error')
        setPageError(`Server error (${res.status}). Please try again.`)
        return
      }

      const data = await res.json()

      if (!data.success) {
        setPageStatus('error')
        setPageError(data.error || 'Unable to load interview questions.')
        return
      }

      const fetchedQuestions: QuestionType[] = Array.isArray(data.data) ? data.data : []

      if (fetchedQuestions.length === 0) {
        setQuestions([])
        setPageStatus('empty')
        return
      }

      setQuestions(fetchedQuestions)
      setPageStatus('success')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return
      }
      console.error('Error fetching questions:', err)
      const offline = typeof navigator !== 'undefined' && navigator.onLine === false
      setPageStatus(offline ? 'offline' : 'error')
      setPageError(offline ? 'No internet connection.' : 'Something went wrong while loading questions. Please try again.')
    } finally {
      setIsFetching(false)
    }
  }, [id])

  React.useEffect(() => {
    fetchQuestions()
    return () => {
      abortRef.current?.abort()
    }
  }, [fetchQuestions])

  const handleRetryFetch = () => {
    setFetchRetryCount((c) => c + 1)
    fetchQuestions()
  }

  const redirectToLogin = () => {
    window.location.href = '/login'
  }

  async function getFeedback() {
    if (isSubmitting) return

    if (answers.length !== questions.length) {
      setFeedbackError('Please answer all questions before submitting.')
      return
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setFeedbackError('No internet connection. Please check your network and try again.')
      return
    }

    setIsSubmitting(true)
    setFeedbackError(null)
    setSessionExpired(false)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FEEDBACK_TIMEOUT_MS)

    try {
      const res = await fetch('/api/vapi/generate-feedback', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, questions, interviewId: id }),
        signal: controller.signal,
      })

      if (res.status === 401 || res.status === 403) {
        setSessionExpired(true)
        setFeedbackError('Your session has expired. Please sign in again.')
        return
      }

      if (res.status === 404) {
        setFeedbackError('This interview could not be found. It may have been removed.')
        return
      }

      if (!res.ok) {
        setFeedbackError(`Server error (${res.status}). Please try again.`)
        return
      }

      const data = await res.json()

      if (data.success) {
        window.location.href = '/'
        return
      }

      setFeedbackError(data.error || 'Unable to generate feedback. Please try again.')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setFeedbackError('The request timed out. Please try again.')
        return
      }
      console.error('Error getting feedback:', err)
      const offline = typeof navigator !== 'undefined' && navigator.onLine === false
      setFeedbackError(
        offline
          ? 'No internet connection. Please check your network and try again.'
          : 'Something went wrong while generating feedback. Please try again.'
      )
    } finally {
      clearTimeout(timeoutId)
      setIsSubmitting(false)
    }
  }

  const handleRetryFeedback = () => {
    setSubmitRetryCount((c) => c + 1)
    setFeedbackError(null)
    getFeedback()
  }

  const isSubmitDisabled = !isFeedbackGenerated || isSubmitting || isFetching

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Interview Questions</h1>
          <p className="text-slate-400 text-lg">Answer each question by recording your response</p>
        </div>

        {/* Session expired card (shown regardless of which flow triggered it) */}
        {sessionExpired && (
          <ErrorCard
            title="Session expired"
            message="Your session has expired. Please sign in again."
            actionLabel="Sign in"
            onAction={redirectToLogin}
          />
        )}

        {/* Questions List / Page-level states */}
        {!sessionExpired && (
          <div className="space-y-8">
            {pageStatus === 'loading' && (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-slate-400 text-lg">Loading questions...</p>
              </div>
            )}

            {pageStatus === 'offline' && (
              <ErrorCard
                title="No internet connection"
                message="Please check your network connection and try again."
                actionLabel="Retry"
                onAction={handleRetryFetch}
                busy={isFetching}
              />
            )}

            {pageStatus === 'invalid-id' && (
              <ErrorCard
                title="Invalid interview link"
                message={pageError ?? 'This interview link is invalid.'}
              />
            )}

            {pageStatus === 'not-found' && (
              <ErrorCard
                title="Interview not found"
                message={pageError ?? 'We could not find this interview.'}
              />
            )}

            {pageStatus === 'error' && (
              <ErrorCard
                title="Something went wrong"
                message={pageError ?? 'Unable to load interview questions.'}
                actionLabel="Retry"
                onAction={handleRetryFetch}
                busy={isFetching}
              />
            )}

            {pageStatus === 'empty' && (
              <ErrorCard
                title="No questions available"
                message="This interview does not have any questions yet."
                actionLabel="Refresh"
                onAction={handleRetryFetch}
                busy={isFetching}
              />
            )}

            {pageStatus === 'success' &&
              questions.map((question, index) => (
                <div key={index} className="transform transition-all duration-300 hover:scale-[1.01]">
                  {/* Question Number Badge */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                      Question {index + 1} of {questions.length}
                    </div>
                  </div>

                  <Question question={typeof question === 'string' ? question : question.text} answers={answers} setAnswers={setAnswers} questionId={index} />
                </div>
              ))}
          </div>
        )}

        {/* Footer Section */}
        {pageStatus === 'success' && questions.length > 0 && (
          <div className="mt-16 text-center">
            <div className="inline-block bg-slate-900/50 border border-slate-700/50 rounded-lg px-6 py-4">
              <p className="text-slate-300 text-sm">
                💡 <span className="font-semibold">Tip:</span> Take your time and speak clearly for best results
              </p>
            </div>
          </div>
        )}

        {/* Feedback error card */}
        {feedbackError && !sessionExpired && (
          <div className="mt-8">
            <ErrorCard
              title="Couldn't submit your answers"
              message={feedbackError}
              actionLabel="Retry"
              onAction={handleRetryFeedback}
              busy={isSubmitting}
            />
          </div>
        )}

        {pageStatus === 'success' && questions.length > 0 && (
          <div className="mt-10 text-center">
            <button
              className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg cursor-pointer hover:from-purple-600 hover:to-blue-600 transition-all duration-200 hover:scale-103 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              onClick={getFeedback}
              disabled={isSubmitDisabled}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating feedback...
                </span>
              ) : (
                'Submit Answers'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Reusable inline error card that matches the page's existing dark/gradient design language.
 */
function ErrorCard({
  title,
  message,
  actionLabel,
  onAction,
  busy,
}: {
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
  busy?: boolean
}) {
  return (
    <div className="mx-auto max-w-2xl bg-slate-900/50 border border-red-500/40 rounded-lg px-6 py-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <p className="text-slate-400 text-sm">{message}</p>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            disabled={busy}
            className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-5 py-2 rounded-lg font-semibold text-sm shadow-lg cursor-pointer hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default TakeInterviewPage