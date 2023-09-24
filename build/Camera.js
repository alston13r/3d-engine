"use strict";
class Camera extends SpatialObject {
    constructor(pos = new Vector(), forward = new Vector(0, 0, 1), up = new Vector(0, 1, 0)) {
        super(pos, new OrientationMatrix(forward, up));
    }
    makeMatView() {
        return Matrix.PointAtInverse(Matrix.MakePointAt(this.pos, this.pos.add(this.orientation.forward), this.orientation.up));
    }
}
