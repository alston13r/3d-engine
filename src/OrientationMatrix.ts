class OrientationMatrix extends Matrix {
  forward: Vector
  up: Vector
  right: Vector

  constructor(forward: Vector = new Vector(0, 0, 1), up: Vector = new Vector(0, 1, 0)) {
    super()
    for (let i=0; i<4; i++) this.m[i][i] = 1
    this.forward = forward.hat()
    this.up = up.hat()
    this.right = this.up.cross(this.forward)
    this.#popMat()
  }

  static Copy(mat: OrientationMatrix): OrientationMatrix {
    return new OrientationMatrix(mat.forward.copy(), mat.up.copy())
  }

  rotateAround(axis: Vector, t: number): void {
    Vector.RotateAround(this.forward, axis, t)
    Vector.RotateAround(this.up, axis, t)
    Vector.RotateAround(this.right, axis, t)
    this.#popMat()
  }

  roll(t: number): void {
    this.rotateAround(this.forward, t)
  }

  pitch(t: number): void {
    this.rotateAround(this.right, t)
  }

  yaw(t: number): void {
    this.rotateAround(this.up, t)
  }

  rotateX(t: number): void {
    this.rotateAround(Vector.iHat, t)
  }

  rotateY(t: number): void {
    this.rotateAround(Vector.jHat, t)
  }

  rotateZ(t: number): void {
    this.rotateAround(Vector.kHat, t)
  }

  #popMat(): void {
    let rotation: number[][] = [
      [this.right.x, this.right.y, this.right.z, 0],
      [this.up.x, this.up.y, this.up.z, 0],
      [this.forward.x, this.forward.y, this.forward.z, 0],
      [0, 0, 0, 1]
    ]
    Matrix.Map(this, (e,i,j) => rotation[i][j])
  }
}