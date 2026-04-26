'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { EventBus, EVENTS } from '@/game/EventBus'

const LEVEL_NAMES = ['', '探索者', '调查员', '洞见者', '智慧者候选', '智慧者']
const LEVEL_XP = [0, 100, 300, 600, 1000, 1500]

export function HUD() {
  const { xp, coins, level, currentScene } = useGameStore()

  // Sync XP and coin changes from Phaser events
  useEffect(() => {
    const offXP = EventBus.on(EVENTS.XP_CHANGE, (data: unknown) => {
      useGameStore.getState().addXP(data as number)
    })
    const offCoin = EventBus.on(EVENTS.COIN_CHANGE, (data: unknown) => {
      useGameStore.getState().addCoins(data as number)
    })
    return () => { offXP(); offCoin() }
  }, [])

  const nextXP = LEVEL_XP[level] ?? LEVEL_XP[LEVEL_XP.length - 1]
  const prevXP = LEVEL_XP[level - 1] ?? 0
  const progress = nextXP > prevXP ? (xp - prevXP) / (nextXP - prevXP) : 1

  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 pointer-events-none"
      style={{
        zIndex: 150,
        background: 'linear-gradient(to bottom, rgba(10,13,26,0.9) 0%, transparent 100%)',
      }}
    >
      {/* Left: Level + XP bar */}
      <div className="flex items-center gap-2">
        {/* Dragon avatar placeholder */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
          style={{ background: '#1D9E75', border: '2px solid #9FE1CB' }}
        >
          🐉
        </div>
        <div>
          <div className="text-xs font-bold" style={{ color: '#9FE1CB' }}>
            Lv{level} · {LEVEL_NAMES[level] ?? ''}
          </div>
          {/* XP bar */}
          <div
            className="w-28 h-2 rounded-full mt-0.5"
            style={{ background: 'rgba(100,120,200,0.3)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(progress * 100, 100)}%`,
                background: 'linear-gradient(to right, #4A90E2, #7B68EE)',
              }}
            />
          </div>
          <div className="text-xs mt-0.5" style={{ color: '#8890AA' }}>
            {xp} XP
          </div>
        </div>
      </div>

      {/* Right: Coins + Scene name */}
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1.5">
          <span style={{ color: '#F0C060' }}>💰</span>
          <span className="text-sm font-bold" style={{ color: '#F0C060' }}>
            {coins}
          </span>
        </div>
        <div className="text-xs" style={{ color: '#8890AA' }}>
          {currentScene === 'home' ? '小青龙的家' : '幻影大陆'}
        </div>
      </div>
    </div>
  )
}
