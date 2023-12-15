import { ComposedMTMatrix } from "./camera";
import { mat4 } from "./math";
import { Particle, StarParticle } from "./particles";
import { getRandomVec4 } from "./util";

export class Skybox {
    private readonly _particles: Particle[] = [];

    public constructor(particles: Particle[] = []) {
        this._particles = particles;
    }

    public render(gl: WebGL2RenderingContext, shader: WebGLProgram, P: mat4, V: mat4, camMat: ComposedMTMatrix) {
        const M = camMat.M;
        const t = camMat.t;
        for (const p of this._particles) {
            p.pos.addL(t);
            p.render(gl, shader, P, V, M);
            p.pos.subL(t);
        }
    }
}

export class StarryNight extends Skybox {
    private constructor(particles: Particle[]) {
        super(particles);
    }

    public static create(n: number): StarryNight {
        const particles = new Array<Particle>(n);
        for (let i = 0; i < n; ++i)
            particles[i] = new StarParticle(getRandomVec4(30));
        return new StarryNight(particles);
    }
}