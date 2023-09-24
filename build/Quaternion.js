"use strict";
class Quaternion {
    constructor(real = 0, imaginary = new Vector()) {
        this.real = real;
        this.imaginary = imaginary;
    }
    static Copy(q) {
        return new Quaternion(q.real, q.imaginary.copy());
    }
    copy() {
        return Quaternion.Copy(this);
    }
    static Add(q1, q2) {
        q1.real += q2.real;
        Vector.Add(q1.imaginary, q2.imaginary);
        return q1;
    }
    add(q) {
        return Quaternion.Add(this.copy(), q);
    }
    static Scale(q, n) {
        q.real *= n;
        Vector.Scale(q.imaginary, n);
        return q;
    }
    scale(n) {
        return Quaternion.Scale(this.copy(), n);
    }
    static Sub(q1, q2) {
        q1.real -= q2.real;
        Vector.Sub(q1.imaginary, q2.imaginary);
        return q1;
    }
    sub(q) {
        return Quaternion.Sub(this.copy(), q);
    }
    static Div(q, n) {
        q.real /= n;
        Vector.Div(q.imaginary, n);
        return q;
    }
    div(n) {
        return Quaternion.Div(this.copy(), n);
    }
    static CopyFrom(q1, q2) {
        q1.real = q2.real;
        Vector.CopyFrom(q1.imaginary, q2.imaginary);
        return q1;
    }
    static Dot(q1, q2) {
        return q1.imaginary.dot(q2.imaginary);
    }
    dot(q) {
        return Quaternion.Dot(this, q);
    }
    static Cross(q1, q2) {
        return new Quaternion(0, q1.imaginary.cross(q2.imaginary));
    }
    cross(q) {
        return Quaternion.Cross(this, q);
    }
    static Mul(q1, q2) {
        let real = q1.real * q2.real;
        let imaginary0 = q2.scale(q1.real).imaginary;
        let imaginary1 = q1.scale(q2.real).imaginary;
        let imaginary2 = q1.cross(q2).imaginary;
        let imaginary = imaginary0.add(imaginary1).add(imaginary2);
        return new Quaternion(real - q1.dot(q2), imaginary);
    }
    mul(q) {
        return Quaternion.Mul(this, q);
    }
    static Conjugate(q) {
        Vector.Scale(q.imaginary, -1);
        return q;
    }
    conjugate() {
        return Quaternion.Conjugate(this.copy());
    }
    static Mag(q) {
        return Math.sqrt(q.real ** 2 + q.imaginary.mag() ** 2);
    }
    mag() {
        return Quaternion.Mag(this);
    }
    static Hat(q) {
        let mag = q.mag();
        if (mag != 0)
            Quaternion.Div(q, mag);
        return q;
    }
    hat() {
        return Quaternion.Hat(this.copy());
    }
    static Inverse(q) {
        let den = q.mag() ** 2;
        return Quaternion.Div(Quaternion.Conjugate(q), den);
    }
    inverse() {
        return Quaternion.Inverse(this.copy());
    }
    static AngleBetween(q1, q2) {
        return Math.acos(q1.real * q2.real + q1.dot(q2) / q1.mag() / q2.mag());
    }
    angleTo(q) {
        return Quaternion.AngleBetween(this, q);
    }
}
