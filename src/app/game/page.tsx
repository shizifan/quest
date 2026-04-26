'use client'

import dynamic from 'next/dynamic'

// Phaser touches window/document — must be client-only, no SSR
const GameRoot = dynamic(() => import('@/components/GameRoot'), { ssr: false })

export default function GamePage() {
  return <GameRoot />
}
