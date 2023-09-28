class Vector extends Matrix {
  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
    super(1, 4)
    this.x = x
    this.y = y
    this.z = z
    this.w = w
  }

  get x(): number {return this.m[0][0]}
  get y(): number {return this.m[0][1]}
  get z(): number {return this.m[0][2]}
  get w(): number {return this.m[0][3]}

  set x(x: number) {this.m[0][0] = x}
  set y(y: number) {this.m[0][1] = y}
  set z(z: number) {this.m[0][2] = z}
  set w(w: number) {this.m[0][3] = w}

  static iHat: Vector = new Vector(1)
  static jHat: Vector = new Vector(0, 1)
  static kHat: Vector = new Vector(0, 0, 1)

  static Copy(v: Vector): Vector {
    return new Vector(v.x, v.y, v.z, v.w)
  }

  copy(): Vector {
    return Vector.Copy(this)
  }

  static Add(a: Vector, b: Vector | number): Vector {
    if (b instanceof Vector) {
      a.x += b.x
      a.y += b.y
      a.z += b.z      
    } else {
      a.x += b
      a.y += b
      a.z += b
    }
    return a
  }

  add(a: Vector | number): Vector {
    return Vector.Add(this.copy(), a)
  }

  static Sub(a: Vector, b: Vector | number): Vector {
    if (b instanceof Vector) {
      a.x -= b.x
      a.y -= b.y
      a.z -= b.z      
    } else {
      a.x -= b
      a.y -= b
      a.z -= b
    }
    return a
  }

  sub(a: Vector | number): Vector {
    return Vector.Sub(this.copy(), a)
  }

  static Scale(a: Vector, b: number): Vector {
    a.x *= b
    a.y *= b
    a.z *= b
    return a
  }

  scale(a: number): Vector {
    return Vector.Scale(this.copy(), a)
  }

  static Dot(a: Vector, b: Vector): number
  static Dot(a: Vector, b: Matrix): Vector
  static Dot(a: Matrix, b: Vector): Vector
  static Dot(a: Matrix, b: Matrix): Matrix
  static Dot(a: Vector | Matrix, b: Vector | Matrix): number | Vector | Matrix {
    return Matrix.Dot(a, b)
  }

  dot(a: Vector): number
  dot(a: Matrix): Vector
  dot(a: Vector | Matrix): number | Vector {
    return Vector.Dot(this, a)
  }

  static Div(a: Vector, b: number): Vector {
    a.x /= b
    a.y /= b
    a.z /= b
    return a
  }

  div(a: number): Vector {
    return Vector.Div(this.copy(), a)
  }

  static Mag(a: Vector): number {
    return Math.sqrt(a.x**2 + a.y**2 + a.z**2)
  }

  mag(): number {
    return Vector.Mag(this)
  }

  static Hat(a: Vector): Vector {
    let mag = a.mag()
    if (mag != 0) {
      return Vector.Div(a, a.mag())
    } return a
  }

  hat(): Vector {
    return Vector.Hat(this.copy())
  }

  static AngleBetween(a: Vector, b: Vector): number {
    return Math.acos(a.dot(b)/a.mag()/b.mag())
  }

  angleTo(a: Vector): number {
    return Vector.AngleBetween(this, a)
  }

  static CopyFrom(a: Vector, b: Vector): Vector {
    a.x = b.x
    a.y = b.y
    a.z = b.z
    a.w = b.w
    return a
  }

  static ProjectOnto(a: Vector, b: Vector): Vector {
    return Vector.CopyFrom(a, b.scale(a.dot(b)/b.dot(b)))
  }

  projectOnto(a: Vector): Vector {
    return Vector.ProjectOnto(this.copy(), a)
  }

  static Cross(a: Vector, b: Vector): Vector {
    return new Vector(a.y*b.z-a.z*b.y, a.z*b.x-a.x*b.z, a.x*b.y-a.y*b.x)
  }

  cross(a: Vector): Vector {
    return Vector.Cross(this, a)
  }

  static RotateAround(a: Vector, b: Vector, t: number): Vector
  static RotateAround(a: Vector[], b: Vector, t: number): Vector[]
  static RotateAround(a: Vector | Vector[], b: Vector, t: number): Vector | Vector[] {
    let cos = Math.cos(-t/2)
    let sin = Math.sin(-t/2)
    let q = new Quaternion(cos, b.hat().scale(sin))
    let qi = q.inverse()
    if (a instanceof Array) {
      let r: Vector[] = []
      for (let c of a) {
        let p = new Quaternion(0, c)
        let pRot = q.mul(p).mul(qi)
        r.push(Vector.CopyFrom(c, pRot.imaginary))
      }
      return r
    } else {
      let p = new Quaternion(0, a)
      let pRot = q.mul(p).mul(qi)
      return Vector.CopyFrom(a, pRot.imaginary)
    }
  }

  rotateAround(a: Vector, t: number): Vector {
    return Vector.RotateAround(this.copy(), a, t) as Vector
  }

  toXYArr(): [number, number] {
    return [this.x, this.y]
  }

  toXYZArr(): [number, number, number] {
    return [this.x, this.y, this.z]
  }

  toXYZWArr(): [number, number, number, number] {
    return [this.x, this.y, this.z, this.w]
  }

  static IntersectPlane(planeP: Vector, planeN: Vector, start: Vector, end: Vector): Vector {
    Vector.Hat(planeN)
    let d = -planeN.dot(planeP)
    let ad = start.dot(planeN)
    let bd = end.dot(planeN)
    let t = (-d-ad) / (bd-ad)
    let lineSE = end.sub(start)
    let lineSI = lineSE.scale(t)
    return start.add(lineSI)
  }

  static GetMidpoint(a: Vector, b: Vector): Vector {
    return a.add(b).div(2)
  }

  getMidpoint(v: Vector): Vector {
    return Vector.GetMidpoint(this, v)
  }

  static ToMatrix(v: Vector): Matrix {
    return Matrix.FromArr([v.x, v.y, v.z, v.w])
  }

  toMatrix(): Matrix {
    return Vector.ToMatrix(this)
  }

  static IsEqual(a: Vector, b: Vector, p: number = 0.001): boolean {
    return a.sub(b).mag() <= p
  }

  equals(v: Vector, p: number = 0.001): boolean {
    return Vector.IsEqual(this, v, p)
  }
}