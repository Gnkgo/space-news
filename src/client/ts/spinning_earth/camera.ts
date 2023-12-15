import { linAlg, mat4, vec4 } from "./math";

export const camUp = linAlg.createVector(4, [0, 1, 0, 1]); // camera up-vector
export const camPos = linAlg.createVector(4, [0, 0, 50, 1]); // initial camera position
export const camDir = linAlg.createVector(4, [0, 0, -1, 0]).normalize(); // camera viewing direction
export const lightPos = linAlg.createVector(4, [5, 0, -30, 1]); // initial light position

export class ComposedMTMatrix {
    public readonly M: mat4;
    public readonly t: vec4;

    public constructor(camDir: vec4, camUp: vec4, camPos: vec4) {
        let zDir = linAlg.createZeroMatrix(3, 1).loadMatrix(camDir).scale(-1);
        let yDir = linAlg.createZeroMatrix(3, 1).loadMatrix(camUp);
        let xDir = linAlg.ThreeD.cross(yDir, zDir);
        xDir.normalize();
        linAlg.ThreeD.cross(zDir, xDir, yDir);
        this.M = linAlg.createMatrix(4, 4, [
            xDir.data[0]!, xDir.data[1]!, xDir.data[2]!, 0,
            yDir.data[0]!, yDir.data[1]!, yDir.data[2]!, 0,
            zDir.data[0]!, zDir.data[1]!, zDir.data[2]!, 0,
            0,                         0,             0, 1
        ]);
        this.t = camPos.copy();
    }

    public composed(com: mat4 = linAlg.createIdentityMatrix(4)): mat4 {
        return linAlg.Affine.translate(com.loadMatrix(this.M), this.t);
    }

    public inverted(inv: mat4 = linAlg.createIdentityMatrix(4)): mat4 {
        const mInv = this.M.copy();
        mInv.transposed(mInv);
        const tInv = linAlg.mmulR(mInv, this.t.copy()).scale(-1);
        inv.loadMatrix(mInv);
        linAlg.Affine.translate(inv, tInv);
        return inv;
    }
}
export const camMat = new ComposedMTMatrix(camDir, camUp, camPos);