class Mesh {
  tris: Triangle[]
  midPoint: Vector

  constructor(tris: Triangle[]) {
    this.tris = tris
    if (tris.length > 0) {
      let minX: number = tris[0].p[0].x
      let maxX: number = minX
      let minY: number = tris[0].p[0].y
      let maxY: number = minY
      let minZ: number = tris[0].p[0].z
      let maxZ: number = minZ
      for (let t of tris) {
        for (let p of t.p) {
          if (p.x < minX) minX = p.x
          if (p.x > maxX) maxX = p.x
          if (p.y < minY) minY = p.y
          if (p.y > maxY) maxY = p.y
          if (p.z < minZ) minZ = p.z
          if (p.z > maxZ) maxZ = p.z
        }
      }
      this.midPoint = new Vector((minX+maxX)/2, (minY+maxY)/2, (minZ+maxZ)/2)
    } else {
      this.midPoint = new Vector()
    }
    if (this.midPoint.x != 0 || this.midPoint.y != 0 || this.midPoint.z != 0) {
      for (let t of this.tris) {
        Triangle.Translate(t, this.midPoint.scale(-1))
      }
      this.midPoint = new Vector()
    }
  }
}