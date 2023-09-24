"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SpatialObject_instances, _SpatialObject_popWorldMatrix;
function isPositionable(obj) {
    return 'pos' in obj;
}
function isOrientable(obj) {
    return 'orientation' in obj;
}
function isMeshable(obj) {
    return 'mesh' in obj;
}
class SpatialObject {
    constructor(pos = new Vector(), orientation = new OrientationMatrix()) {
        _SpatialObject_instances.add(this);
        this.pos = pos;
        this.orientation = orientation;
        __classPrivateFieldGet(this, _SpatialObject_instances, "m", _SpatialObject_popWorldMatrix).call(this);
    }
    lookAt(target) {
        let thisToTarget;
        if (target instanceof Vector)
            thisToTarget = target.sub(this.pos);
        else if (isPositionable(target))
            thisToTarget = target.pos.sub(this.pos);
        else
            thisToTarget = new Vector();
        this.orientation.forward = new Vector(0, 0, 1);
        this.orientation.up = new Vector(0, 1, 0);
        this.orientation.right = new Vector(1, 0, 0);
        let yawAngle = Math.atan2(thisToTarget.x, -thisToTarget.z);
        this.orientation.yaw(yawAngle);
        let pitchAngle = Math.atan2(thisToTarget.y, -Math.sqrt(thisToTarget.x ** 2 + thisToTarget.z ** 2));
        this.orientation.pitch(pitchAngle);
        let rollAngle = Math.PI;
        this.orientation.roll(rollAngle);
        __classPrivateFieldGet(this, _SpatialObject_instances, "m", _SpatialObject_popWorldMatrix).call(this);
    }
    rotateAround(axis, t) {
        this.orientation.rotateAround(axis, t);
        __classPrivateFieldGet(this, _SpatialObject_instances, "m", _SpatialObject_popWorldMatrix).call(this);
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
    roll(t) {
        this.orientation.roll(t);
        __classPrivateFieldGet(this, _SpatialObject_instances, "m", _SpatialObject_popWorldMatrix).call(this);
    }
    pitch(t) {
        this.orientation.pitch(t);
        __classPrivateFieldGet(this, _SpatialObject_instances, "m", _SpatialObject_popWorldMatrix).call(this);
    }
    yaw(t) {
        this.orientation.yaw(t);
        __classPrivateFieldGet(this, _SpatialObject_instances, "m", _SpatialObject_popWorldMatrix).call(this);
    }
    translate(v) {
        Vector.Add(this.pos, v);
        __classPrivateFieldGet(this, _SpatialObject_instances, "m", _SpatialObject_popWorldMatrix).call(this);
    }
}
_SpatialObject_instances = new WeakSet(), _SpatialObject_popWorldMatrix = function _SpatialObject_popWorldMatrix() {
    this.worldMatrix = this.orientation.copy();
    this.worldMatrix.m[3][0] = this.pos.x;
    this.worldMatrix.m[3][1] = this.pos.y;
    this.worldMatrix.m[3][2] = this.pos.z;
};
class SpatialMeshable extends SpatialObject {
    constructor(pos = new Vector(), orientation = new OrientationMatrix(), mesh) {
        super(pos, orientation);
        this.mesh = mesh;
    }
}
class RectangularPrism extends SpatialMeshable {
    constructor(pos = new Vector(), xLength = 1, yLength = 1, zLength = 1, orientation = new OrientationMatrix()) {
        let a = new Vector(0, 0, 0);
        let b = new Vector(0, yLength, 0);
        let c = new Vector(xLength, yLength, 0);
        let d = new Vector(xLength, 0, 0);
        let e = new Vector(xLength, 0, zLength);
        let f = new Vector(xLength, yLength, zLength);
        let g = new Vector(0, yLength, zLength);
        let h = new Vector(0, 0, zLength);
        super(pos, orientation, new Mesh([
            new Triangle(a.copy(), b.copy(), c.copy()),
            new Triangle(a.copy(), c.copy(), d.copy()),
            new Triangle(d.copy(), c.copy(), f.copy()),
            new Triangle(d.copy(), f.copy(), e.copy()),
            new Triangle(e.copy(), f.copy(), g.copy()),
            new Triangle(e.copy(), g.copy(), h.copy()),
            new Triangle(h.copy(), g.copy(), b.copy()),
            new Triangle(h.copy(), b.copy(), a.copy()),
            new Triangle(b.copy(), g.copy(), f.copy()),
            new Triangle(b.copy(), f.copy(), c.copy()),
            new Triangle(h.copy(), a.copy(), d.copy()),
            new Triangle(h.copy(), d.copy(), e.copy())
        ]));
    }
}
class Cube extends SpatialMeshable {
    constructor(pos = new Vector(), orientation = new OrientationMatrix()) {
        super(pos, orientation, new RectangularPrism(pos, 1, 1, 1, orientation).mesh);
    }
}
class UVSphere extends SpatialMeshable {
    constructor(pos = new Vector(), radius = 1, horizontalDivisions = 4, verticalDivisions = 4, orientation = new OrientationMatrix()) {
        horizontalDivisions = horizontalDivisions > 4 ? horizontalDivisions : 4;
        verticalDivisions = verticalDivisions > 4 ? verticalDivisions : 4;
        let tris = [];
        let vertecies = [];
        for (let i = 0; i <= verticalDivisions; i++) {
            vertecies[i] = [];
            let tau = 2 * Math.PI * i / verticalDivisions;
            for (let j = 0; j <= horizontalDivisions; j++) {
                let theta = Math.PI * j / horizontalDivisions;
                let vec = new Vector(Math.sin(theta), Math.cos(theta), 0);
                vertecies[i].push(vec.rotateAround(Vector.jHat, tau));
            }
        }
        for (let slice of vertecies) {
            for (let v of slice) {
                Vector.Scale(Vector.Hat(v), radius);
            }
        }
        for (let i = 0; i < vertecies.length - 1; i++) {
            let currSector = vertecies[i];
            let nextSector = vertecies[i + 1];
            tris.push(new Triangle(currSector[0], nextSector[1], currSector[1]));
            for (let j = 1; j < currSector.length - 1; j++) {
                tris.push(new Triangle(currSector[j], nextSector[j], currSector[j + 1]));
                if (j != currSector.length - 2)
                    tris.push(new Triangle(currSector[j + 1], nextSector[j], nextSector[j + 1]));
            }
        }
        super(pos, orientation, new Mesh(tris.map((t) => t.copy())));
    }
}
class Icosphere extends SpatialMeshable {
    constructor(pos = new Vector(), subdivisions = 0, radius = 1, orientation = new OrientationMatrix()) {
        let t = (1 + Math.sqrt(5)) / 2;
        let vertecies = [
            new Vector(-1, t, 0),
            new Vector(1, t, 0),
            new Vector(-1, -t, 0),
            new Vector(1, -t, 0),
            new Vector(0, -1, t),
            new Vector(0, 1, t),
            new Vector(0, -1, -t),
            new Vector(0, 1, -t),
            new Vector(t, 0, -1),
            new Vector(t, 0, 1),
            new Vector(-t, 0, -1),
            new Vector(-t, 0, 1)
        ].map((v) => Vector.Hat(v));
        let tris = [
            Triangle.FromArr(0, 11, 5, vertecies),
            Triangle.FromArr(0, 5, 1, vertecies),
            Triangle.FromArr(0, 1, 7, vertecies),
            Triangle.FromArr(0, 7, 10, vertecies),
            Triangle.FromArr(0, 10, 11, vertecies),
            Triangle.FromArr(1, 5, 9, vertecies),
            Triangle.FromArr(5, 11, 4, vertecies),
            Triangle.FromArr(11, 10, 2, vertecies),
            Triangle.FromArr(10, 7, 6, vertecies),
            Triangle.FromArr(7, 1, 8, vertecies),
            Triangle.FromArr(3, 9, 4, vertecies),
            Triangle.FromArr(3, 4, 2, vertecies),
            Triangle.FromArr(3, 2, 6, vertecies),
            Triangle.FromArr(3, 6, 8, vertecies),
            Triangle.FromArr(3, 8, 9, vertecies),
            Triangle.FromArr(4, 9, 5, vertecies),
            Triangle.FromArr(2, 4, 11, vertecies),
            Triangle.FromArr(6, 2, 10, vertecies),
            Triangle.FromArr(8, 6, 7, vertecies),
            Triangle.FromArr(9, 8, 1, vertecies)
        ];
        for (let i = 0; i < subdivisions; i++) {
            let tris2 = [];
            for (let tri of tris) {
                let a = tri.p1.getMidpoint(tri.p2).hat();
                let b = tri.p2.getMidpoint(tri.p3).hat();
                let c = tri.p3.getMidpoint(tri.p1).hat();
                tris2.push(new Triangle(tri.p1, a, c).copy());
                tris2.push(new Triangle(tri.p2, b, a).copy());
                tris2.push(new Triangle(tri.p3, c, b).copy());
                tris2.push(new Triangle(a, b, c).copy());
            }
            tris = tris2;
        }
        if (radius != 1) {
            for (let tri of tris) {
                tri.p1 = Vector.Scale(Vector.Hat(tri.p1), radius);
                tri.p2 = Vector.Scale(Vector.Hat(tri.p2), radius);
                tri.p3 = Vector.Scale(Vector.Hat(tri.p3), radius);
            }
        }
        super(pos, orientation, new Mesh(tris.map((t) => t.copy())));
    }
}
