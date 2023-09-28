"use strict";
class Scene {
    constructor(fov = 90, near = 0.1, far = 1000, wrapper = new Wrapper()) {
        this.wrapper = wrapper;
        this.fov = fov;
        this.near = near;
        this.far = far;
        this.matProj = Matrix.MakeProjectionMatrix(wrapper, fov, near, far);
        this.objects = [];
        this.camera = new Camera();
        this.lights = [];
    }
    get width() { return this.wrapper.width; }
    get height() { return this.wrapper.height; }
    set width(w) { this.wrapper.width = w; }
    set height(h) { this.wrapper.height = h; }
    projectVector(v) {
        let projected = this.matProj.dot(v);
        if (projected.w != 0)
            Vector.Div(projected, projected.w);
        projected.x = (-projected.x + 1) / 2 * this.width;
        projected.y = (-projected.y + 1) / 2 * this.height;
        return projected;
    }
    projectTriangle(t) {
        let c = t.copy();
        for (let i = 0; i < 3; i++)
            c.p[i] = this.projectVector(c.p[i]);
        return c;
    }
    renderTriangle(t) {
        this.wrapper.renderTriangle(t);
    }
    clipTriangleToNearAndFar(t) {
        let clippedToNear = t.clipAgainstPlane(new Vector(0, 0, this.near), new Vector(0, 0, 1));
        let clippedToFar = [];
        for (let ctn of clippedToNear)
            clippedToFar.push(...ctn.clipAgainstPlane(new Vector(0, 0, this.far), new Vector(0, 0, -1)));
        return clippedToFar;
    }
    clipTriangleToScreen(t) {
        let arr = [t];
        let newTriangles = 1;
        for (let p = 0; p < 4; p++) {
            while (newTriangles > 0) {
                let test = arr.shift();
                newTriangles--;
                switch (p) {
                    case 0:
                        arr.push(...test.clipAgainstPlane(new Vector(0, 0, 0), new Vector(0, 1, 0)));
                        break;
                    case 1:
                        arr.push(...test.clipAgainstPlane(new Vector(0, scene.height, 0), new Vector(0, -1, 0)));
                        break;
                    case 2:
                        arr.push(...test.clipAgainstPlane(new Vector(0, 0, 0), new Vector(1, 0, 0)));
                        break;
                    case 3:
                        arr.push(...test.clipAgainstPlane(new Vector(scene.width, 0, 0), new Vector(-1, 0, 0)));
                        break;
                }
            }
            newTriangles = arr.length;
        }
        return arr;
    }
    bg(c = '#000') {
        this.wrapper.bg(c);
    }
    setCamera(c) {
        this.camera = c;
    }
    addObject(obj) {
        this.objects.push(obj);
    }
    addLight(light) {
        this.lights.push(light);
    }
    addLightingToTriangle(t, n) {
        let l = 0;
        for (let light of this.lights) {
            l += Math.floor(Math.min(Math.max((n.dot(light.dir) + 1) / 2 * 255, 0), 255));
        }
        let s = Math.min(Math.max(l, 0), 255).toString(16);
        t.c = '#' + s + s + s;
    }
    render() {
        this.bg();
        let matView = this.camera.makeMatView();
        let raster = [];
        for (let obj of this.objects) {
            for (let tri of obj.mesh.tris) {
                let transformed = tri.applyMatrix(obj.worldMatrix);
                let normal = transformed.normal();
                let cameraRay = transformed.p[0].sub(this.camera.pos);
                if (normal.dot(cameraRay) < 0) {
                    let viewed = transformed.applyMatrix(matView);
                    let clippedToNearAndFar = this.clipTriangleToNearAndFar(viewed);
                    for (let ctnaf of clippedToNearAndFar) {
                        let projected = scene.projectTriangle(ctnaf);
                        this.addLightingToTriangle(projected, normal);
                        raster.push(projected);
                    }
                }
            }
        }
        let rastered = raster.sort((a, b) => b.getMidpointZ() - a.getMidpointZ());
        for (let t of rastered) {
            let clippedToScreen = this.clipTriangleToScreen(t);
            for (let cts of clippedToScreen) {
                this.renderTriangle(cts);
            }
        }
    }
}
