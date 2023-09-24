"use strict";
class Triangle {
    constructor(p1, p2, p3, c = '#fff') {
        this.getMidpoint = () => Triangle.GetMidpoint(this);
        this.getMidpointX = () => this.getMidpoint().x;
        this.getMidpointY = () => this.getMidpoint().y;
        this.getMidpointZ = () => this.getMidpoint().z;
        this.p = [p1, p2, p3];
        this.c = c;
    }
    static Copy(t) {
        return new Triangle(t.p[0].copy(), t.p[1].copy(), t.p[2].copy(), t.c);
    }
    copy() {
        return Triangle.Copy(this);
    }
    static FromPoints(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
        return new Triangle(new Vector(x1, y1, z1), new Vector(x2, y2, z2), new Vector(x3, y3, z3));
    }
    static ApplyMatrix(t, m) {
        for (let i = 0; i < 3; i++)
            t.p[i] = Vector.Dot(t.p[i], m);
        return t;
    }
    applyMatrix(m) {
        return Triangle.ApplyMatrix(this.copy(), m);
    }
    static Translate(t, v) {
        for (let i = 0; i < 3; i++)
            t.p[i] = Vector.Add(t.p[i], v);
        return t;
    }
    translate(v) {
        return Triangle.Translate(this.copy(), v);
    }
    static Normal(t) {
        return t.p[1].sub(t.p[0]).cross(t.p[2].sub(t.p[0]));
    }
    normal() {
        return Triangle.Normal(this);
    }
    static ClipAgainstPlane(t, planeP, planeN) {
        let inside = [];
        let outside = [];
        let dist = (p) => planeN.dot(p) - planeN.dot(planeP);
        if (dist(t.p[0]) > 0)
            inside.push(t.p[0]);
        else
            outside.push(t.p[0]);
        if (dist(t.p[1]) > 0)
            inside.push(t.p[1]);
        else
            outside.push(t.p[1]);
        if (dist(t.p[2]) > 0)
            inside.push(t.p[2]);
        else
            outside.push(t.p[2]);
        let ins = inside.length;
        if (ins == 3) {
            return [t.copy()];
        }
        if (ins == 1) {
            let tc = t.copy();
            tc.p[0] = inside[0];
            tc.p[1] = Vector.IntersectPlane(planeP, planeN, inside[0], outside[0]);
            tc.p[2] = Vector.IntersectPlane(planeP, planeN, inside[0], outside[1]);
            return [tc];
        }
        if (ins == 2) {
            let t1 = t.copy();
            let t2 = t.copy();
            t1.p[0] = inside[0];
            t1.p[1] = inside[1];
            t1.p[2] = Vector.IntersectPlane(planeP, planeN, inside[0], outside[0]);
            t2.p[0] = inside[1];
            t2.p[1] = Vector.IntersectPlane(planeP, planeN, inside[1], outside[0]);
            t2.p[2] = t1.p[2].copy();
            return [t1, t2];
        }
        return [];
    }
    clipAgainstPlane(planeP, planeN) {
        return Triangle.ClipAgainstPlane(this, planeP, planeN);
    }
    static GetMidpoint(t) {
        let x = 0;
        let y = 0;
        let z = 0;
        for (let p of t.p) {
            x += p.x;
            y += p.y;
            z += p.z;
        }
        return new Vector(x / 3, y / 3, z / 3);
    }
}
Triangle.GetMidpointX = (t) => Triangle.GetMidpoint(t).x;
Triangle.GetMidpointY = (t) => Triangle.GetMidpoint(t).y;
Triangle.GetMidpointZ = (t) => Triangle.GetMidpoint(t).z;
