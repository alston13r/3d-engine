"use strict";
const scene = new Scene();
const cube = new Cube(new Vector(0, 0, 5));
// const rectangle: RectangularPrism = new RectangularPrism(new Vector(2, 0, 5), 2, 1, 1)
// const rectangle2: RectangularPrism = new RectangularPrism(new Vector(5, 0, 5), 4, 1, 1)
const sphere = new Icosphere(new Vector(2, 0, 5), 2, 2);
let keyMap = new Map();
function checkKey(k) {
    if (keyMap.has(k)) {
        return keyMap.get(k);
    }
    return false;
}
scene.addObject(cube);
// scene.addObject(rectangle)
// scene.addObject(rectangle2)
scene.addObject(sphere);
scene.addLight(new Light());
scene.addLight(new Light(new Vector(), new Vector(0, 0, 1)));
function draw(t) {
    scene.bg();
    if (checkKey('i'))
        scene.camera.pitch(-0.02);
    if (checkKey('k'))
        scene.camera.pitch(0.02);
    if (checkKey('j'))
        scene.camera.roll(-0.04);
    if (checkKey('l'))
        scene.camera.roll(0.04);
    if (checkKey('u'))
        scene.camera.yaw(0.02);
    if (checkKey('o'))
        scene.camera.yaw(-0.02);
    if (checkKey('w'))
        scene.camera.translate(scene.camera.orientation.forward.scale(0.05));
    if (checkKey('s'))
        scene.camera.translate(scene.camera.orientation.forward.scale(-0.05));
    if (checkKey('a'))
        scene.camera.translate(scene.camera.orientation.right.scale(-0.05));
    if (checkKey('d'))
        scene.camera.translate(scene.camera.orientation.right.scale(0.05));
    if (checkKey('q'))
        scene.camera.translate(scene.camera.orientation.up.scale(-0.05));
    if (checkKey('e'))
        scene.camera.translate(scene.camera.orientation.up.scale(0.05));
    scene.render();
    window.requestAnimationFrame(draw);
}
window.addEventListener('keydown', e => {
    keyMap.set(e.key, true);
});
window.addEventListener('keyup', e => {
    keyMap.set(e.key, false);
});
let lastFrame = window.requestAnimationFrame(draw);
