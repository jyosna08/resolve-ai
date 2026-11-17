import SentimentIcon from '@/components/tickets/SentimentIcon.jsx'

/** Displays the AI triage summary and full sentiment. */
export default function AiSummarySection({ ticket }) {
  return <section className="rounded-xl border border-violet-200 bg-violet-50/60 p-4"><h3 className="text-sm font-semibold text-gray-900">AI Summary</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-gray-700"><li>{ticket.aiSummary?.trim() || 'No AI summary available'}</li></ul><div className="mt-3 flex items-center gap-2"><span className="text-xs font-medium text-gray-600">Sentiment:</span><SentimentIcon sentiment={ticket.sentiment} showLabel /></div></section>
}
