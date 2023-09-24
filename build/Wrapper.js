"use strict";
class Wrapper {
    constructor(canv = document.body.appendChild(document.createElement('canvas'))) {
        this.canv = canv;
        this.canv.width = window.innerWidth;
        this.canv.height = window.innerHeight;
        this.ctx = this.canv.getContext('2d');
    }
    get width() { return this.canv.width; }
    get height() { return this.canv.height; }
    set width(w) { this.canv.width = w; }
    set height(h) { this.canv.height = h; }
    get fillStyle() { return this.ctx.fillStyle; }
    get strokeStyle() { return this.ctx.strokeStyle; }
    set fillStyle(c) { this.ctx.fillStyle = c; }
    set strokeStyle(c) { this.ctx.strokeStyle = c; }
    fillRect(x, y, w, h) {
        this.ctx.fillRect(x, y, w, h);
    }
    bg(c = '#000') {
        let oc = this.fillStyle;
        if (oc != c)
            this.fillStyle = c;
        this.fillRect(0, 0, this.width, this.height);
        if (oc != c)
            this.fillStyle = oc;
    }
    ellipse(x, y, w, h) {
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }
    point(x, y, r) {
        this.ellipse(x, y, r * 2, r * 2);
    }
    trianglePath(x1, y1, x2, y2, x3, y3) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.lineTo(x3, y3);
        this.ctx.closePath();
    }
    fillTriangle(x1, y1, x2, y2, x3, y3) {
        this.trianglePath(x1, y1, x2, y2, x3, y3);
        this.ctx.fill();
    }
    strokeTriangle(x1, y1, x2, y2, x3, y3) {
        this.trianglePath(x1, y1, x2, y2, x3, y3);
        this.ctx.stroke();
    }
    renderTriangle(t) {
        this.fillStyle = t.c;
        this.fillTriangle(...t.p[0].toXYArr(), ...t.p[1].toXYArr(), ...t.p[2].toXYArr());
    }
}
