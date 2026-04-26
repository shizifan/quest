import * as Phaser from 'phaser'
import { Player } from '../objects/Player'
import { VirtualJoystick } from '../controls/VirtualJoystick'
import { EventBus, EVENTS } from '../EventBus'

const TILE = 32
const COLS = 20
const ROWS = 14

// Furniture positions & textures (W2+ will swap in real graphics)
interface FurniturePiece {
  key: keyof import('@/store/gameStore').FurnitureState
  col: number
  row: number
  label: string
}

const FURNITURE_MAP: FurniturePiece[] = [
  { key: 'floor',     col: -1, row: -1, label: '' },      // whole-room effect, not a sprite
  { key: 'bed',       col: 2,  row: 2,  label: '小床' },
  { key: 'desk',      col: 14, row: 2,  label: '书桌' },
  { key: 'rug',       col: 8,  row: 6,  label: '地毯' },
  { key: 'curtain',   col: 9,  row: 1,  label: '窗帘' },
  { key: 'bookshelf', col: 15, row: 4,  label: '书架' },
  { key: 'lamp',      col: 3,  row: 5,  label: '油灯' },
  { key: 'telescope', col: 14, row: 9,  label: '望远镜' },
]

export class HomeScene extends Phaser.Scene {
  private player!: Player
  private joystick!: VirtualJoystick
  private walls!: Phaser.Physics.Arcade.StaticGroup
  private exitZone!: Phaser.GameObjects.Zone

  constructor() {
    super('HomeScene')
  }

  create() {
    const worldW = COLS * TILE
    const worldH = ROWS * TILE
    this.physics.world.setBounds(0, 0, worldW, worldH)

    this.buildInterior()
    this.joystick = new VirtualJoystick(this)
    this.spawnPlayer()
    this.renderFurniture()
    this.setupCamera(worldW, worldH)

    // Fade in
    this.cameras.main.fadeIn(300)

    EventBus.emit(EVENTS.SCENE_CHANGE, 'home')
    EventBus.emit(EVENTS.SCENE_READY, this)
  }

  // ─── Interior layout ────────────────────────────────────────────────────────
  private buildInterior() {
    this.walls = this.physics.add.staticGroup()
    const W = COLS
    const H = ROWS

    // Floor
    for (let r = 1; r < H - 1; r++) {
      for (let c = 1; c < W - 1; c++) {
        this.add.image(c * TILE + 16, r * TILE + 16, 'tile-floor')
      }
    }

    // Walls (border)
    for (let c = 0; c < W; c++) {
      this.addWall(c, 0)
      this.addWall(c, H - 1)
    }
    for (let r = 1; r < H - 1; r++) {
      this.addWall(0, r)
      this.addWall(W - 1, r)
    }

    // Door exit (bottom-center)
    const doorC = Math.floor(W / 2)
    this.add.image(doorC * TILE + 16, (H - 1) * TILE + 16, 'tile-door-in').setDepth(3)

    // Exit zone just inside the door
    this.exitZone = this.add.zone(doorC * TILE + 16, (H - 2) * TILE + 28, TILE, 20)
    this.physics.add.existing(this.exitZone, true)

    // Window (decorative, top area)
    const windowG = this.add.graphics()
    windowG.fillStyle(0x85b7eb, 0.6)
    windowG.fillRect(8 * TILE + 4, TILE + 4, TILE * 2 - 8, TILE - 8)
    windowG.lineStyle(3, 0x4a6e9e, 1)
    windowG.strokeRect(8 * TILE + 4, TILE + 4, TILE * 2 - 8, TILE - 8)
    windowG.setDepth(2)

    // Room title
    this.add.text(W * TILE / 2, 14, '小青龙的家', {
      fontSize: '14px',
      color: '#F0C060',
      stroke: '#0A0D1A',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10).setScrollFactor(0)
  }

  private addWall(col: number, row: number) {
    this.add.image(col * TILE + 16, row * TILE + 16, 'tile-wall').setDepth(2)
    const w = this.walls.create(col * TILE + 16, row * TILE + 16, 'tile-wall') as Phaser.Physics.Arcade.Sprite
    w.setAlpha(0).refreshBody()
  }

  // ─── Furniture rendering ────────────────────────────────────────────────────
  private renderFurniture() {
    // Dynamic import to avoid circular dependency with store
    import('@/store/gameStore').then(({ useGameStore }) => {
      const furniture = useGameStore.getState().furniture

      // Floor upgrade: tint the floor tiles warmer
      if (furniture.floor) {
        const overlay = this.add.rectangle(
          (COLS * TILE) / 2,
          (ROWS * TILE) / 2,
          (COLS - 2) * TILE,
          (ROWS - 2) * TILE,
          0xc8a450,
          0.25,
        )
        overlay.setDepth(1)
      }

      for (const piece of FURNITURE_MAP) {
        if (piece.key === 'floor') continue
        if (!furniture[piece.key]) continue
        this.drawFurniturePlaceholder(piece)
      }
    })
  }

  private drawFurniturePlaceholder(piece: FurniturePiece) {
    const x = piece.col * TILE + 16
    const y = piece.row * TILE + 16

    const colors: Record<string, number> = {
      bed: 0x7b4fa0,
      desk: 0x6b4226,
      rug: 0xb03030,
      curtain: 0x3a6b99,
      bookshelf: 0x5c3810,
      lamp: 0xfac775,
      telescope: 0x4a6090,
    }

    const color = colors[piece.key] ?? 0x888888
    const g = this.add.graphics()
    g.fillStyle(color, 0.85)
    g.fillRoundedRect(x - 14, y - 14, 28, 28, 4)
    g.setDepth(5)

    this.add.text(x, y + 20, piece.label, {
      fontSize: '11px',
      color: '#E8EEFF',
      stroke: '#0A0D1A',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(6)
  }

  // ─── Player ────────────────────────────────────────────────────────────────
  private spawnPlayer() {
    const doorC = Math.floor(COLS / 2)
    this.player = new Player(this, doorC * TILE + 16, (ROWS - 3) * TILE, this.joystick)
    this.physics.add.collider(this.player, this.walls)
    this.physics.add.overlap(this.player, this.exitZone, () => this.exitHome())
  }

  // ─── Camera ────────────────────────────────────────────────────────────────
  private setupCamera(worldW: number, worldH: number) {
    this.cameras.main.setBounds(0, 0, worldW, worldH)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
  }

  // ─── Exit ──────────────────────────────────────────────────────────────────
  private exitHome() {
    this.cameras.main.fadeOut(300, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.joystick.destroy()
      this.scene.start('MapScene')
    })
  }

  update() {
    this.player.update()
  }
}
