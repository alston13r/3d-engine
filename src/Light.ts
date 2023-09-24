class Light extends SpatialObject {
  dir: Vector

  constructor(pos: Vector = new Vector(), dir: Vector = new Vector(0, 0, -1)) {
    super(pos, new OrientationMatrix(dir, new Vector(0, 1, 0)))
    this.dir = dir
  }
}