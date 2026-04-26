import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SceneName = 'map' | 'home'

export interface FurnitureState {
  floor: boolean       // 木地板 (30 coin)
  bed: boolean         // 小床 (50 coin)
  desk: boolean        // 书桌 (60 coin)
  rug: boolean         // 地毯 (70 coin)
  curtain: boolean     // 窗帘 (50 coin)
  bookshelf: boolean   // 书架 (100 coin)
  lamp: boolean        // 油灯 (40 coin)
  telescope: boolean   // 望远镜 (350 coin)
}

export const FURNITURE_PRICES: Record<keyof FurnitureState, number> = {
  floor: 30,
  bed: 50,
  desk: 60,
  rug: 70,
  curtain: 50,
  bookshelf: 100,
  lamp: 40,
  telescope: 350,
}

export const FURNITURE_LABELS: Record<keyof FurnitureState, string> = {
  floor: '木地板',
  bed: '小床',
  desk: '书桌',
  rug: '地毯',
  curtain: '窗帘',
  bookshelf: '书架',
  lamp: '油灯',
  telescope: '望远镜',
}

interface GameState {
  xp: number
  coins: number
  level: number
  furniture: FurnitureState
  currentScene: SceneName
  // Actions
  addXP: (amount: number) => void
  addCoins: (amount: number) => void
  buyFurniture: (item: keyof FurnitureState) => boolean
  setScene: (scene: SceneName) => void
}

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500]

function calcLevel(xp: number): number {
  let level = 1
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1
  }
  return Math.min(level, LEVEL_THRESHOLDS.length)
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      xp: 0,
      coins: 0,
      level: 1,
      furniture: {
        floor: false,
        bed: false,
        desk: false,
        rug: false,
        curtain: false,
        bookshelf: false,
        lamp: false,
        telescope: false,
      },
      currentScene: 'map',

      addXP: (amount) =>
        set((s) => {
          const xp = s.xp + amount
          return { xp, level: calcLevel(xp) }
        }),

      addCoins: (amount) =>
        set((s) => ({ coins: Math.max(0, s.coins + amount) })),

      buyFurniture: (item) => {
        const { coins, furniture } = get()
        if (furniture[item]) return false
        const price = FURNITURE_PRICES[item]
        if (coins < price) return false
        set((s) => ({
          coins: s.coins - price,
          furniture: { ...s.furniture, [item]: true },
        }))
        return true
      },

      setScene: (scene) => set({ currentScene: scene }),
    }),
    { name: 'quest-save' }
  )
)
