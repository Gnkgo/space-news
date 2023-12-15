import { Matrix4D } from "../../../common/linalg";
import { linAlg, mat4, vec4 } from "./math";
import { Model, STAR_MODEL, TRIANGLE_MODEL } from "./models";

export class Particle {
    private readonly _model: Model;
    private readonly _rot: mat4;
    public readonly pos: vec4;
    public brightness: number = 1;

    public constructor(model: Model, pos: vec4, rot: number = 0) {
        this._model = model;
        this._rot = linAlg.ThreeD.rotateAffineZ(rot);
        this.pos = pos;
    }

    public render(gl: WebGL2RenderingContext, shader: WebGLProgram, P: mat4, V: mat4, M: mat4) {
        const uBrightness = gl.getUniformLocation(shader, 'uBrightness');
        gl.uniform1f(uBrightness, this.brightness);
        const O = linAlg.Affine.translate(M.copy(), this.pos);
        linAlg.mmulL(O, this._rot);
        this._model.render(gl, shader, P, V, O);
    }

    public filter(): boolean {
        return true;
    }
}

export class FireParticle extends Particle {
    constructor(pos: vec4) {
        super(TRIANGLE_MODEL, pos, Math.random() * 2*Math.PI);
    }

    public override render(gl: WebGL2RenderingContext, shader: WebGLProgram, P: Matrix4D, V: Matrix4D, M: Matrix4D): void {
        this.brightness -= 0.01;
        super.render(gl, shader, P, V, M);
    }

    public override filter(): boolean {
        return this.brightness > 0.2;
    }
}

export class StarParticle extends Particle {
    private static readonly _baseBrightness = 0.5;
    private _glow = Math.random() * 2*Math.PI;

    public override render(gl: WebGL2RenderingContext, shader: WebGLProgram, P: Matrix4D, V: Matrix4D, M: Matrix4D): void {
        this.brightness = StarParticle._baseBrightness + (Math.sin(this._glow) + 1)/2 * (1 - StarParticle._baseBrightness);
        this._glow += 0.05;
        super.render(gl, shader, P, V, M);
    }

    constructor(pos: vec4) {
        super(STAR_MODEL, pos, Math.random() * 2*Math.PI);
    }
}