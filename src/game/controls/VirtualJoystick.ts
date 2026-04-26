import * as Phaser from 'phaser'

const RADIUS = 60
const THUMB_MAX = 50

export interface JoystickOutput {
  x: number  // -1 to 1
  y: number  // -1 to 1
  active: boolean
}

/**
 * Floating virtual joystick.
 * Spawns wherever the player first touches the LEFT half of the screen.
 * Automatically hides when pointer is released.
 */
export class VirtualJoystick {
  private scene: Phaser.Scene
  private base: Phaser.GameObjects.Image
  private thumb: Phaser.GameObjects.Image
  private pointerId: number | null = null
  private baseX = 0
  private baseY = 0
  private output: JoystickOutput = { x: 0, y: 0, active: false }

  constructor(scene: Phaser.Scene) {
    this.scene = scene

    this.base = scene.add
      .image(0, 0, 'joystick-base')
      .setDepth(100)
      .setScrollFactor(0)
      .setAlpha(0)
      .setOrigin(0.5)

    this.thumb = scene.add
      .image(0, 0, 'joystick-thumb')
      .setDepth(101)
      .setScrollFactor(0)
      .setAlpha(0)
      .setOrigin(0.5)

    scene.input.on('pointerdown', this.onDown, this)
    scene.input.on('pointermove', this.onMove, this)
    scene.input.on('pointerup', this.onUp, this)
    scene.input.on('pointerupoutside', this.onUp, this)
  }

  getOutput(): JoystickOutput {
    return this.output
  }

  private onDown(pointer: Phaser.Input.Pointer) {
    if (this.pointerId !== null) return
    // Only activate on the LEFT 55% of the screen
    if (pointer.x > this.scene.scale.width * 0.55) return

    this.pointerId = pointer.id
    this.baseX = pointer.x
    this.baseY = pointer.y

    this.base.setPosition(this.baseX, this.baseY).setAlpha(1)
    this.thumb.setPosition(this.baseX, this.baseY).setAlpha(1)
    this.output.active = true
  }

  private onMove(pointer: Phaser.Input.Pointer) {
    if (pointer.id !== this.pointerId) return

    const dx = pointer.x - this.baseX
    const dy = pointer.y - this.baseY
    const dist = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)
    const clamped = Math.min(dist, THUMB_MAX)

    const tx = this.baseX + Math.cos(angle) * clamped
    const ty = this.baseY + Math.sin(angle) * clamped
    this.thumb.setPosition(tx, ty)

    const norm = Math.min(dist / RADIUS, 1)
    this.output.x = Math.cos(angle) * norm
    this.output.y = Math.sin(angle) * norm
  }

  private onUp(pointer: Phaser.Input.Pointer) {
    if (pointer.id !== this.pointerId) return
    this.pointerId = null
    this.base.setAlpha(0)
    this.thumb.setAlpha(0)
    this.output = { x: 0, y: 0, active: false }
  }

  destroy() {
    this.scene.input.off('pointerdown', this.onDown, this)
    this.scene.input.off('pointermove', this.onMove, this)
    this.scene.input.off('pointerup', this.onUp, this)
    this.scene.input.off('pointerupoutside', this.onUp, this)
    this.base.destroy()
    this.thumb.destroy()
  }
}
