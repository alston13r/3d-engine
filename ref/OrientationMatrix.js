class OrientationMatrix extends Matrix {
  #xRot
  #yRot
  #zRot
  #xMat = Matrix.MakeIdentity()
  #yMat = Matrix.MakeIdentity()
  #zMat = Matrix.MakeIdentity()
  constructor(xRot=0, yRot=0, zRot=0, order='xyz') {
    super()
    this.order = order
    this.xRot = xRot
    this.yRot = yRot
    this.zRot = zRot
    for (let i=0; i<4; i++) this.m[i][i] = 1;
    this.#popMat()
  }
  set xRot(x) {
    this.#xRot = x
    this.#xMat = Matrix.MakeRotationX(x)
    this.#popMat()
  }
  get xRot() {
    return this.#xRot
  }
  rotateX(x) {
    this.xRot += x
  }
  set yRot(y) {
    this.#yRot = y
    this.#yMat = Matrix.MakeRotationY(y)
    this.#popMat()
  }
  get yRot() {
    return this.#yRot
  }
  rotateY(y) {
    this.yRot += y
  }
  set zRot(z) {
    this.#zRot = z
    this.#zMat = Matrix.MakeRotationZ(z)
    this.#popMat()
  }
  get zRot() {
    return this.#zRot
  }
  rotateZ(z) {
    this.zRot += z
  }
  rotate(x, y, z) {
    this.rotateX(x)
    this.rotateY(y)
    this.rotateZ(z)
  }
  #popMat() {
    let i0 = this.order[0]
    let i1 = this.order[1]
    let i2 = this.order[2]
    let mats = [i0, i1, i2].map(c => c=='x'?this.#xMat:(c=='y'?this.#yMat:this.#zMat))
    let rotation = mats[0].dot(mats[1]).dot(mats[2])
    Matrix.Map(this, (e,i,j) => rotation.m[i][j])
  }
}