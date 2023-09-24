class Cube extends Mesh {
  constructor() {
    super([
      Triangle.FromPoints(0,0,0,0,1,0,1,1,0),
      Triangle.FromPoints(0,0,0,1,1,0,1,0,0),
      Triangle.FromPoints(1,0,0,1,1,0,1,1,1),
      Triangle.FromPoints(1,0,0,1,1,1,1,0,1),
      Triangle.FromPoints(1,0,1,1,1,1,0,1,1),
      Triangle.FromPoints(1,0,1,0,1,1,0,0,1),
      Triangle.FromPoints(0,0,1,0,1,1,0,1,0),
      Triangle.FromPoints(0,0,1,0,1,0,0,0,0),
      Triangle.FromPoints(0,1,0,0,1,1,1,1,1),
      Triangle.FromPoints(0,1,0,1,1,1,1,1,0),
      Triangle.FromPoints(0,0,1,0,0,0,1,0,0),
      Triangle.FromPoints(0,0,1,1,0,0,1,0,1)
    ])
  }
}

const wrapper = new Wrapper()
wrapper.strokeStyle = '#fff'
wrapper.fillStyle = '#fff'
const cube = new Cube()
const cameraPos = new Vector(0,0,0)
const cameraDir = new Vector(0,0,1)
const cameraUp = new Vector(0,1,0)
const lightDir = new Vector(0,0,-1)

const getColor = dp => {
  let s = Math.floor(Math.min(Math.max((dp+1)/2*255, 0), 255)).toString(16)
  return '#'+s+s+s
}

let keyMap = new Map()

function checkKey(k) {
  if (keyMap.has(k)) {
    return keyMap.get(k)
  } return false
}

function draw(t) {
  if (checkKey('w')) cameraPos.z += 0.05
  if (checkKey('s')) cameraPos.z -= 0.05
  if (checkKey('a')) cameraPos.x -= 0.05
  if (checkKey('d')) cameraPos.x += 0.05
  if (checkKey('r')) cameraPos.y += 0.05
  if (checkKey('f')) cameraPos.y -= 0.05

  let matCamera = Matrix.MakePointAt(cameraPos, cameraPos.add(cameraDir), cameraUp)
  let matView = Matrix.PointAtInverse(matCamera)

  wrapper.bg('#000')
  
  let rotationMatrix = new OrientationMatrix()

  let raster = []

  for (let tri of cube.tris) {
    let transformed = tri.applyMatrix(rotationMatrix).translate(new Vector(0,0,5))

    let triNormal = transformed.normal()
    let cameraRay = transformed.p[0].sub(cameraPos)

    if (triNormal.dot(cameraRay) < 0) {
      let viewed = transformed.applyMatrix(matView)
      let clipped = viewed.clipAgainstPlane(new Vector(0,0,0.1), new Vector(0,0,1))
      for (let t of clipped) {
        let projected = wrapper.projectTriangle(t)

        let dp = triNormal.dot(lightDir)
        projected.c = getColor(dp)

        raster.push(projected)
      }
    }
  }

  let rasterArr = raster.sort((a,b) => b.getMidpointZ() - a.getMidpointZ())

  for (triToRaster of rasterArr) {
    let arr = [triToRaster]
    let newTriangles = 1
    for (let p=0; p<4; p++) {
      while (newTriangles > 0) {
        let test = arr.shift()
        newTriangles--
        switch (p) {
          case 0:
            arr.push(...test.clipAgainstPlane(new Vector(0,0,0), new Vector(0,1,0)))
            break
          case 1:
            arr.push(...test.clipAgainstPlane(new Vector(0,wrapper.height,0), new Vector(0,-1,0)))
            break
          case 2:
            arr.push(...test.clipAgainstPlane(new Vector(0,0,0), new Vector(1,0,0)))
            break
          case 3:
            arr.push(...test.clipAgainstPlane(new Vector(wrapper.width,0,0), new Vector(-1,0,0)))
            break
        }
      }
      newTriangles = arr.length
    }
    for (t of arr) {
      wrapper.renderTriangle(t)
    }
  }

  window.requestAnimationFrame(draw)
}

window.addEventListener('keydown', e => {
  keyMap.set(e.key, true)
})
window.addEventListener('keyup', e => {
  keyMap.set(e.key, false)
})

let lastFrame = window.requestAnimationFrame(draw)