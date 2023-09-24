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
  constructor(pos: Vector = new Vector(), orientation: OrientationMatrix = new OrientationMatrix(), mesh: Mesh) {
    super(pos, orientation)
    this.mesh = mesh
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
    super(pos, orientation, new Mesh([
      new Triangle(a.copy(), b.copy(), c.copy()),
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
  constructor(pos: Vector = new Vector(), subdivisions: number = 1, radius: number = 1, orientation: OrientationMatrix = new OrientationMatrix()) {
    let tris: Triangle[] = []

    


    super(pos, orientation, new Mesh(tris.map((t: Triangle) => t.copy())))
  }
}