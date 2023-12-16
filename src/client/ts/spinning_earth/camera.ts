import { linAlg, mat4, vec3, vec4 } from "./math";

const _camDist = 50;
const _camPos = linAlg.createVector(3, [0, 0, 1]).scale(_camDist);
const _camUp = linAlg.createVector(3, [0, 1, 0]).normalize();
const _camDir = linAlg.createVector(3, [0, 0, -1]).normalize();

export class ComposedMTMatrix {
    public readonly orbit: mat4;
    public readonly M: mat4;
    public readonly t: vec4;
    public dist: number;

    public C: mat4 | undefined;
    public V: mat4 | undefined; 

    public constructor(camPos: vec3, camUp: vec3, camDir: vec3) {
        const yDir = camUp.copy();
        const zDir = camDir.copy().scale(-1);
        const xDir = linAlg.ThreeD.cross(yDir, zDir).normalize();
        //linAlg.ThreeD.cross(zDir, xDir, yDir).normalize();
        this.orbit = linAlg.createMatrix(4, 4, [
            xDir.data[0]!, xDir.data[1]!, xDir.data[2]!, 0,
            yDir.data[0]!, yDir.data[1]!, yDir.data[2]!, 0,
            zDir.data[0]!, zDir.data[1]!, zDir.data[2]!, 0,
            0,                         0,             0, 1
        ]);
        this.M = linAlg.createIdentityMatrix(4);
        this.t = linAlg.createVector(4, [0, 0, 0, 1]).loadMatrix(camPos);
        this.dist = camPos.norm();
    }

    public compose(): void {
        if (this.C == undefined)
            this.C = linAlg.createIdentityMatrix(4);
        linAlg.mmul(this.orbit, this.M, this.C);
        this.C = linAlg.Affine.translate(this.C, this.t);
    }

    public invert(): void {
        if (this.V == undefined)
            this.V = linAlg.createIdentityMatrix(4);
        linAlg.mmul(this.orbit, this.M, this.V);
        this.V.transposed(this.V);
        const tInv = linAlg.mmulR(this.V, this.t.copy()).scale(-1);
        linAlg.Affine.translate(this.V, tInv);
        this.V = this.V;
    }

    public lock(earthPos: vec4): void {
        const OM = linAlg.mmul(this.orbit, this.M);
        const zDir = linAlg.createZeroVector(3).loadMatrix(earthPos.copy().addL(this.t)).normalize();
        const yDir = linAlg.createVector(3, [OM.data[4]!, OM.data[5]!, OM.data[6]!]);
        const xDir = linAlg.ThreeD.cross(yDir, zDir).normalize();
        linAlg.ThreeD.cross(zDir, xDir, yDir).normalize();
        console.log("Before:\r\n" + this.orbit + "\r\n");
        this.orbit.load(4, 4, [
            xDir.data[0]!, xDir.data[1]!, xDir.data[2]!, 0,
            yDir.data[0]!, yDir.data[1]!, yDir.data[2]!, 0,
            zDir.data[0]!, zDir.data[1]!, zDir.data[2]!, 0,
            0,                         0,             0, 1
        ]);
        console.log("After:\r\n" + this.orbit + "\r\n");
    }
}
export const camMat = new ComposedMTMatrix(_camPos, _camUp, _camDir);