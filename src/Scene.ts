class Scene {
  wrapper: Wrapper
  fov: number
  near: number
  far: number
  matProj: Matrix
  objects: SpatialMeshable[]
  camera: Camera
  lights: Light[]

  constructor(fov: number = 90, near: number = 0.1, far: number = 1000, wrapper: Wrapper = new Wrapper()) {
    this.wrapper = wrapper
    this.fov = fov
    this.near = near
    this.far = far
    this.matProj = Matrix.MakeProjectionMatrix(wrapper, fov, near, far)
    this.objects = []
    this.camera = new Camera()
    this.lights = []
  }

  get width(): number {return this.wrapper.width}
  get height(): number {return this.wrapper.height}
  set width(w: number) {this.wrapper.width = w}
  set height(h: number) {this.wrapper.height = h}

  projectVector(v: Vector): Vector {
    let projected: Vector = this.matProj.dot(v)
    if (projected.w != 0) Vector.Div(projected, projected.w)
    projected.x = (-projected.x + 1)/2 * this.width
    projected.y = (-projected.y + 1)/2 * this.height
    return projected
  }

  projectTriangle(t: Triangle): Triangle {
    let c: Triangle = t.copy()
    for (let i=0; i<3; i++) c.p[i] = this.projectVector(c.p[i])
    return c
  }

  renderTriangle(t: Triangle): void {
    this.wrapper.renderTriangle(t)
  }

  clipTriangleToNearAndFar(t: Triangle): Triangle[] {
    let clippedToNear: Triangle[] = t.clipAgainstPlane(new Vector(0,0,this.near), new Vector(0,0,1))
    let clippedToFar: Triangle[] = []
    for (let ctn of clippedToNear) clippedToFar.push(...ctn.clipAgainstPlane(new Vector(0,0,this.far), new Vector(0,0,-1)))
    return clippedToFar
  }

  clipTriangleToScreen(t: Triangle): Triangle[] {
    let arr: Triangle[] = [t]
    let newTriangles: number = 1
    for (let p=0; p<4; p++) {
      while (newTriangles > 0) {
        let test: Triangle = arr.shift() as Triangle
        newTriangles--
        switch (p) {
          case 0:
            arr.push(...test.clipAgainstPlane(new Vector(0,0,0), new Vector(0,1,0)))
            break
          case 1:
            arr.push(...test.clipAgainstPlane(new Vector(0,scene.height,0), new Vector(0,-1,0)))
            break
          case 2:
            arr.push(...test.clipAgainstPlane(new Vector(0,0,0), new Vector(1,0,0)))
            break
          case 3:
            arr.push(...test.clipAgainstPlane(new Vector(scene.width,0,0), new Vector(-1,0,0)))
            break
        }
      }
      newTriangles = arr.length
    }
    return arr
  }

  bg(c: string = '#000') {
    this.wrapper.bg(c)
  }
  
  setCamera(c: Camera): void {
    this.camera = c
  }

  addObject(obj: SpatialMeshable): void {
    this.objects.push(obj)
  }

  addLight(light: Light): void {
    this.lights.push(light)
  }

  addLightingToTriangle(t: Triangle, n: Vector): void {
    let l: number = 0
    for (let light of this.lights) {
      l += Math.floor(Math.min(Math.max((n.dot(light.dir)+1)/2*255, 0), 255))
    }
    let s: string = Math.min(Math.max(l, 0), 255).toString(16)
    t.c = '#'+s+s+s
  }

  render(): void {
    this.bg()
    let matView: Matrix = this.camera.makeMatView()
    let raster: Triangle[] = []

    for (let obj of this.objects) {
      for (let tri of obj.mesh.tris) {
        let transformed: Triangle = tri.applyMatrix(obj.worldMatrix)

        let normal: Vector = transformed.normal()
        let cameraRay: Vector = transformed.p[0].sub(this.camera.pos)
        if (normal.dot(cameraRay) < 0) {
          let viewed: Triangle = transformed.applyMatrix(matView)
          let clippedToNearAndFar: Triangle[] = this.clipTriangleToNearAndFar(viewed)

          for (let ctnaf of clippedToNearAndFar) {
            let projected: Triangle = scene.projectTriangle(ctnaf)
            this.addLightingToTriangle(projected, normal)

            raster.push(projected)
          }
        }
      }
    }

    let rastered: Triangle[] = raster.sort((a,b) => b.getMidpointZ() - a.getMidpointZ())

    for (let t of rastered) {
      let clippedToScreen: Triangle[] = this.clipTriangleToScreen(t)
      for (let cts of clippedToScreen) {
        this.renderTriangle(cts)
      }
    }
  }
}







