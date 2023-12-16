import { Matrix4D } from "../../../common/linalg";
import { linAlg, mat4, vec4 } from "./math";
import { Model, SQUARE_MODEL, STAR_MODEL, FIRE_MODEL } from "./models";
import { SUN_TEXTURE } from "./textures";
import { lightRot } from "./world";

export class Particle {
    private readonly _model: Model;
    private readonly _texture: WebGLTexture | undefined;
    private readonly _rot: mat4;
    public readonly pos: vec4;
    public brightness: number = 1;

    public constructor(model: Model, pos: vec4, rot: number = 0, texture?: WebGLTexture) {
        this._model = model;
        this._rot = linAlg.ThreeD.rotateAffineZ(rot);
        this.pos = pos;
        this._texture = texture;
    }

    public render(gl: WebGL2RenderingContext, shader: WebGLProgram, P: mat4, V: mat4, M: mat4) {
        const uBrightness = gl.getUniformLocation(shader, 'uBrightness');
        gl.uniform1f(uBrightness, this.brightness);
        const texture = this._texture;
        const uUseTexture = gl.getUniformLocation(shader, "uUseTexture");
        if (texture != undefined) {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1f(uUseTexture, 1.0);
        } else
            gl.uniform1f(uUseTexture, 0.0);
        gl.activeTexture(gl.TEXTURE0);
        const uSampler = gl.getUniformLocation(shader, "uSampler");
        gl.uniform1i(uSampler, 0);
        const O = linAlg.Affine.translate(M.copy(), this.pos);
        linAlg.mmulL(O, this._rot);
        this._model.render(gl, shader, P, V, O);
    }

    public update(): void {
    }

    public filter(): boolean {
        return true;
    }
}

export class FireParticle extends Particle {
    public constructor(pos: vec4) {
        super(FIRE_MODEL, pos, Math.random() * 2*Math.PI);
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

    public constructor(pos: vec4) {
        super(STAR_MODEL, pos, Math.random() * 2*Math.PI);
    }
}

export class SunParticle extends Particle {
    private readonly _orbit: mat4;
    private readonly _dist: number;

    public constructor(pos: vec4) {
        super(SQUARE_MODEL, pos, 0, SUN_TEXTURE())
        const zDir = linAlg.createZeroVector(3).loadMatrix(pos);
        this._dist = zDir.norm();
        zDir.normalize();
        const yDir = linAlg.createVector(3, [0, 1, 0])
        const xDir = linAlg.ThreeD.cross(yDir, zDir).normalize();
        linAlg.ThreeD.cross(zDir, xDir, yDir).normalize();
        this._orbit = linAlg.createMatrix(4, 4, [
            xDir.data[0]!, xDir.data[1]!, xDir.data[2]!, 0,
            yDir.data[0]!, yDir.data[1]!, yDir.data[2]!, 0,
            zDir.data[0]!, zDir.data[1]!, zDir.data[2]!, 0,
            0, 0, 0, 1
        ]);
    }

    public override update(): void {
        linAlg.mmulL(this._orbit, linAlg.ThreeD.rotateAffineY(lightRot));
        this.pos.load(4, 1, [this._dist * this._orbit.data[8]!, this._dist * this._orbit.data[9]!, this._dist * this._orbit.data[10]!, 0]);
    }
}