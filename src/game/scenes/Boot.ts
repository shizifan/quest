import * as Phaser from 'phaser'

/**
 * Boot: generates all placeholder textures programmatically.
 * No external image files needed for W1.
 * Replace generateXxx() calls with real sprite sheet loads in later phases.
 */
export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot')
  }

  create() {
    this.generatePlayer()
    this.generateNPCs()
    this.generateMapTiles()
    this.generateHomeTiles()
    this.generateUI()
    this.scene.start('MapScene')
  }

  // ─── Player: 小青龙 (green dragon silhouette) ───────────────────────────
  private generatePlayer() {
    const g = this.make.graphics({ x: 0, y: 0 })

    // Body
    g.fillStyle(0x1d9e75)
    g.fillCircle(20, 22, 16)
    // Head
    g.fillStyle(0x23b87d)
    g.fillCircle(20, 10, 12)
    // Eyes
    g.fillStyle(0xffffff)
    g.fillCircle(15, 8, 4)
    g.fillCircle(25, 8, 4)
    g.fillStyle(0x085041)
    g.fillCircle(15, 8, 2)
    g.fillCircle(25, 8, 2)
    // Horn nubs
    g.fillStyle(0x085041)
    g.fillTriangle(12, 0, 8, -6, 16, -4)
    g.fillTriangle(28, 0, 24, -4, 32, -6)
    // Tail
    g.fillStyle(0x1d9e75)
    g.fillEllipse(34, 28, 10, 6)

    g.generateTexture('player', 40, 40)
    g.destroy()
  }

  // ─── NPCs ────────────────────────────────────────────────────────────────
  private generateNPCs() {
    this.generateBear()
  }

  private generateBear() {
    const g = this.make.graphics({ x: 0, y: 0 })
    // Body
    g.fillStyle(0x8b6340)
    g.fillCircle(24, 28, 20)
    // Belly
    g.fillStyle(0xd4a676)
    g.fillEllipse(24, 32, 22, 18)
    // Head
    g.fillStyle(0x8b6340)
    g.fillCircle(24, 14, 16)
    // Ears
    g.fillCircle(11, 4, 7)
    g.fillCircle(37, 4, 7)
    g.fillStyle(0xd4a676)
    g.fillCircle(11, 4, 4)
    g.fillCircle(37, 4, 4)
    // Eyes
    g.fillStyle(0x3d2010)
    g.fillCircle(18, 12, 3)
    g.fillCircle(30, 12, 3)
    // Nose
    g.fillStyle(0x3d2010)
    g.fillEllipse(24, 18, 8, 5)
    // Friendly smile
    g.lineStyle(2, 0x3d2010, 1)
    g.strokeCircle(24, 22, 4)

    g.generateTexture('bear', 48, 48)
    g.destroy()
  }

  // ─── Map tiles (village outdoor) ────────────────────────────────────────
  private generateMapTiles() {
    const TILE = 32

    // Grass
    const grass = this.make.graphics({ x: 0, y: 0 })
    grass.fillStyle(0x5a9e3c)
    grass.fillRect(0, 0, TILE, TILE)
    grass.fillStyle(0x4e8e32, 0.4)
    grass.fillRect(2, 2, 6, 3)
    grass.fillRect(14, 8, 5, 3)
    grass.fillRect(22, 18, 4, 3)
    grass.generateTexture('tile-grass', TILE, TILE)
    grass.destroy()

    // Stone path
    const stone = this.make.graphics({ x: 0, y: 0 })
    stone.fillStyle(0x9e9882)
    stone.fillRect(0, 0, TILE, TILE)
    stone.fillStyle(0x8a856e, 0.5)
    stone.fillRect(2, 2, 13, 13)
    stone.fillRect(17, 2, 13, 13)
    stone.fillRect(2, 17, 13, 13)
    stone.fillRect(17, 17, 13, 13)
    stone.generateTexture('tile-stone', TILE, TILE)
    stone.destroy()

    // Water
    const water = this.make.graphics({ x: 0, y: 0 })
    water.fillStyle(0x3a7bc8)
    water.fillRect(0, 0, TILE, TILE)
    water.fillStyle(0x5592d9, 0.4)
    water.fillRect(0, 8, TILE, 4)
    water.fillRect(0, 20, TILE, 4)
    water.generateTexture('tile-water', TILE, TILE)
    water.destroy()

    // Tree top (solid, used as wall)
    const tree = this.make.graphics({ x: 0, y: 0 })
    tree.fillStyle(0x2d6e20)
    tree.fillCircle(16, 14, 14)
    tree.fillStyle(0x236018)
    tree.fillCircle(10, 18, 8)
    tree.fillCircle(22, 18, 8)
    // Trunk
    tree.fillStyle(0x6b4226)
    tree.fillRect(12, 26, 8, 6)
    tree.generateTexture('tile-tree', TILE, TILE)
    tree.destroy()

    // House wall (exterior)
    const house = this.make.graphics({ x: 0, y: 0 })
    house.fillStyle(0xc8a86a)
    house.fillRect(0, 0, TILE, TILE)
    house.lineStyle(1, 0xa0824a, 0.6)
    house.strokeRect(4, 4, TILE - 8, TILE - 8)
    house.generateTexture('tile-house', TILE, TILE)
    house.destroy()

    // House roof
    const roof = this.make.graphics({ x: 0, y: 0 })
    roof.fillStyle(0x7b3f1a)
    roof.fillRect(0, 0, TILE, TILE)
    roof.fillStyle(0x6a3416, 0.6)
    for (let y = 0; y < TILE; y += 6) {
      roof.fillRect(0, y, TILE, 3)
    }
    roof.generateTexture('tile-roof', TILE, TILE)
    roof.destroy()

    // Door
    const door = this.make.graphics({ x: 0, y: 0 })
    door.fillStyle(0x5c3010)
    door.fillRect(4, 0, 24, 32)
    door.fillStyle(0xf0c060)
    door.fillCircle(24, 16, 3)
    door.generateTexture('tile-door', TILE, TILE)
    door.destroy()
  }

  // ─── Home interior tiles ─────────────────────────────────────────────────
  private generateHomeTiles() {
    const TILE = 32

    // Wood floor
    const floor = this.make.graphics({ x: 0, y: 0 })
    floor.fillStyle(0xc49a4e)
    floor.fillRect(0, 0, TILE, TILE)
    floor.fillStyle(0xad8540, 0.5)
    floor.fillRect(0, 0, TILE, 2)
    floor.fillRect(0, TILE / 2, TILE, 2)
    floor.generateTexture('tile-floor', TILE, TILE)
    floor.destroy()

    // Wall (interior)
    const wall = this.make.graphics({ x: 0, y: 0 })
    wall.fillStyle(0x2d3d5c)
    wall.fillRect(0, 0, TILE, TILE)
    wall.generateTexture('tile-wall', TILE, TILE)
    wall.destroy()

    // Exit door (interior side)
    const exitDoor = this.make.graphics({ x: 0, y: 0 })
    exitDoor.fillStyle(0x7a5028)
    exitDoor.fillRect(4, 0, 24, 32)
    exitDoor.fillStyle(0xfac775)
    exitDoor.fillCircle(8, 16, 3)
    exitDoor.generateTexture('tile-door-in', TILE, TILE)
    exitDoor.destroy()
  }

  // ─── UI elements ─────────────────────────────────────────────────────────
  private generateUI() {
    // Exclamation bubble (NPC has quest)
    const bubble = this.make.graphics({ x: 0, y: 0 })
    bubble.fillStyle(0xffffff)
    bubble.fillRoundedRect(0, 0, 28, 28, 6)
    bubble.fillStyle(0xf0c060)
    bubble.fillRect(12, 6, 4, 12)
    bubble.fillCircle(14, 22, 3)
    bubble.generateTexture('bubble-quest', 28, 28)
    bubble.destroy()

    // Joystick base
    const jBase = this.make.graphics({ x: 0, y: 0 })
    jBase.fillStyle(0xffffff, 0.15)
    jBase.fillCircle(60, 60, 60)
    jBase.lineStyle(2, 0xffffff, 0.3)
    jBase.strokeCircle(60, 60, 60)
    jBase.generateTexture('joystick-base', 120, 120)
    jBase.destroy()

    // Joystick thumb
    const jThumb = this.make.graphics({ x: 0, y: 0 })
    jThumb.fillStyle(0xffffff, 0.5)
    jThumb.fillCircle(36, 36, 36)
    jThumb.generateTexture('joystick-thumb', 72, 72)
    jThumb.destroy()
  }
}
