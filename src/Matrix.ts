enum RotationAxis {
  x, y, z
}

class Matrix {
  r: number
  c: number
  m: number[][]

  constructor(r: number = 4, c: number = 4) {
    this.r = r
    this.c = c
    this.m = new Array(r).fill(0).map(() => new Array(c).fill(0))
  }

  static Map(m: Matrix, fn: (e: number, i: number, j: number, m: Matrix) => number): Matrix {
    for (let i=0; i<m.r; i++) {
      for (let j=0; j<m.c; j++) {
        m.m[i][j] = fn(m.m[i][j], i, j, m)
      }
    }
    return m
  }

  static Copy(m: Matrix): Matrix {
    return Matrix.Map(new Matrix(m.r, m.c), (e, i, j) => m.m[i][j])
  }

  copy(): Matrix {
    return Matrix.Copy(this)
  }

  map(fn: (e: number, i: number, j: number, m: Matrix) => number) {
    return Matrix.Map(this.copy(), fn)
  }

  static Dot(a: Vector, b: Vector): number
  static Dot(a: Vector, b: Matrix): Vector
  static Dot(a: Matrix, b: Vector): Vector
  static Dot(a: Matrix, b: Matrix): Matrix
  static Dot(a: Vector | Matrix, b: Vector | Matrix): Vector | Matrix | number {
    if (a instanceof Vector) {
      if (b instanceof Vector) {
        return a.x*b.x + a.y*b.y + a.z*b.z
      } else {
        return a.toMatrix().dot(b).toVector()
      }
    } else {
      if (b instanceof Vector) {
        return b.toMatrix().dot(a).toVector()
      } else {
        return Matrix.Map(new Matrix(a.r, b.c), (e,i,j) => {
          let s = 0
          for (let k=0; k<a.c; k++) s += a.m[i][k] * b.m[k][j]
          return s
        })
      }
    }
  }

  dot(a: Vector): Vector
  dot(a: Matrix): Matrix
  dot(a: Vector | Matrix): Matrix | Vector {
    if (a instanceof Vector) return Matrix.Dot(a, this).toVector()
    return Matrix.Dot(this, a)
  }

  static ToVector(m: Matrix): Vector {
    return new Vector(m.m[0][0], m.m[0][1], m.m[0][2], m.m[0][3])
  }

  toVector(): Vector {
    return Matrix.ToVector(this)
  }

  static FromArr(arr: number[][]): Matrix
  static FromArr(arr: number[]): Matrix
  static FromArr(arr: number[][] | number[]): Matrix {
    if (arr[0] instanceof Array) {
      return Matrix.Map(new Matrix(arr.length, arr[0].length), (e, i, j) => (arr as number[][])[i][j])
    } else {
      return Matrix.Map(new Matrix(1, arr.length), (e,i,j) => (arr as number[])[j])
    }
  }

  static MakeIdentity(s: number | Matrix = 4): Matrix {
    if (s instanceof Matrix) {
      for (let i=0; i<s.r; i++) s.m[i][i] = 1
      return s
    }
    let m = new Matrix(s, s)
    for (let i=0; i<s; i++) m.m[i][i] = 1
    return m
  }

  static MakeProjectionMatrix(a: Wrapper, fov: number = 90, near: number = 0.1, far: number = 1000): Matrix {
    let m: Matrix = new Matrix()
    let asp: number = a.height / a.width
    let rad: number = 1 / Math.tan(fov/360*Math.PI)
    let q: number = far / (far - near)
    m.m[0][0] = asp*rad
    m.m[1][1] = rad
    m.m[2][2] = q
    m.m[3][2] = -near*q
    m.m[2][3] = 1
    return m
  }

  static MakeRotationX(theta: number = 0): Matrix {
    return Matrix.#MakeRotation('x', theta)
  }

  static MakeRotationY(theta: number = 0): Matrix {
    return Matrix.#MakeRotation('y', theta)
  }

  static MakeRotationZ(theta: number = 0): Matrix {
    return Matrix.#MakeRotation('z', theta)
  }

  static #MakeRotation(axis: keyof typeof RotationAxis, theta: number = 0): Matrix {
    let m = Matrix.MakeIdentity()
    if (theta != 0) {
      let cos: number = Math.cos(theta)
      let sin: number = Math.sin(theta)
      let a: number = axis == 'x' ? 1 : 0
      let b: number = axis == 'z' ? 1 : 2
      m.m[a][a] = cos
      m.m[a][b] = sin
      m.m[b][a] = -sin
      m.m[b][b] = cos
    }
    return m
  }

  static MakePointAt(pos: Vector, target: Vector, up: Vector): Matrix {
    let forward: Vector = target.sub(pos).hat()
    up = up.hat().sub(forward.scale(up.dot(forward))).hat()
    let right: Vector = forward.cross(up)
    return Matrix.FromArr([
      [right.x, right.y, right.z, 0],
      [up.x, up.y, up.z, 0],
      [forward.x, forward.y, forward.z, 0],
      [pos.x, pos.y, pos.z, 1]
    ])
  }

  static PointAtInverse(m: Matrix): Matrix {
    let n = Matrix.MakeIdentity()
    n.m[0][0] = m.m[0][0]
    n.m[0][1] = m.m[1][0]
    n.m[0][2] = m.m[2][0]
    n.m[1][0] = m.m[0][1]
    n.m[1][1] = m.m[1][1]
    n.m[1][2] = m.m[2][1]
    n.m[2][0] = m.m[0][2]
    n.m[2][1] = m.m[1][2]
    n.m[2][2] = m.m[2][2]
    n.m[3][0] = -(m.m[3][0] * n.m[0][0] + m.m[3][1] * n.m[1][0] + m.m[3][2] * n.m[2][0])
    n.m[3][1] = -(m.m[3][0] * n.m[0][1] + m.m[3][1] * n.m[1][1] + m.m[3][2] * n.m[2][1])
    n.m[3][2] = -(m.m[3][0] * n.m[0][2] + m.m[3][1] * n.m[1][2] + m.m[3][2] * n.m[2][2])
    return n
  }
}