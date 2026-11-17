import { SENTIMENT } from '@/utils/constants.js'
import { SENTIMENT_DISPLAY } from '@/utils/ticketDisplay.js'

/** Accessible sentiment marker; neutral can be hidden on ticket cards. */
export default function SentimentIcon({ sentiment, showLabel = false, hideWhenNeutral = false }) {
  const display = SENTIMENT_DISPLAY[sentiment]
  if (!display || (hideWhenNeutral && sentiment === SENTIMENT.NEUTRAL)) return null
  return <span className="inline-flex items-center gap-1 text-sm" role="img" aria-label={display.label} title={display.label}><span aria-hidden="true">{display.emoji}</span>{showLabel && <span className="text-xs text-gray-600">{display.label}</span>}</span>
}