/*
function draw(t: number): void {
  scene.bg()

  // if (checkKey('w')) cube.orientation.pitch(-0.01)
  // if (checkKey('s')) cube.orientation.pitch(0.01)
  // if (checkKey('a')) cube.orientation.roll(-0.01)
  // if (checkKey('d')) cube.orientation.roll(0.01)
  // if (checkKey('q')) cube.orientation.yaw(0.01)
  // if (checkKey('e')) cube.orientation.yaw(-0.01)
  if (checkKey('w')) scene.camera.pitch(-0.01)
  if (checkKey('s')) scene.camera.pitch(0.01)
  if (checkKey('a')) scene.camera.roll(-0.01)
  if (checkKey('d')) scene.camera.roll(0.01)
  if (checkKey('q')) scene.camera.yaw(0.01)
  if (checkKey('e')) scene.camera.yaw(-0.01)
  if (checkKey('t')) scene.camera.translate(scene.camera.orientation.forward.scale(0.01))
  if (checkKey('g')) scene.camera.translate(scene.camera.orientation.forward.scale(-0.01))

  let matView: Matrix = scene.camera.makeMatView()

  let raster: Triangle[] = []

  for (let tri of cube.mesh.tris) {
    let transformed: Triangle = tri.applyMatrix(cube.orientation).translate(new Vector(0, 0, 5))

    let triNormal: Vector = transformed.normal()
    let cameraRay: Vector = transformed.p[0].sub(scene.camera.pos)

    if (triNormal.dot(cameraRay) < 0) {
      let viewed: Triangle = transformed.applyMatrix(matView)
      let clipped: Triangle[] = viewed.clipAgainstPlane(new Vector(0,0,0.1), new Vector(0,0,1))
      for (let t of clipped) {
        let projected: Triangle = scene.projectTriangle(t)

        let dp: number = triNormal.dot(lightDir)
        projected.c = getColor(dp)

        raster.push(projected)
      }
    }
  }

  let rasterArr: Triangle[] = raster.sort((a,b) => b.getMidpointZ() - a.getMidpointZ())

  for (let triToRaster of rasterArr) {
    let arr: Triangle[] = [triToRaster]
    let newTriangles: number = 1
    for (let p=0; p<4; p++) {
      while (newTriangles > 0) {
        let test: Triangle = arr.shift() as Triangle
        newTriangles--
        switch (p) {
          case 0:
            arr.push(...test.clipAgainstPlane(new Vector(0,0,0), new Vector(0,1,0)))
            break
          case 1:
            arr.push(...test.clipAgainstPlane(new Vector(0,scene.height,0), new Vector(0,-1,0)))
            break
          case 2:
            arr.push(...test.clipAgainstPlane(new Vector(0,0,0), new Vector(1,0,0)))
            break
          case 3:
            arr.push(...test.clipAgainstPlane(new Vector(scene.width,0,0), new Vector(-1,0,0)))
            break
        }
      }
      newTriangles = arr.length
    }
    for (let t of arr) {
      scene.renderTriangle(t)
    }
  }

  window.requestAnimationFrame(draw)
}

*/