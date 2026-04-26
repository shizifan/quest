'use client'

import { useEffect, useRef, useState } from 'react'
import { EventBus, EVENTS } from '@/game/EventBus'

interface DialogState {
  open: boolean
  npcId: string
  name: string
  lines: string[]
  lineIndex: number
}

const TYPING_SPEED = 40 // ms per character

export function Dialog() {
  const [state, setState] = useState<DialogState>({
    open: false, npcId: '', name: '', lines: [], lineIndex: 0,
  })
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const off1 = EventBus.on(EVENTS.DIALOG_OPEN, (data: unknown) => {
      const { npcId, name, lines } = data as { npcId: string; name: string; lines: string[] }
      setState({ open: true, npcId, name, lines, lineIndex: 0 })
      setDisplayed('')
      setDone(false)
    })
    const off2 = EventBus.on(EVENTS.DIALOG_CLOSE, (_data: unknown) => {
      setState((s) => ({ ...s, open: false }))
    })
    return () => { off1(); off2() }
  }, [])

  // Typewriter effect
  useEffect(() => {
    if (!state.open) return
    const text = state.lines[state.lineIndex] ?? ''
    let i = 0
    setDisplayed('')
    setDone(false)

    const tick = () => {
      i++
      setDisplayed(text.slice(0, i))
      if (i < text.length) {
        timerRef.current = setTimeout(tick, TYPING_SPEED)
      } else {
        setDone(true)
      }
    }
    timerRef.current = setTimeout(tick, TYPING_SPEED)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [state.open, state.lineIndex, state.lines])

  const advance = () => {
    if (!done) {
      // Skip typing: show full text
      if (timerRef.current) clearTimeout(timerRef.current)
      setDisplayed(state.lines[state.lineIndex])
      setDone(true)
      return
    }
    if (state.lineIndex < state.lines.length - 1) {
      setState((s) => ({ ...s, lineIndex: s.lineIndex + 1 }))
    } else {
      setState((s) => ({ ...s, open: false }))
    }
  }

  if (!state.open) return null

  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex items-end pb-6 px-4 pointer-events-auto"
      style={{ zIndex: 200 }}
    >
      <div
        className="w-full max-w-2xl mx-auto rounded-2xl p-4"
        style={{
          background: 'rgba(4, 44, 83, 0.97)',
          border: '2px solid #378ADD',
          boxShadow: '0 0 24px rgba(55, 138, 221, 0.3)',
        }}
        onClick={advance}
      >
        {/* NPC name */}
        <div className="text-sm font-bold mb-2" style={{ color: '#F0C060' }}>
          {state.name}
        </div>

        {/* Dialog text */}
        <div className="min-h-[64px] text-base leading-relaxed" style={{ color: '#E8EEFF', fontSize: '17px' }}>
          {displayed}
          {!done && <span className="animate-pulse">▌</span>}
        </div>

        {/* Progress and continue hint */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1">
            {state.lines.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: i <= state.lineIndex ? '#F0C060' : 'rgba(255,255,255,0.2)' }}
              />
            ))}
          </div>
          <div className="text-xs" style={{ color: '#8890AA' }}>
            {done ? (state.lineIndex < state.lines.length - 1 ? '点击继续 ›' : '点击关闭') : '点击跳过'}
          </div>
        </div>
      </div>
    </div>
  )
}
