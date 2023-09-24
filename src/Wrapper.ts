class Wrapper {
  canv: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  constructor(canv: HTMLCanvasElement = document.body.appendChild(document.createElement('canvas'))) {
    this.canv = canv
    this.canv.width = window.innerWidth
    this.canv.height = window.innerHeight
    this.ctx = this.canv.getContext('2d') as CanvasRenderingContext2D
  }

  get width(): number {return this.canv.width}
  get height(): number {return this.canv.height}
  set width(w: number) {this.canv.width = w}
  set height(h: number) {this.canv.height = h}

  get fillStyle(): string {return this.ctx.fillStyle as string}
  get strokeStyle(): string {return this.ctx.strokeStyle as string}
  set fillStyle(c: string) {this.ctx.fillStyle = c}
  set strokeStyle(c: string) {this.ctx.strokeStyle = c}

  fillRect(x: number, y: number, w: number, h: number): void {
    this.ctx.fillRect(x, y, w, h)
  }
  bg(c: string = '#000'): void {
    let oc: string = this.fillStyle
    if (oc != c) this.fillStyle = c
    this.fillRect(0, 0, this.width, this.height)
    if (oc != c) this.fillStyle = oc
  }
  ellipse(x: number, y: number, w: number, h: number): void {
    this.ctx.beginPath()
    this.ctx.ellipse(x, y, w/2, h/2, 0, 0, Math.PI*2)
    this.ctx.fill()
  }
  point(x: number, y: number, r: number): void {
    this.ellipse(x, y, r*2, r*2)
  }

  trianglePath(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void {
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.lineTo(x3, y3)
    this.ctx.closePath()
  }
  fillTriangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void {
    this.trianglePath(x1, y1, x2, y2, x3, y3)
    this.ctx.fill()
  }
  strokeTriangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void {
    this.trianglePath(x1, y1, x2, y2, x3, y3)
    this.ctx.stroke()
  }
  renderTriangle(t: Triangle): void {
    this.fillStyle = t.c
    this.fillTriangle(...t.p[0].toXYArr(), ...t.p[1].toXYArr(), ...t.p[2].toXYArr())
  }
}