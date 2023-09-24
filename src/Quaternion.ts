class Quaternion {
  real: number
  imaginary: Vector

  constructor(real: number = 0, imaginary: Vector = new Vector()) {
    this.real = real
    this.imaginary = imaginary
  }

  static Copy(q: Quaternion): Quaternion {
    return new Quaternion(q.real, q.imaginary.copy())
  }

  copy(): Quaternion {
    return Quaternion.Copy(this)
  }

  static Add(q1: Quaternion, q2: Quaternion): Quaternion {
    q1.real += q2.real
    Vector.Add(q1.imaginary, q2.imaginary)
    return q1
  }

  add(q: Quaternion): Quaternion {
    return Quaternion.Add(this.copy(), q)
  }

  static Scale(q: Quaternion, n: number): Quaternion {
    q.real *= n
    Vector.Scale(q.imaginary, n)
    return q
  }

  scale(n: number): Quaternion {
    return Quaternion.Scale(this.copy(), n)
  }

  static Sub(q1: Quaternion, q2: Quaternion): Quaternion {
    q1.real -= q2.real
    Vector.Sub(q1.imaginary, q2.imaginary)
    return q1
  }

  sub(q: Quaternion): Quaternion {
    return Quaternion.Sub(this.copy(), q)
  }

  static Div(q: Quaternion, n: number): Quaternion {
    q.real /= n
    Vector.Div(q.imaginary, n)
    return q
  }

  div(n: number): Quaternion {
    return Quaternion.Div(this.copy(), n)
  }

  static CopyFrom(q1: Quaternion, q2: Quaternion): Quaternion {
    q1.real = q2.real
    Vector.CopyFrom(q1.imaginary, q2.imaginary)
    return q1
  }

  static Dot(q1: Quaternion, q2: Quaternion): number {
    return q1.imaginary.dot(q2.imaginary)
  }

  dot(q: Quaternion): number {
    return Quaternion.Dot(this, q)
  }

  static Cross(q1: Quaternion, q2: Quaternion): Quaternion {
    return new Quaternion(0, q1.imaginary.cross(q2.imaginary))
  }

  cross(q: Quaternion): Quaternion {
    return Quaternion.Cross(this, q)
  }

  static Mul(q1: Quaternion, q2: Quaternion): Quaternion {
    let real = q1.real*q2.real
    let imaginary0 = q2.scale(q1.real).imaginary
    let imaginary1 = q1.scale(q2.real).imaginary
    let imaginary2 = q1.cross(q2).imaginary
    let imaginary = imaginary0.add(imaginary1).add(imaginary2)
    return new Quaternion(real-q1.dot(q2), imaginary)
  }

  mul(q: Quaternion): Quaternion {
    return Quaternion.Mul(this, q)
  }

  static Conjugate(q: Quaternion): Quaternion {
    Vector.Scale(q.imaginary, -1)
    return q
  }

  conjugate(): Quaternion {
    return Quaternion.Conjugate(this.copy())
  }

  static Mag(q: Quaternion): number {
    return Math.sqrt(q.real**2 + q.imaginary.mag()**2)
  }

  mag(): number {
    return Quaternion.Mag(this)
  }

  static Hat(q: Quaternion): Quaternion {
    let mag = q.mag()
    if (mag != 0) Quaternion.Div(q, mag)
    return q
  }

  hat(): Quaternion {
    return Quaternion.Hat(this.copy())
  }

  static Inverse(q: Quaternion): Quaternion {
    let den = q.mag()**2
    return Quaternion.Div(Quaternion.Conjugate(q), den)
  }

  inverse(): Quaternion {
    return Quaternion.Inverse(this.copy())
  }

  static AngleBetween(q1: Quaternion, q2: Quaternion): number {
    return Math.acos(q1.real*q2.real+q1.dot(q2)/q1.mag()/q2.mag())
  }

  angleTo(q: Quaternion): number {
    return Quaternion.AngleBetween(this, q)
  }
}