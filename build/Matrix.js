"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _Matrix_MakeRotation;
var RotationAxis;
(function (RotationAxis) {
    RotationAxis[RotationAxis["x"] = 0] = "x";
    RotationAxis[RotationAxis["y"] = 1] = "y";
    RotationAxis[RotationAxis["z"] = 2] = "z";
})(RotationAxis || (RotationAxis = {}));
class Matrix {
    constructor(r = 4, c = 4) {
        this.r = r;
        this.c = c;
        this.m = new Array(r).fill(0).map(() => new Array(c).fill(0));
    }
    static Map(m, fn) {
        for (let i = 0; i < m.r; i++) {
            for (let j = 0; j < m.c; j++) {
                m.m[i][j] = fn(m.m[i][j], i, j, m);
            }
        }
        return m;
    }
    static Copy(m) {
        return _a.Map(new _a(m.r, m.c), (e, i, j) => m.m[i][j]);
    }
    copy() {
        return _a.Copy(this);
    }
    map(fn) {
        return _a.Map(this.copy(), fn);
    }
    static Dot(a, b) {
        if (a instanceof Vector) {
            if (b instanceof Vector) {
                return a.x * b.x + a.y * b.y + a.z * b.z;
            }
            else {
                return a.toMatrix().dot(b).toVector();
            }
        }
        else {
            if (b instanceof Vector) {
                return b.toMatrix().dot(a).toVector();
            }
            else {
                return _a.Map(new _a(a.r, b.c), (e, i, j) => {
                    let s = 0;
                    for (let k = 0; k < a.c; k++)
                        s += a.m[i][k] * b.m[k][j];
                    return s;
                });
            }
        }
    }
    dot(a) {
        if (a instanceof Vector)
            return _a.Dot(a, this).toVector();
        return _a.Dot(this, a);
    }
    static ToVector(m) {
        return new Vector(m.m[0][0], m.m[0][1], m.m[0][2], m.m[0][3]);
    }
    toVector() {
        return _a.ToVector(this);
    }
    static FromArr(arr) {
        if (arr[0] instanceof Array) {
            return _a.Map(new _a(arr.length, arr[0].length), (e, i, j) => arr[i][j]);
        }
        else {
            return _a.Map(new _a(1, arr.length), (e, i, j) => arr[j]);
        }
    }
    static MakeIdentity(s = 4) {
        if (s instanceof _a) {
            for (let i = 0; i < s.r; i++)
                s.m[i][i] = 1;
            return s;
        }
        let m = new _a(s, s);
        for (let i = 0; i < s; i++)
            m.m[i][i] = 1;
        return m;
    }
    static MakeProjectionMatrix(a, fov = 90, near = 0.1, far = 1000) {
        let m = new _a();
        let asp = a.height / a.width;
        let rad = 1 / Math.tan(fov / 360 * Math.PI);
        let q = far / (far - near);
        m.m[0][0] = asp * rad;
        m.m[1][1] = rad;
        m.m[2][2] = q;
        m.m[3][2] = -near * q;
        m.m[2][3] = 1;
        return m;
    }
    static MakeRotationX(theta = 0) {
        return __classPrivateFieldGet(_a, _a, "m", _Matrix_MakeRotation).call(_a, 'x', theta);
    }
    static MakeRotationY(theta = 0) {
        return __classPrivateFieldGet(_a, _a, "m", _Matrix_MakeRotation).call(_a, 'y', theta);
    }
    static MakeRotationZ(theta = 0) {
        return __classPrivateFieldGet(_a, _a, "m", _Matrix_MakeRotation).call(_a, 'z', theta);
    }
    static MakePointAt(pos, target, up) {
        let forward = target.sub(pos).hat();
        up = up.hat().sub(forward.scale(up.dot(forward))).hat();
        let right = forward.cross(up);
        return _a.FromArr([
            [right.x, right.y, right.z, 0],
            [up.x, up.y, up.z, 0],
            [forward.x, forward.y, forward.z, 0],
            [pos.x, pos.y, pos.z, 1]
        ]);
    }
    static PointAtInverse(m) {
        let n = _a.MakeIdentity();
        n.m[0][0] = m.m[0][0];
        n.m[0][1] = m.m[1][0];
        n.m[0][2] = m.m[2][0];
        n.m[1][0] = m.m[0][1];
        n.m[1][1] = m.m[1][1];
        n.m[1][2] = m.m[2][1];
        n.m[2][0] = m.m[0][2];
        n.m[2][1] = m.m[1][2];
        n.m[2][2] = m.m[2][2];
        n.m[3][0] = -(m.m[3][0] * n.m[0][0] + m.m[3][1] * n.m[1][0] + m.m[3][2] * n.m[2][0]);
        n.m[3][1] = -(m.m[3][0] * n.m[0][1] + m.m[3][1] * n.m[1][1] + m.m[3][2] * n.m[2][1]);
        n.m[3][2] = -(m.m[3][0] * n.m[0][2] + m.m[3][1] * n.m[1][2] + m.m[3][2] * n.m[2][2]);
        return n;
    }
}
_a = Matrix, _Matrix_MakeRotation = function _Matrix_MakeRotation(axis, theta = 0) {
    let m = _a.MakeIdentity();
    if (theta != 0) {
        let cos = Math.cos(theta);
        let sin = Math.sin(theta);
        let a = axis == 'x' ? 1 : 0;
        let b = axis == 'z' ? 1 : 2;
        m.m[a][a] = cos;
        m.m[a][b] = sin;
        m.m[b][a] = -sin;
        m.m[b][b] = cos;
    }
    return m;
};
