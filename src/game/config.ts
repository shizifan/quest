// W1: scenes imported lazily to avoid SSR issues
export function buildGameConfig(parent: string) {
  // Dynamic requires ensure Phaser is not evaluated at SSR time
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Phaser = require('phaser')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Boot } = require('./scenes/Boot')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MapScene } = require('./scenes/MapScene')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { HomeScene } = require('./scenes/HomeScene')

  return {
    type: Phaser.AUTO as number,
    parent,
    backgroundColor: '#0A0D1A',
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    scale: {
      mode: Phaser.Scale.FIT as number,
      autoCenter: Phaser.Scale.CENTER_BOTH as number,
      width: 1280,
      height: 720,
    },
    scene: [Boot, MapScene, HomeScene],
  }
}
