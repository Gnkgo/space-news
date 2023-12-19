import { vec4, mat4, linAlg } from "./math";

export class ComposedRTSMatrix {
    public readonly r: vec4;
    public readonly R: mat4 = linAlg.createIdentityMatrix(4);
    public readonly invR: mat4 = linAlg.createIdentityMatrix(4);
    public readonly t: vec4;
    public readonly T: mat4 = linAlg.createIdentityMatrix(4);
    public readonly invT: mat4 = linAlg.createIdentityMatrix(4);
    public readonly s: vec4;
    public readonly S: mat4 = linAlg.createIdentityMatrix(4);
    public readonly invS: mat4 = linAlg.createIdentityMatrix(4);

    private readonly _com: mat4 = linAlg.createIdentityMatrix(4);
    private _comChanged: boolean = true;
    private readonly _inv: mat4 = linAlg.createIdentityMatrix(4);
    private _invChanged: boolean = true;

    private _setChanged(): void {
        this._comChanged = true;
        this._invChanged = true;
    }

    public updateR(func: (r: vec4) => void): void {
        func(this.r);
        this.updateRMat(R => {
            R.resetToIdentity();
            const rot = linAlg.createIdentityMatrix(4);
            linAlg.ThreeD.rotateAffineZ(this.r.data[2]!, rot);
            linAlg.mmulR(rot, R);
            linAlg.ThreeD.rotateAffineY(this.r.data[1]!, rot);
            linAlg.mmulR(rot, R);
            linAlg.ThreeD.rotateAffineX(this.r.data[0]!, rot);
            linAlg.mmulR(rot, R);
        });
    }
    public updateRMat(func: (R: mat4) => void): void {
        func(this.R);
        this.R.transposed(this.invR);
        this._setChanged();
    }
    public updateT(func: (t: vec4) => void): void {
        func(this.t);
        this.updateTMat(T => {
            linAlg.Affine.translate(T, this.t);
        });
    }
    public updateTMat(func: (T: mat4) => void): void {
        func(this.T);
        const it = linAlg.popMatIt(this.T);
        it.jumpCols(4);
        const minusT = linAlg.createVector(3, [
            -this.T.data[it.jumpRows().current()]!,
            -this.T.data[it.jumpRows().current()]!,
            -this.T.data[it.jumpRows().current()]!
        ]);
        linAlg.Affine.translate(this.invT, minusT)
        linAlg.pushIt(it);
        this._setChanged();
    }
    public updateS(func: (s: vec4) => void): void {
        func(this.s);
        this.updateSMat(S => {
            S.resetToIdentity();
            S.scaleRows(this.s);
        });
    }
    public updateSMat(func: (S: mat4) => void): void {
        func(this.S);
        const it = linAlg.popMatIt(this.S);
        const oneOverS = linAlg.createVector(4, [
            1/this.S.data[it.jumpRows().jumpCols().current()]!,
            1/this.S.data[it.jumpRows().jumpCols().current()]!,
            1/this.S.data[it.jumpRows().jumpCols().current()]!,
            1
        ]);
        this.invS.resetToIdentity().scaleRows(oneOverS);
        linAlg.pushIt(it);
        this._setChanged();
    }

    public constructor(r: vec4, t: vec4, s: vec4) {
        this.r = r.copy();
        this.t = t.copy();
        this.s = linAlg.createVector(4, [s.data[0]!, s.data[1]!, s.data[2]!, 1]);
        this.updateR((_r) => { });
        this.updateT((_t) => { });
        this.updateS((_s) => { });
    }

    public composed(com: mat4 = linAlg.createIdentityMatrix(4)): mat4 {
        // mat = t -> rX -> rY -> rZ -> s
        if (this._comChanged) {
            this._comChanged = false;
            this._com.resetToIdentity();
            linAlg.mmulR(this.S, this._com);
            linAlg.mmulR(this.R, this._com);
            linAlg.mmulR(this.T, this._com);
        }        
        return com.loadMatrix(this._com);
    }
    public inverted(inv: mat4 = linAlg.createIdentityMatrix(4)): mat4 {
        // inv = s-1 -> t-1 -> rX-1 -> rY-1 -> rZ-1
        if (this._invChanged) {
            this._invChanged = false;
            this._inv.resetToIdentity();
            linAlg.mmulR(this.invT, this._inv);
            linAlg.mmulR(this.invR, this._inv);
            linAlg.mmulR(this.invS, this._inv);
        }
        return inv.loadMatrix(this._inv);
    }
}