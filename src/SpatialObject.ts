interface PositionableI {
  pos: Vector
  translate(v: Vector): void
}

function isPositionable(obj: any): obj is PositionableI {
  return 'pos' in obj
}

interface OrientableI {
  orientation: OrientationMatrix
  rotateX(t: number): void
  rotateY(t: number): void
  rotateZ(t: number): void
  rotateAround(axis: Vector, t: number): void
}

function isOrientable(obj: any): obj is OrientableI {
  return 'orientation' in obj
}

interface MeshableI {
  mesh: Mesh
}

function isMeshable(obj: any): obj is MeshableI {
  return 'mesh' in obj
}

interface LookableI extends PositionableI, OrientableI {
  lookAt(target: Vector, desiredUp: Vector): void
}

interface SpatialObject extends LookableI {
  worldMatrix: Matrix
}

class SpatialObject implements LookableI {
  constructor(pos: Vector = new Vector(), orientation: OrientationMatrix = new OrientationMatrix()) {
    this.pos = pos
    this.orientation = orientation
    this.#popWorldMatrix()
  }

  lookAt(target: Vector | PositionableI): void {
    let thisToTarget
    if (target instanceof Vector) thisToTarget = target.sub(this.pos)
    else if (isPositionable(target)) thisToTarget = target.pos.sub(this.pos)
    else thisToTarget = new Vector()
    this.orientation.forward = new Vector(0,0,1)
    this.orientation.up = new Vector(0,1,0)
    this.orientation.right = new Vector(1,0,0)
    let yawAngle = Math.atan2(thisToTarget.x, -thisToTarget.z)
    this.orientation.yaw(yawAngle)
    let pitchAngle = Math.atan2(thisToTarget.y, -Math.sqrt(thisToTarget.x**2+thisToTarget.z**2))
    this.orientation.pitch(pitchAngle)
    let rollAngle = Math.PI
    this.orientation.roll(rollAngle)
    this.#popWorldMatrix()
  }

  rotateAround(axis: Vector, t: number): void {
    this.orientation.rotateAround(axis, t)
    this.#popWorldMatrix()
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

  roll(t: number): void {
    this.orientation.roll(t)
    this.#popWorldMatrix()
  }

  pitch(t: number): void {
    this.orientation.pitch(t)
    this.#popWorldMatrix()
  }

  yaw(t: number): void {
    this.orientation.yaw(t)
    this.#popWorldMatrix()
  }

  translate(v: Vector): void {
    Vector.Add(this.pos, v)
    this.#popWorldMatrix()
  }

  #popWorldMatrix() {
    this.worldMatrix = this.orientation.copy()
    this.worldMatrix.m[3][0] = this.pos.x
    this.worldMatrix.m[3][1] = this.pos.y
    this.worldMatrix.m[3][2] = this.pos.z
  }
}

interface SpatialMeshable extends SpatialObject, MeshableI {}

class SpatialMeshable extends SpatialObject {
  constructor(pos: Vector = new Vector(), orientation: OrientationMatrix = new OrientationMatrix(), mesh: Mesh = new Mesh()) {
    super(pos, orientation)
    this.mesh = mesh
  }

  static Copy(obj: SpatialMeshable): SpatialMeshable {
    let tObj: SpatialMeshable = new SpatialMeshable()
    tObj.pos = obj.pos.copy()
    tObj.orientation = OrientationMatrix.Copy(tObj.orientation)
    tObj.mesh.tris = obj.mesh.tris.map((t: Triangle) => t.copy())
    return tObj
  }

  copy(): SpatialMeshable {
    return SpatialMeshable.Copy(this)
  }

  static Add(obj1: SpatialMeshable, obj2: SpatialMeshable): SpatialMeshable {
    let v: Vector = obj2.pos.sub(obj1.pos)
    for (let t of obj2.mesh.tris) {
      obj1.mesh.tris.push(t.translate(v))
    }
    return obj1
  }

  add(obj: SpatialMeshable): SpatialMeshable {
    return SpatialMeshable.Add(this.copy(), obj)
  }
}

class RectangularPrism extends SpatialMeshable {
  constructor(pos: Vector = new Vector(), xLength: number = 1, yLength: number = 1, zLength: number = 1, orientation: OrientationMatrix = new OrientationMatrix()) {
    let a = new Vector(0,       0,       0)
    let b = new Vector(0,       yLength, 0)
    let c = new Vector(xLength, yLength, 0)
    let d = new Vector(xLength, 0,       0)
    let e = new Vector(xLength, 0,       zLength)
    let f = new Vector(xLength, yLength, zLength)
    let g = new Vector(0,       yLength, zLength)
    let h = new Vector(0,       0,       zLength)
    let vertecies: Vector[] = [a,b,c,d,e,f,g,h]
    super(pos, orientation, new Mesh([
      new Triangle(0,1,2,vertecies),
      new Triangle(a.copy(), c.copy(), d.copy()),
      new Triangle(d.copy(), c.copy(), f.copy()),
      new Triangle(d.copy(), f.copy(), e.copy()),
      new Triangle(e.copy(), f.copy(), g.copy()),
      new Triangle(e.copy(), g.copy(), h.copy()),
      new Triangle(h.copy(), g.copy(), b.copy()),
      new Triangle(h.copy(), b.copy(), a.copy()),
      new Triangle(b.copy(), g.copy(), f.copy()),
      new Triangle(b.copy(), f.copy(), c.copy()),
      new Triangle(h.copy(), a.copy(), d.copy()),
      new Triangle(h.copy(), d.copy(), e.copy())
    ]))
  }
}

