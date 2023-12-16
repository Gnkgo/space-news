import { Matrix4D } from "../../../common/linalg";
import { ComposedMTMatrix } from "./camera";
import { linAlg, mat4 } from "./math";
import { Model, BACKGROUND_MODEL } from "./models";
import { Particle, StarParticle, SunParticle } from "./particles";
import { BACKGROUND_TEXTURE } from "./textures";
import { getRandomVec4 } from "./util";

export class Skybox {
    private readonly _particles: Particle[] = [];

    public constructor(particles: Particle[] = []) {
        this._particles = particles;
    }

    public render(gl: WebGL2RenderingContext, shader: WebGLProgram, P: mat4, V: mat4, camMat: ComposedMTMatrix) {
        const OM = linAlg.mmul(camMat.orbit, camMat.M);
        const t = camMat.t;
        for (const p of this._particles) {
            p.pos.addL(t);
            p.render(gl, shader, P, V, OM);
            p.pos.subL(t);
        }
    }

    public update(): void {
        for (const p of this._particles)
            p.update();
    }
}

export class StarryNight extends Skybox {
    private constructor(particles: Particle[]) {
        super(particles);
    }

    public static create(n: number): StarryNight {
        const particles = new Array<Particle>(n + 1);
        for (let i = 0; i < n; ++i)
            particles[i] = new StarParticle(linAlg.createZeroVector(4).loadMatrix(getRandomVec4(30)));
        particles[n] = new SunParticle(linAlg.createVector(4, [0, 0, -30, 0]));
        return new StarryNight(particles);
    }
}

export class EternalDarkness extends Skybox {
    private readonly _model: Model;
    private readonly _texture: WebGLTexture;

    public constructor() {
        super([new SunParticle(linAlg.createVector(4, [0, 0, -30, 0]))]);
        this._model = BACKGROUND_MODEL;
        this._texture = BACKGROUND_TEXTURE()!;
    }
    
    public override render(gl: WebGL2RenderingContext, shader: WebGLProgram, P: Matrix4D, V: Matrix4D, camMat: ComposedMTMatrix): void {
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
        const O = linAlg.Affine.translate(linAlg.createIdentityMatrix(4), camMat.t);
        this._model.render(gl, shader, P, V, O);
        super.render(gl, shader, P, V, camMat);
    }
}