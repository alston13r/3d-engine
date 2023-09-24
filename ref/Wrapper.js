class Wrapper {
  constructor(canv=document.body.appendChild(document.createElement('canvas'))) {
    this.canv = canv
    this.canv.width = window.innerWidth
    this.canv.height = window.innerHeight
    this.ctx = canv.getContext('2d')
    this.matProj = Matrix.MakeProjectionMatrix(this)
  }
  get width() {return this.canv.width}
  get height() {return this.canv.height}
  get fillStyle() {return this.ctx.fillStyle}
  get strokeStyle() {return this.ctx.strokeStyle}
  set fillStyle(c) {this.ctx.fillStyle = c}
  set strokeStyle(c) {this.ctx.strokeStyle = c}
  fillRect(x,y,w,h) {this.ctx.fillRect(x,y,w,h)}
  bg(c) {
    let oc = this.fillStyle
    this.fillStyle = c
    this.fillRect(0,0,this.width,this.height)
    this.fillStyle = oc
  }
  ellipse(x,y,w,h) {
    this.ctx.beginPath()
    this.ctx.ellipse(x,y,w/2,h/2,0,0,Math.PI*2)
    this.ctx.fill()
  }
  point(x,y) {
    this.ellipse(x,y,10,10)
  }
  trianglePath(x1,y1,x2,y2,x3,y3) {
    this.ctx.beginPath()
    this.ctx.moveTo(x1,y1)
    this.ctx.lineTo(x2,y2)
    this.ctx.lineTo(x3,y3)
    this.ctx.closePath()
  }
  fillTriangle(x1,y1,x2,y2,x3,y3) {
    this.trianglePath(x1,y1,x2,y2,x3,y3)
    this.ctx.fill()
  }
  strokeTriangle(x1,y1,x2,y2,x3,y3) {
    this.trianglePath(x1,y1,x2,y2,x3,y3)
    this.ctx.stroke()
  }
  projectVector(v) {
    let projectedVector = this.matProj.dot(v)
    if (projectedVector.w != 0) {
      projectedVector.x /= projectedVector.w
      projectedVector.y /= projectedVector.w
      projectedVector.z /= projectedVector.w
    }
    projectedVector.x = (projectedVector.x + 1)/2*this.width
    projectedVector.y = (-projectedVector.y + 1)/2*this.height
    return projectedVector
  }
  projectTriangle(t) {
    let c = t.copy()
    for (let i=0; i<3; i++) c.p[i] = this.projectVector(c.p[i])
    return c
  }
  renderTriangle(t) {
    this.fillStyle = t.c
    this.fillTriangle(...t.p[0].toXYArr(), ...t.p[1].toXYArr(), ...t.p[2].toXYArr())
  }
}