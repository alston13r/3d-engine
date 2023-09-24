class Vector {
  constructor(x=0, y=0, z=0, w=1) {
    this.x = x
    this.y = y
    this.z = z
    this.w = w
  }
  static ihat = new Vector(1)
  static jhat = new Vector(0,1)
  static khat = new Vector(0,0,1)
  static Copy(v) {
    return new Vector(v.x, v.y, v.z, v.w)
  }
  copy() {
    return Vector.Copy(this)
  }
  static Add(a, b) {
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
  add(a) {
    return Vector.Add(this.copy(), a)
  }
  static Sub(a, b) {
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
  sub(a) {
    return Vector.Sub(this.copy(), a)
  }
  static Scale(a, b) {
    a.x *= b
    a.y *= b
    a.z *= b
    return a
  }
  scale(a) {
    return Vector.Scale(this.copy(), a)
  }
  static Dot(a, b) {
    if (a instanceof Vector && b instanceof Matrix) {
      return b.dot(a)
    } else if (a instanceof Matrix && b instanceof Vector) {
      return a.dot(b)
    } else if (a instanceof Vector && b instanceof Vector) {
      return a.x*b.x + a.y*b.y + a.z*b.z
    } else if (a instanceof Matrix && b instanceof Matrix) {
      return a.dot(b)
    }
  }
  dot(a) {
    return Vector.Dot(this, a)
  }
  static Div(a, b) {
    a.x /= b
    a.y /= b
    a.z /= b
    return a
  }
  div(a) {
    return Vector.Div(this.copy(), a)
  }
  static Mag(a) {
    return Math.sqrt(a.x**2 + a.y**2 + a.z**2)
  }
  mag() {
    return Vector.Mag(this)
  }
  static Hat(a) {
    return Vector.Div(a, a.mag())
  }
  hat() {
    return Vector.Hat(this.copy())
  }
  static AngleBetween(a, b) {
    return Math.acos(a.dot(b)/a.mag()/b.mag())
  }
  angleTo(a) {
    return Vector.AngleBetween(this, a)
  }
  static ProjectAontoB(a, b) {
    let c = b.scale(a.dot(b)/b.dot(b))
    a.x = c.x
    a.y = c.y
    a.z = c.z
    return a
  }
  projectOnto(a) {
    return Vector.ProjectAontoB(this.copy(), a)
  }
  static Cross(a, b) {
    return new Vector(a.y*b.z-a.z*b.y, a.z*b.x-a.x*b.z, a.x*b.y-a.y*b.x)
  }
  cross(a) {
    return Vector.Cross(this, a)
  }
  static RotateAround(a, b, t) {
    let para = a.projectOnto(b)
    let perp = a.sub(para)
    let rotated = perp.hat().scale(Math.cos(t)).add(b.cross(perp).hat().scale(Math.sin(t))).scale(perp.mag()).add(para)
    a.x = rotated.x
    a.y = rotated.y
    a.z = rotated.z
    return a
  }
  rotateAround(a, t) {
    return Vector.RotateAround(this.copy(), a, t)
  }
  toXYarr() {
    return [this.x, this.y]
  }
  toXYZarr() {
    return [this.x, this.y, this.z]
  }
  toXYZWarr() {
    return [this.x, this.y, this.z]
  }
  static IntersectPlane(planeP, planeN, start, end) {
    planeN = planeN.hat()
    let d = -planeN.dot(planeP)
    let ad = start.dot(planeN)
    let bd = end.dot(planeN)
    let t = (-d-ad) / (bd-ad)
    let lineSE = end.sub(start)
    let lineSI = lineSE.scale(t)
    return start.add(lineSI)
  }
}