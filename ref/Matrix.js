class Matrix {
  constructor(r=4,c=4) {
    this.r = r
    this.c = c
    this.m = new Array(r).fill().map(() => new Array(c).fill(0))
  }
  static Map(m, fn) {
    for (let i=0; i<m.r; i++) {
      for (let j=0; j<m.c; j++) {
        m.m[i][j] = fn(m.m[i][j], i, j, m)
      }
    }
    return m
  }
  static Copy(m) {
    let n = new Matrix(m.r, m.c)
    Matrix.Map(n, (e,i,j) => m.m[i][j])
    return n
  }
  copy() {
    return Matrix.Copy(this)
  }
  map(fn) {
    return Matrix.Map(this.copy(), fn)
  }
  dot(a) {
    if (a instanceof Vector) {
      let n = new Matrix(1,4)
      n.m[0][0] = a.x
      n.m[0][1] = a.y
      n.m[0][2] = a.z
      n.m[0][3] = a.w
      return n.dot(this).toVector()
    } else if (a instanceof Matrix) {
      return Matrix.Map(new Matrix(this.r, a.c), (e,i,j) => {
          let s = 0
          for (let k=0; k<this.c; k++) s += this.m[i][k] * a.m[k][j]
          return s
      })
    }
  }
  static MakeProjectionMatrix(a, fov=90, near=0.1, far=1000) {
    if (a instanceof Wrapper) a = a.height / a.width
    let rad = 1 / Math.tan(fov/360*Math.PI)
    let q = far / (far - near)
    let m = new Matrix()
    m.m[0][0] = a*rad
    m.m[1][1] = rad
    m.m[2][2] = q
    m.m[3][2] = -near*q
    m.m[2][3] = 1
    return m
  }
  static MakeIdentity(s=4) {
    let m = new Matrix(s,s)
    for (let i=0; i<s; i++) m.m[i][i] = 1
    return m
  }
  static MakeRotationX(theta = 0) {
    let m = Matrix.MakeIdentity()
    if (theta == 0) return m
    m.m[1][1] = Math.cos(theta)
    m.m[1][2] = Math.sin(theta)
    m.m[2][1] = -m.m[1][2]
    m.m[2][2] = m.m[1][1]
    return m
  }
  static MakeRotationY(theta=0) {
    let m = Matrix.MakeIdentity()
    if (theta == 0) return m
    m.m[0][0] = Math.cos(theta)
    m.m[0][2] = Math.sin(theta)
    m.m[2][0] = -m.m[0][2]
    m.m[2][2] = m.m[0][0]
    return m
  }
  static MakeRotationZ(theta=0) {
    let m = Matrix.MakeIdentity()
    if (theta == 0) return m
    m.m[0][0] = Math.cos(theta)
    m.m[0][1] = Math.sin(theta)
    m.m[1][0] = -m.m[0][1]
    m.m[1][1] = m.m[0][0]
    return m
  }
  toVector() {
    return new Vector(this.m[0][0], this.m[0][1], this.m[0][2], this.m[0][3])
  }
  static FromArr(a) {
    if (a[0] instanceof Array) {
      return Matrix.Map(new Matrix(a.length, a[0].length), (e,i,j) => a[i][j])
    } else {
      return Matrix.Map(new Matrix(1, a.length), (e,i,j) => a[j])
    }
  }
  static MakePointAt(pos, target, up) {
    let forward = target.sub(pos).hat()
    up = up.hat().sub(forward.scale(up.dot(forward))).hat()
    let right = up.cross(forward)
    return Matrix.FromArr([
      [right.x, right.y, right.z, 0],
      [up.x, up.y, up.z, 0],
      [forward.x, forward.y, forward.z, 0],
      [pos.x, pos.y, pos.z, 1]
    ])
  }
  static PointAtInverse(m) {
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