"use strict";
class Vector {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    static Copy(v) {
        return new Vector(v.x, v.y, v.z, v.w);
    }
    copy() {
        return Vector.Copy(this);
    }
    static Add(a, b) {
        if (b instanceof Vector) {
            a.x += b.x;
            a.y += b.y;
            a.z += b.z;
        }
        else {
            a.x += b;
            a.y += b;
            a.z += b;
        }
        return a;
    }
    add(a) {
        return Vector.Add(this.copy(), a);
    }
    static Sub(a, b) {
        if (b instanceof Vector) {
            a.x -= b.x;
            a.y -= b.y;
            a.z -= b.z;
        }
        else {
            a.x -= b;
            a.y -= b;
            a.z -= b;
        }
        return a;
    }
    sub(a) {
        return Vector.Sub(this.copy(), a);
    }
    static Scale(a, b) {
        a.x *= b;
        a.y *= b;
        a.z *= b;
        return a;
    }
    scale(a) {
        return Vector.Scale(this.copy(), a);
    }
    static Dot(a, b) {
        if (a instanceof Vector) {
            if (b instanceof Vector) {
                return a.x * b.x + a.y * b.y + a.z * b.z;
            }
            else {
                return Matrix.Dot(a, b);
            }
        }
        else {
            if (b instanceof Vector) {
                return Matrix.Dot(b, a);
            }
            else {
                return Matrix.Dot(a, b);
            }
        }
    }
    dot(a) {
        if (a instanceof Vector)
            return Vector.Dot(this, a);
        else
            return Matrix.Dot(this, a);
    }
    static Div(a, b) {
        a.x /= b;
        a.y /= b;
        a.z /= b;
        return a;
    }
    div(a) {
        return Vector.Div(this.copy(), a);
    }
    static Mag(a) {
        return Math.sqrt(a.x ** 2 + a.y ** 2 + a.z ** 2);
    }
    mag() {
        return Vector.Mag(this);
    }
    static Hat(a) {
        let mag = a.mag();
        if (mag != 0) {
            return Vector.Div(a, a.mag());
        }
        return a;
    }
    hat() {
        return Vector.Hat(this.copy());
    }
    static AngleBetween(a, b) {
        return Math.acos(a.dot(b) / a.mag() / b.mag());
    }
    angleTo(a) {
        return Vector.AngleBetween(this, a);
    }
    static CopyFrom(a, b) {
        a.x = b.x;
        a.y = b.y;
        a.z = b.z;
        a.w = b.w;
        return a;
    }
    static ProjectOnto(a, b) {
        return Vector.CopyFrom(a, b.scale(a.dot(b) / b.dot(b)));
    }
    projectOnto(a) {
        return Vector.ProjectOnto(this.copy(), a);
    }
    static Cross(a, b) {
        return new Vector(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
    }
    cross(a) {
        return Vector.Cross(this, a);
    }
    static RotateAround(a, b, t) {
        let cos = Math.cos(-t / 2);
        let sin = Math.sin(-t / 2);
        let q = new Quaternion(cos, b.hat().scale(sin));
        let qi = q.inverse();
        if (a instanceof Array) {
            let r = [];
            for (let c of a) {
                let p = new Quaternion(0, c);
                let pRot = q.mul(p).mul(qi);
                r.push(Vector.CopyFrom(c, pRot.imaginary));
            }
            return r;
        }
        else {
            let p = new Quaternion(0, a);
            let pRot = q.mul(p).mul(qi);
            return Vector.CopyFrom(a, pRot.imaginary);
        }
    }
    rotateAround(a, t) {
        return Vector.RotateAround(this.copy(), a, t);
    }
    toXYArr() {
        return [this.x, this.y];
    }
    toXYZArr() {
        return [this.x, this.y, this.z];
    }
    toXYZWArr() {
        return [this.x, this.y, this.z, this.w];
    }
    static IntersectPlane(planeP, planeN, start, end) {
        Vector.Hat(planeN);
        let d = -planeN.dot(planeP);
        let ad = start.dot(planeN);
        let bd = end.dot(planeN);
        let t = (-d - ad) / (bd - ad);
        let lineSE = end.sub(start);
        let lineSI = lineSE.scale(t);
        return start.add(lineSI);
    }
    static GetMidpoint(a, b) {
        return a.add(b).div(2);
    }
    getMidpoint(v) {
        return Vector.GetMidpoint(this, v);
    }
}
Vector.iHat = new Vector(1);
Vector.jHat = new Vector(0, 1);
Vector.kHat = new Vector(0, 0, 1);
