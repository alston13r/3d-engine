class Triangle {
  p: [Vector, Vector, Vector]
  c: string

  constructor(p1: Vector, p2: Vector, p3: Vector, c: string = '#fff') {
    this.p = [p1, p2, p3]
    this.c = c
  }

  static Copy(t: Triangle): Triangle {
    return new Triangle(t.p[0].copy(), t.p[1].copy(), t.p[2].copy(), t.c)
  }

  copy(): Triangle {
    return Triangle.Copy(this)
  }

  static FromPoints(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, x3: number, y3: number, z3: number): Triangle {
    return new Triangle(new Vector(x1, y1, z1), new Vector(x2, y2, z2), new Vector(x3, y3, z3))
  }

  static ApplyMatrix(t: Triangle, m: Matrix): Triangle {
    for (let i=0; i<3; i++) t.p[i] = Vector.Dot(t.p[i], m)
    return t
  }

  applyMatrix(m: Matrix): Triangle {
    return Triangle.ApplyMatrix(this.copy(), m)
  }

  static Translate(t: Triangle, v: Vector): Triangle {
    for (let i=0; i<3; i++) t.p[i] = Vector.Add(t.p[i], v)
    return t
  }

  translate(v: Vector): Triangle {
    return Triangle.Translate(this.copy(), v)
  }

  static Normal(t: Triangle): Vector {
    return t.p[1].sub(t.p[0]).cross(t.p[2].sub(t.p[0]))
  }

  normal(): Vector {
    return Triangle.Normal(this)
  }

  static ClipAgainstPlane(t: Triangle, planeP: Vector, planeN: Vector): Triangle[] {
    let inside: Vector[] = []
    let outside: Vector[] = []

    let dist = (p: Vector) => planeN.dot(p) - planeN.dot(planeP)

    if (dist(t.p[0]) > 0) inside.push(t.p[0])
    else outside.push(t.p[0])
    if (dist(t.p[1]) > 0) inside.push(t.p[1])
    else outside.push(t.p[1])
    if (dist(t.p[2]) > 0) inside.push(t.p[2])
    else outside.push(t.p[2])

    let ins: number = inside.length

    if (ins == 3) {
      return [t.copy()]
    }
    if (ins == 1) {
      let tc: Triangle = t.copy()
      tc.p[0] = inside[0]
      tc.p[1] = Vector.IntersectPlane(planeP, planeN, inside[0], outside[0])
      tc.p[2] = Vector.IntersectPlane(planeP, planeN, inside[0], outside[1])
      return [tc]
    }
    if (ins == 2) {
      let t1: Triangle = t.copy()
      let t2: Triangle = t.copy()

      t1.p[0] = inside[0]
      t1.p[1] = inside[1]
      t1.p[2] = Vector.IntersectPlane(planeP, planeN, inside[0], outside[0])

      t2.p[0] = inside[1]
      t2.p[1] = Vector.IntersectPlane(planeP, planeN, inside[1], outside[0])
      t2.p[2] = t1.p[2].copy()
      return [t1, t2]
    }
    return []
  }

  clipAgainstPlane(planeP: Vector, planeN: Vector): Triangle[] {
    return Triangle.ClipAgainstPlane(this, planeP, planeN)
  }

  static GetMidpoint(t: Triangle): Vector {
    let x: number = 0
    let y: number = 0
    let z: number = 0
    for (let p of t.p) {
      x += p.x
      y += p.y
      z += p.z
    }
    return new Vector(x/3, y/3, z/3)
  }
  static GetMidpointX = (t: Triangle): number => Triangle.GetMidpoint(t).x
  static GetMidpointY = (t: Triangle): number => Triangle.GetMidpoint(t).y
  static GetMidpointZ = (t: Triangle): number => Triangle.GetMidpoint(t).z
  getMidpoint = (): Vector => Triangle.GetMidpoint(this)
  getMidpointX = (): number => this.getMidpoint().x
  getMidpointY = (): number => this.getMidpoint().y
  getMidpointZ = (): number => this.getMidpoint().z
}