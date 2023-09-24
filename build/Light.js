"use strict";
class Light extends SpatialObject {
    constructor(pos = new Vector(), dir = new Vector(0, 0, -1)) {
        super(pos, new OrientationMatrix(dir, new Vector(0, 1, 0)));
        this.dir = dir;
    }
}
