'use client'

import { useEffect, useState } from 'react'

export function LandscapeGuard({ children }: { children: React.ReactNode }) {
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    const check = () => setIsPortrait(window.innerHeight > window.innerWidth)
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [])

  if (isPortrait) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center gap-4"
        style={{ background: '#0A0D1A', zIndex: 9999 }}
      >
        <div className="text-5xl">🐉</div>
        <div className="text-center px-8" style={{ color: '#E8EEFF' }}>
          <p className="text-xl font-bold mb-2">把手机横过来吧！</p>
          <p className="text-sm" style={{ color: '#8890AA' }}>小青龙的世界需要横屏才能探索</p>
        </div>
        <div className="text-3xl animate-bounce">↻</div>
      </div>
    )
  }

  return <>{children}</>
}
