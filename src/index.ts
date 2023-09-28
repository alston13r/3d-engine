const scene: Scene = new Scene()
const cube: Cube = new Cube(new Vector(0, 0, 5))

let keyMap: Map<string, boolean> = new Map<string, boolean>()

function checkKey(k: string): boolean {
  if (keyMap.has(k)) {
    return keyMap.get(k) as boolean
  } return false
}

scene.addObject(cube)

scene.addLight(new Light())

function draw(t: number): void {
  scene.bg()

  if (checkKey('i')) scene.camera.pitch(-0.02)
  if (checkKey('k')) scene.camera.pitch(0.02)
  if (checkKey('j')) scene.camera.roll(-0.04)
  if (checkKey('l')) scene.camera.roll(0.04)
  if (checkKey('u')) scene.camera.yaw(0.02)
  if (checkKey('o')) scene.camera.yaw(-0.02)
  if (checkKey('w')) scene.camera.translate(scene.camera.orientation.forward.scale(0.05))
  if (checkKey('s')) scene.camera.translate(scene.camera.orientation.forward.scale(-0.05))
  if (checkKey('a')) scene.camera.translate(scene.camera.orientation.right.scale(-0.05))
  if (checkKey('d')) scene.camera.translate(scene.camera.orientation.right.scale(0.05))
  if (checkKey('q')) scene.camera.translate(scene.camera.orientation.up.scale(-0.05))
  if (checkKey('e')) scene.camera.translate(scene.camera.orientation.up.scale(0.05))

  scene.render()

  window.requestAnimationFrame(draw)
}

window.addEventListener('keydown', e => {
  keyMap.set(e.key, true)
})
window.addEventListener('keyup', e => {
  keyMap.set(e.key, false)
})

let lastFrame = window.requestAnimationFrame(draw)