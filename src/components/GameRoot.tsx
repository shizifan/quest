'use client'

import { useEffect, useRef } from 'react'
import { HUD } from './HUD'
import { Dialog } from './Dialog'
import { LandscapeGuard } from './LandscapeGuard'

export default function GameRoot() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<import('phaser').Game | null>(null)

  useEffect(() => {
    if (gameRef.current || !containerRef.current) return

    // Dynamically import Phaser so it only runs on client
    Promise.all([
      import('phaser'),
      import('@/game/config'),
    ]).then(([Phaser, { buildGameConfig }]) => {
      const config = buildGameConfig('phaser-container')
      gameRef.current = new Phaser.Game(config)
    })

    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [])

  return (
    <LandscapeGuard>
      <div ref={containerRef} className="relative w-full h-full" style={{ background: '#0A0D1A' }}>
        {/* Phaser canvas mounts here */}
        <div id="phaser-container" className="w-full h-full" />

        {/* React UI overlay — pointer-events: none by default, children opt-in */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 100 }}>
          <HUD />
          <Dialog />
        </div>
      </div>
    </LandscapeGuard>
  )
}
