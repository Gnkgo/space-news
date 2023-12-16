import { ComposedRTSMatrix } from "./affine-matrix";
import { camMat } from "./camera";
import { linAlg, mat4, vec4 } from "./math";
import { EARTH_MODEL, METEORITE_MODEL, Model, PIN_MODEL } from "./models";
import { FireParticle } from "./particles";
import { EARTH_TEXTURE, METEORITE_TEXTURE } from "./textures";
import { checkSphereCollision } from "./util";
import { addParticle, earth } from "./world";

export class Entity {
    private readonly _model: Model;
    private readonly _texture: WebGLTexture | undefined;
    public readonly orientation: ComposedRTSMatrix;
    public readonly colorModifier: vec4;

    public constructor(model: Model, r: vec4, t: vec4, s: vec4, texture?: WebGLTexture) {
        this._model = model;
        this._texture = texture;
        this.orientation = new ComposedRTSMatrix(r, t, s);
        this.colorModifier = linAlg.createOnesVector(4);
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
        const uVertexColorModifier = gl.getUniformLocation(shader, "uColorModifier");
        gl.uniform4fv(uVertexColorModifier, new Float32Array(this.colorModifier.data));
        const orient = this.orientation;
        const O = orient.composed();
        const On = orient.inverted();
        On.transposed(On);
        this._model.render(gl, shader, P, V, O, On);
    }

    public update(): void {
    }
}

export class Earth extends Entity {
    private static readonly _r = linAlg.createVector(4, [0, 0, 0, 0]);
    private static readonly _t = linAlg.createVector(4, [0, 0, 0, 1]);
    private static readonly _s = linAlg.createVector(4, [1, 1, 1, 1]);

    public constructor() {
        super(EARTH_MODEL, Earth._r, Earth._t, Earth._s, EARTH_TEXTURE());
    }
}

export class Meteorite extends Entity {
    private static readonly _r = linAlg.createVector(4, [0, 0, 0, 0]);
    private static readonly _s = linAlg.createVector(4, [1, 1, 1, 1]);
    private static readonly _hit: { time: number, meteorite: Meteorite | undefined } = { time: Number.MAX_VALUE, meteorite: undefined };
    private static _tracked: Meteorite | undefined = undefined;
    private static _marked: Meteorite | undefined = undefined;
    private static _offset: vec4 | undefined = undefined;

    public readonly orbit: mat4;
    public readonly radius: number
    public spin: number = 0;
    public nextFire: number = 0;
    public blink = 0;

    public readonly name: string;
    public readonly date: string;
    public readonly dist: string;
    public readonly vel: string;

    public static resetTracked(): void {
        Meteorite._hit.time = Number.MAX_VALUE;
        Meteorite._hit.meteorite = undefined;
    }

    public static updateTracked(): void {
        const next = Meteorite._hit.meteorite;
        if (next != undefined && next == Meteorite._marked)
            return;
        const prev = Meteorite._tracked;
        if (prev != undefined && prev != next)
            prev.blink = 0;
        Meteorite._tracked = next;
        if (next != undefined)
            next.blink += Math.PI / 50;
    }

    public static tracked(): Meteorite | undefined {
        return Meteorite._tracked;
    }

    public static updateMarked(): void {
        const prev = Meteorite._marked;
        if (prev != undefined)
            prev.blink = 0;
        const next = Meteorite._tracked;
        Meteorite._tracked = undefined;
        Meteorite._marked = next;
        if (next != undefined && next != prev) {
            next.blink = Math.PI;
            const invOrbit = next.orbit.transposed();
            const relPos = camMat.t.copy().subL(next.orientation.t);
            linAlg.mmulR(invOrbit, relPos);
            Meteorite._offset = relPos;
        } else
            Meteorite._offset = undefined;
    }

    public static marked(): Meteorite | undefined {
        return Meteorite._marked;
    }

    public static offset(): vec4 | undefined {
        return Meteorite._offset;
    }

    public constructor(orbit: mat4, radius: number, pos: vec4, cadData: string[]) {
        super(METEORITE_MODEL, Meteorite._r, pos, Meteorite._s, METEORITE_TEXTURE());
        this.orbit = orbit;
        this.radius = radius;
        this.colorModifier.load(4, 1, [2, 2, 2, 0.5]);
        
        this.name = cadData[0]!;
        this.date = cadData[3]!;
        this.dist = Number(cadData[5]).toFixed(4) + "au";
        this.vel = Number(cadData[7]).toFixed(4) + "km/s";
    }

    public override update(): void {
        const orbit = this.orbit;
        const earthPos = earth()!.orientation.t;
        const newPos = earthPos.subR(linAlg.createVector(4, [orbit.data[0]!, orbit.data[1]!, orbit.data[2]!, 0]).scale(this.radius));
        const orient = this.orientation;
        orient.updateT((t) => t.loadMatrix(newPos));
        linAlg.mmulL(orbit, linAlg.ThreeD.rotateAffineY(Math.PI / 2000));
        orient.updateRMat((R) => R.loadMatrix(linAlg.mmulR(orbit, linAlg.ThreeD.rotateAffineY(this.spin += Math.PI / 200))));
        if (this.nextFire <= 0) {
            addParticle(new FireParticle(orient.t.addR(linAlg.mmulR(orbit, linAlg.createVector(4, [0.5 * Math.random() - 0.25, 0.5 * Math.random() - 0.25, -1, 0])))));
            this.nextFire = 2;
        } else
            --this.nextFire;
        const relPos = camMat.t.copy().subL(this.orientation.t);
        const dir = linAlg.createVector(4, [camMat.C!.data[8], camMat.C!.data[9], camMat.C!.data[10], 0]);
        const hitTime = checkSphereCollision(relPos, dir, 0.5);
        if (hitTime < Meteorite._hit.time) {
            Meteorite._hit.time = hitTime;
            Meteorite._hit.meteorite = this;
        }
        const blink = 2 + Math.sin(this.blink - Math.PI / 2);
        this.colorModifier.load(4, 1, [1, blink, blink, 1]);
    }
}

export class Pin extends Entity {
    private static readonly _r = linAlg.createVector(4, [0, 0, 0, 0]);
    private static readonly _s = linAlg.createVector(4, [1, 1, 1, 1]);

    public hover: number = 0;

    public constructor(t: vec4) {
        super(PIN_MODEL, Pin._r, t, Pin._s);
    }

    public override update(): void {
        this.orientation.updateRMat((R) => linAlg.mmulR(linAlg.ThreeD.rotateAffineY(Math.PI / 1000), R));
        this.hover += 0.1;
        this.orientation.updateT((t) => {
            const R = this.orientation.R;
            const up = linAlg.createVector(4, [R.data[4], R.data[5], R.data[6], 0]);
            t.loadMatrix(earth()!.orientation.t.addR(up.scale(5.5 + (Math.sin(this.hover) + 1) / 2)));
        });
        this.orientation.updateRMat((R) => {
            linAlg.mmulL(R, linAlg.ThreeD.rotateAffineY(0.1));
        })
    }
}