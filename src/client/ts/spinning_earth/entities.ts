import { ComposedRTSMatrix } from "./affine-matrix";
import { linAlg, mat4, vec4 } from "./math";
import { SPHERE_MODEL, Model, PIN_MODEL } from "./models";
import { EARTH_TEXTURE, METEORITE_TEXTURE } from "./textures";

export class Entity {
    private readonly _model: Model;
    private readonly _texture: WebGLTexture | undefined;
    public readonly orientation: ComposedRTSMatrix;

    public constructor(model: Model, r: vec4, t: vec4, s: vec4, texture?: WebGLTexture) {
        this._model = model;
        this._texture = texture;
        this.orientation = new ComposedRTSMatrix(r, t, s);
    }

    public render(gl: WebGL2RenderingContext, shader: WebGLProgram, P: mat4, V: mat4) {
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
        const orient = this.orientation;
        const O = orient.composed();
        const On = orient.inverted();
        On.transposed(On);
        this._model.render(gl, shader, P, V, O, On);
    }
}

export class Earth extends Entity {
    private static readonly _r = linAlg.createVector(4, [0, 0, 0, 0]);
    private static readonly _t = linAlg.createVector(4, [0, 0, 0, 1]);
    private static readonly _s = linAlg.createVector(4, [1, 1, 1, 1]);

    public constructor() {
        super(SPHERE_MODEL, Earth._r, Earth._t, Earth._s, EARTH_TEXTURE());
    }
}

export class Meteorite extends Entity {
    private static readonly _r = linAlg.createVector(4, [0, 0, 0, 0]);
    private static readonly _s = linAlg.createVector(4, [0.1, 0.1, 0.1, 1]);

    public readonly orbit: mat4;
    public readonly radius: number
    public spin: number = 0;
    public nextFire: number = 0;

    public constructor(orbit: mat4, radius: number, pos: vec4) {
        super(SPHERE_MODEL, Meteorite._r, pos, Meteorite._s, METEORITE_TEXTURE());
        this.orbit = orbit;
        this.radius = radius;
    }
}

export class Pin extends Entity {
    private static readonly _r = linAlg.createVector(4, [0, 0, 0, 0]);
    private static readonly _s = linAlg.createVector(4, [1, 1, 1, 1]);

    public hover: number = 0;

    public constructor(t: vec4) {
        super(PIN_MODEL, Pin._r, t, Pin._s);
    }
}