import * as Phaser from 'phaser'
import { Player } from '../objects/Player'
import { VirtualJoystick } from '../controls/VirtualJoystick'
import { EventBus, EVENTS } from '../EventBus'

const TILE = 32
// World size in tiles
const COLS = 60
const ROWS = 38

// ─── Tile IDs ────────────────────────────────────────────────────────────────
const T = {
  GRASS: 0,
  STONE: 1,
  WATER: 2,
  TREE: 3,
  HOUSE: 4,
  ROOF: 5,
  DOOR: 6,
} as const

// ─── NPC definition ───────────────────────────────────────────────────────────
interface NpcDef {
  id: string
  name: string
  texture: string
  tileX: number
  tileY: number
  questBubble: boolean
  dialog: string[]
}

const NPCS: NpcDef[] = [
  {
    id: 'dabear',
    name: '大熊伯伯',
    texture: 'bear',
    tileX: 20,
    tileY: 20,
    questBubble: true,
    dialog: [
      '小青龙！你终于来啦！',
      '我们村子最近来了一位神奇的精灵——它什么都知道，但又有很多事不知道。',
      '去图书馆找琳娜贝尔，她知道更多。',
    ],
  },
]

export class MapScene extends Phaser.Scene {
  private player!: Player
  private joystick!: VirtualJoystick
  private walls!: Phaser.Physics.Arcade.StaticGroup
  private npcSprites: Phaser.GameObjects.Sprite[] = []
  private npcBubbles: Phaser.GameObjects.Image[] = []
  private doorZone!: Phaser.GameObjects.Zone
  private interactBtn!: Phaser.GameObjects.Arc
  private interactLabel!: Phaser.GameObjects.Text
  private nearbyNpc: NpcDef | null = null

  constructor() {
    super('MapScene')
  }

  create() {
    const worldW = COLS * TILE
    const worldH = ROWS * TILE
    this.physics.world.setBounds(0, 0, worldW, worldH)

    this.buildMap(worldW, worldH)
    this.joystick = new VirtualJoystick(this)
    this.spawnPlayer()
    this.spawnNPCs()
    this.buildInteractButton()
    this.setupCamera(worldW, worldH)
    this.setupTapToWalk()

    EventBus.emit(EVENTS.SCENE_CHANGE, 'map')
    EventBus.emit(EVENTS.SCENE_READY, this)
  }

  // ─── Map construction ──────────────────────────────────────────────────────
  private buildMap(worldW: number, worldH: number) {
    this.walls = this.physics.add.staticGroup()

    // Background: solid grass
    this.add.tileSprite(0, 0, worldW, worldH, 'tile-grass').setOrigin(0)

    // Stone paths
    this.drawPath(10, 22, 40, 22)   // horizontal main road
    this.drawPath(25, 10, 25, 35)   // vertical crossroad

    // Water feature (top-right area)
    for (let r = 5; r < 12; r++) {
      for (let c = 42; c < 52; c++) {
        this.add.image(c * TILE + 16, r * TILE + 16, 'tile-water')
      }
    }

    // Trees border
    this.addTrees()

    // 小青龙's house (center-left)
    this.buildHouse(14, 15)

    // Village entrance gate area
    this.drawPath(24, 34, 26, 37)
  }

  private drawPath(c0: number, r0: number, c1: number, r1: number) {
    for (let c = Math.min(c0, c1); c <= Math.max(c0, c1); c++) {
      for (let r = Math.min(r0, r1); r <= Math.max(r0, r1); r++) {
        this.add.image(c * TILE + 16, r * TILE + 16, 'tile-stone')
      }
    }
  }

