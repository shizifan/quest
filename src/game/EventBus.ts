import * as Phaser from 'phaser'

const _emitter = new Phaser.Events.EventEmitter()

/**
 * Shared event bus between Phaser scenes and React components.
 * Returns an off() function from .on() so React useEffect can clean up easily.
 */
export const EventBus = {
  emit: (event: string, ...args: unknown[]) => _emitter.emit(event, ...args),
  /** Subscribe; returns an unsubscribe function for useEffect cleanup. */
  on: (event: string, fn: (...args: unknown[]) => void) => {
    _emitter.on(event, fn)
    return () => _emitter.off(event, fn)
  },
  off: (event: string, fn: (...args: unknown[]) => void) => _emitter.off(event, fn),
}

// ─── Event name constants ────────────────────────────────────────────────────
export const EVENTS = {
  // Scene → React
  SCENE_READY: 'scene-ready',
  NPC_NEARBY: 'npc-nearby',       // { npcId, name, text }
  NPC_LEFT: 'npc-left',
  DIALOG_OPEN: 'dialog-open',     // { npcId, lines: string[] }
  DIALOG_CLOSE: 'dialog-close',
  XP_CHANGE: 'xp-change',         // number
  COIN_CHANGE: 'coin-change',     // number
  SCENE_CHANGE: 'scene-change',   // 'map' | 'home'

  // React → Scene
  INTERACT_PRESS: 'interact-press',
  DIALOG_NEXT: 'dialog-next',
} as const