class Cube extends SpatialMeshable {
  constructor(pos: Vector = new Vector(), orientation: OrientationMatrix = new OrientationMatrix()) {
    super(pos, orientation, new RectangularPrism(pos, 1, 1, 1, orientation).mesh)
  }
}

class UVSphere extends SpatialMeshable {
  constructor(pos: Vector = new Vector(), radius: number = 1, horizontalDivisions: number = 4, verticalDivisions: number = 4, orientation: OrientationMatrix = new OrientationMatrix()) {
    horizontalDivisions = horizontalDivisions > 4 ? horizontalDivisions : 4
    verticalDivisions = verticalDivisions > 4 ? verticalDivisions : 4

    let tris: Triangle[] = []
    let vertecies: Vector[][] = []

    for (let i=0; i<=verticalDivisions; i++) {
      vertecies[i] = []
      let tau: number = 2*Math.PI*i/verticalDivisions
      for (let j=0; j<=horizontalDivisions; j++) {
        let theta: number = Math.PI*j/horizontalDivisions
        let vec: Vector = new Vector(Math.sin(theta), Math.cos(theta), 0)
        vertecies[i].push(vec.rotateAround(Vector.jHat, tau))
      }
    }

    for (let slice of vertecies) {
      for (let v of slice) {
        Vector.Scale(Vector.Hat(v), radius)
      }
    }

    for (let i=0; i<vertecies.length-1; i++) {
      let currSector: Vector[] = vertecies[i]
      let nextSector: Vector[] = vertecies[i+1]
      tris.push(new Triangle(currSector[0], nextSector[1], currSector[1]))
      for (let j=1; j<currSector.length-1; j++) {
        tris.push(new Triangle(currSector[j], nextSector[j], currSector[j+1]))
        if (j != currSector.length-2) tris.push(new Triangle(currSector[j+1], nextSector[j], nextSector[j+1]))
      }
    }

    super(pos, orientation, new Mesh(tris.map((t: Triangle) => t.copy())))
  }
}

class Icosphere extends SpatialMeshable {
  constructor(pos: Vector = new Vector(), subdivisions: number = 0, radius: number = 1, orientation: OrientationMatrix = new OrientationMatrix()) {
    let t: number = (1+Math.sqrt(5))/2
    let vertecies: Vector[] = [
      new Vector(-1,  t,  0),
      new Vector( 1,  t,  0),
      new Vector(-1, -t,  0),
      new Vector( 1, -t,  0),
      
      new Vector( 0, -1,  t),
      new Vector( 0,  1,  t),
      new Vector( 0, -1, -t),
      new Vector( 0,  1, -t),
      
      new Vector( t,  0, -1),
      new Vector( t,  0,  1),
      new Vector(-t,  0, -1),
      new Vector(-t,  0,  1)
    ].map((v: Vector) => Vector.Hat(v))

    let tris: Triangle[] = [
      Triangle.FromArr(0, 11, 5, vertecies),
      Triangle.FromArr(0, 5, 1, vertecies),
      Triangle.FromArr(0, 1, 7, vertecies),
      Triangle.FromArr(0, 7, 10, vertecies),
      Triangle.FromArr(0, 10, 11, vertecies),

      Triangle.FromArr(1, 5, 9, vertecies),
      Triangle.FromArr(5, 11, 4, vertecies),
      Triangle.FromArr(11, 10, 2, vertecies),
      Triangle.FromArr(10, 7, 6, vertecies),
      Triangle.FromArr(7, 1, 8, vertecies),

      Triangle.FromArr(3, 9, 4, vertecies),
      Triangle.FromArr(3, 4, 2, vertecies),
      Triangle.FromArr(3, 2, 6, vertecies),
      Triangle.FromArr(3, 6, 8, vertecies),
      Triangle.FromArr(3, 8, 9, vertecies),
      
      Triangle.FromArr(4, 9, 5, vertecies),
      Triangle.FromArr(2, 4, 11, vertecies),
      Triangle.FromArr(6, 2, 10, vertecies),
      Triangle.FromArr(8, 6, 7, vertecies),
      Triangle.FromArr(9, 8, 1, vertecies)
    ]

    for (let i=0; i<subdivisions; i++) {
      let tris2: Triangle[] = []
      for (let tri of tris) {
        let a = tri.p1.getMidpoint(tri.p2).hat()
        let b = tri.p2.getMidpoint(tri.p3).hat()
        let c = tri.p3.getMidpoint(tri.p1).hat()
        tris2.push(new Triangle(tri.p1, a, c).copy())
        tris2.push(new Triangle(tri.p2, b, a).copy())
        tris2.push(new Triangle(tri.p3, c, b).copy())
        tris2.push(new Triangle(a, b, c).copy())
      }
      tris = tris2
    }

    if (radius != 1) {
      for (let tri of tris) {
        tri.p1 = Vector.Scale(Vector.Hat(tri.p1), radius)
        tri.p2 = Vector.Scale(Vector.Hat(tri.p2), radius)
        tri.p3 = Vector.Scale(Vector.Hat(tri.p3), radius)
      }
    }

    super(pos, orientation, new Mesh(tris.map((t: Triangle) => t.copy())))
  }
}