  private addTrees() {
    const positions = [
      [5, 5], [6, 5], [7, 6], [8, 5], [9, 7],
      [50, 5], [51, 6], [52, 5], [53, 7],
      [5, 30], [6, 31], [7, 30],
      [52, 30], [53, 31], [54, 30],
      [30, 8], [32, 8], [34, 7],
      [40, 25], [41, 26], [42, 25],
    ]
    for (const [c, r] of positions) {
      const img = this.add.image(c * TILE + 16, r * TILE + 16, 'tile-tree')
      // Solid collider
      const body = this.walls.create(c * TILE + 16, r * TILE + 24, 'tile-tree') as Phaser.Physics.Arcade.Sprite
      body.setAlpha(0)
      body.refreshBody()
      img.setDepth(1)
    }
  }

  private buildHouse(tileC: number, tileR: number) {
    const W = 5 // tiles wide
    const H = 4 // tiles tall
    const px = tileC * TILE
    const py = tileR * TILE

    // Roof row
    for (let c = 0; c < W; c++) {
      this.add.image(px + c * TILE + 16, py + 16, 'tile-roof').setDepth(2)
      const wall = this.walls.create(px + c * TILE + 16, py + 16, 'tile-roof') as Phaser.Physics.Arcade.Sprite
      wall.setAlpha(0).refreshBody()
    }

    // Wall rows
    for (let r = 1; r < H - 1; r++) {
      for (let c = 0; c < W; c++) {
        this.add.image(px + c * TILE + 16, py + r * TILE + 16, 'tile-house')
        if (c === 0 || c === W - 1) {
          const wall = this.walls.create(px + c * TILE + 16, py + r * TILE + 16, 'tile-house') as Phaser.Physics.Arcade.Sprite
          wall.setAlpha(0).refreshBody()
        }
      }
    }

    // Bottom row: walls + door in middle
    const doorC = Math.floor(W / 2)
    for (let c = 0; c < W; c++) {
      if (c === doorC) {
        this.add.image(px + c * TILE + 16, py + (H - 1) * TILE + 16, 'tile-door').setDepth(3)
      } else {
        this.add.image(px + c * TILE + 16, py + (H - 1) * TILE + 16, 'tile-house')
        const wall = this.walls.create(px + c * TILE + 16, py + (H - 1) * TILE + 16, 'tile-house') as Phaser.Physics.Arcade.Sprite
        wall.setAlpha(0).refreshBody()
      }
    }

    // Invisible door zone (trigger to enter home)
    const doorX = px + doorC * TILE + 16
    const doorY = py + (H - 1) * TILE + 16
    this.doorZone = this.add.zone(doorX, doorY + 16, TILE, 20)
    this.physics.add.existing(this.doorZone, true)

    // House label
    this.add.text(px + (W * TILE) / 2, py - 12, '小青龙的家', {
      fontSize: '13px',
      color: '#F0C060',
      stroke: '#0A0D1A',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(5)
  }

  // ─── Player ────────────────────────────────────────────────────────────────
  private spawnPlayer() {
    // Spawn in front of house door
    const houseC = 14
    const houseR = 15
    const doorC = houseC + 2
    const px = doorC * TILE + 16
    const py = (houseR + 4) * TILE + 48

    this.player = new Player(this, px, py, this.joystick)
    this.physics.add.collider(this.player, this.walls)

    // Door overlap → enter home
    this.physics.add.overlap(this.player, this.doorZone, () => {
      this.enterHome()
    })
  }

  // ─── NPCs ──────────────────────────────────────────────────────────────────
  private spawnNPCs() {
    for (const npc of NPCS) {
      const x = npc.tileX * TILE + 16
      const y = npc.tileY * TILE + 16

      const sprite = this.add.sprite(x, y, npc.texture).setDepth(8).setScale(1.2)
      this.npcSprites.push(sprite)

      // Name label
      this.add.text(x, y + 36, npc.name, {
        fontSize: '12px',
        color: '#E8EEFF',
        stroke: '#0A0D1A',
        strokeThickness: 3,
      }).setOrigin(0.5).setDepth(9)

      // Quest bubble (hidden until nearby)
      const bubble = this.add.image(x + 20, y - 36, 'bubble-quest').setDepth(10).setAlpha(0)
      this.npcBubbles.push(bubble)

      // Tap NPC to walk-and-talk
      sprite.setInteractive({ useHandCursor: false })
      sprite.on('pointerdown', () => this.walkToAndTalk(npc, sprite))
    }
  }

  private walkToAndTalk(npc: NpcDef, _sprite: Phaser.GameObjects.Sprite) {
    const targetX = npc.tileX * TILE + 16
    const targetY = npc.tileY * TILE + 48
    // Move camera/player toward NPC then trigger dialog
    // For W1: just open dialog immediately
    this.openDialog(npc)
  }

  // ─── Proximity check ────────────────────────────────────────────────────────
  private checkNpcProximity() {
    const px = this.player.x
    const py = this.player.y
    let nearest: NpcDef | null = null
    let minDist = 90

    NPCS.forEach((npc, i) => {
      const nx = npc.tileX * TILE + 16
      const ny = npc.tileY * TILE + 16
      const dist = Phaser.Math.Distance.Between(px, py, nx, ny)

      if (dist < minDist) {
        minDist = dist
        nearest = npc as NpcDef
      }

      // Show/hide quest bubble
      this.npcBubbles[i].setAlpha(dist < 90 && npc.questBubble ? 1 : 0)
    })

    if (nearest !== this.nearbyNpc) {
      this.nearbyNpc = nearest
      const found = nearest as NpcDef | null
      if (found) {
        EventBus.emit(EVENTS.NPC_NEARBY, { npcId: found.id, name: found.name })
        this.setInteractActive(true)
      } else {
        EventBus.emit(EVENTS.NPC_LEFT)
        this.setInteractActive(false)
      }
    }
  }

  // ─── Interact button ────────────────────────────────────────────────────────
  private buildInteractButton() {
    const { width, height } = this.scale
    const x = width - 80
    const y = height - 80

    this.interactBtn = this.add
      .circle(x, y, 44, 0x1d9e75, 0.8)
      .setDepth(100)
      .setScrollFactor(0)
      .setAlpha(0.4)
      .setInteractive()

    this.interactLabel = this.add
      .text(x, y, '交谈', {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(101)
      .setScrollFactor(0)
      .setAlpha(0.4)

    this.interactBtn.on('pointerdown', () => {
      if (this.nearbyNpc) this.openDialog(this.nearbyNpc)
    })

    // Also listen for EventBus interact press from React HUD
    EventBus.on(EVENTS.INTERACT_PRESS, () => {
      if (this.nearbyNpc) this.openDialog(this.nearbyNpc)
    })
  }

  private setInteractActive(active: boolean) {
    const alpha = active ? 1 : 0.4
    this.interactBtn.setAlpha(alpha)
    this.interactLabel.setAlpha(alpha)
  }

  // ─── Dialog ────────────────────────────────────────────────────────────────
  private openDialog(npc: NpcDef) {
    EventBus.emit(EVENTS.DIALOG_OPEN, { npcId: npc.id, name: npc.name, lines: npc.dialog })
  }

  // ─── Camera ────────────────────────────────────────────────────────────────
  private setupCamera(worldW: number, worldH: number) {
    this.cameras.main.setBounds(0, 0, worldW, worldH)
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08)
  }

  // ─── Tap to walk ───────────────────────────────────────────────────────────
  private setupTapToWalk() {
    // Tap anywhere except left joystick zone and right interact zone → move toward tap
    // For W1 this is a simple version: emit nothing, player uses joystick only
    // Full pathfinding can be added in Phase 2
  }

  // ─── Enter home ────────────────────────────────────────────────────────────
  private enterHome() {
    this.cameras.main.fadeOut(300, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.joystick.destroy()
      this.scene.start('HomeScene')
    })
  }

  // ─── Update loop ────────────────────────────────────────────────────────────
  update() {
    this.player.update()
    this.checkNpcProximity()
    // Animate NPC bubbles (gentle bob)
    const t = this.time.now / 500
    this.npcBubbles.forEach((b) => {
      if (b.alpha > 0) b.y = (NPCS[0].tileY * TILE - 36) + Math.sin(t) * 3
    })
  }
}
