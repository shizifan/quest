import * as Phaser from 'phaser'
import type { VirtualJoystick } from '../controls/VirtualJoystick'

const SPEED = 180

export class Player extends Phaser.Physics.Arcade.Sprite {
  private joystick: VirtualJoystick

  constructor(scene: Phaser.Scene, x: number, y: number, joystick: VirtualJoystick) {
    super(scene, x, y, 'player')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.joystick = joystick
    this.setDepth(10)
    this.setCollideWorldBounds(true)
    // Shrink physics body slightly so player feels tight against walls
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(24, 24)
    body.setOffset(8, 12)
  }

  update() {
    const { x, y, active } = this.joystick.getOutput()
    const body = this.body as Phaser.Physics.Arcade.Body

    if (active && (Math.abs(x) > 0.1 || Math.abs(y) > 0.1)) {
      const speed = SPEED * Math.min(Math.sqrt(x * x + y * y), 1)
      body.setVelocity(x * speed, y * speed)

      // Flip sprite based on horizontal direction
      if (x < -0.1) this.setFlipX(true)
      else if (x > 0.1) this.setFlipX(false)
    } else {
      body.setVelocity(0, 0)
    }
  }
}
