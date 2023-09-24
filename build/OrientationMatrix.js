"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _OrientationMatrix_instances, _OrientationMatrix_popMat;
class OrientationMatrix extends Matrix {
    constructor(forward = new Vector(0, 0, 1), up = new Vector(0, 1, 0)) {
        super();
        _OrientationMatrix_instances.add(this);
        for (let i = 0; i < 4; i++)
            this.m[i][i] = 1;
        this.forward = forward.hat();
        this.up = up.hat();
        this.right = this.up.cross(this.forward);
        __classPrivateFieldGet(this, _OrientationMatrix_instances, "m", _OrientationMatrix_popMat).call(this);
    }
    rotateAround(axis, t) {
        Vector.RotateAround(this.forward, axis, t);
        Vector.RotateAround(this.up, axis, t);
        Vector.RotateAround(this.right, axis, t);
        __classPrivateFieldGet(this, _OrientationMatrix_instances, "m", _OrientationMatrix_popMat).call(this);
    }
    roll(t) {
        this.rotateAround(this.forward, t);
    }
    pitch(t) {
        this.rotateAround(this.right, t);
    }
    yaw(t) {
        this.rotateAround(this.up, t);
    }
    rotateX(t) {
        this.rotateAround(Vector.iHat, t);
    }
    rotateY(t) {
        this.rotateAround(Vector.jHat, t);
    }
    rotateZ(t) {
        this.rotateAround(Vector.kHat, t);
    }
}
_OrientationMatrix_instances = new WeakSet(), _OrientationMatrix_popMat = function _OrientationMatrix_popMat() {
    let rotation = [
        [this.right.x, this.right.y, this.right.z, 0],
        [this.up.x, this.up.y, this.up.z, 0],
        [this.forward.x, this.forward.y, this.forward.z, 0],
        [0, 0, 0, 1]
    ];
    Matrix.Map(this, (e, i, j) => rotation[i][j]);
};
