import { lightPos, camMat } from "./camera";
import { Earth, Entity, Meteorite, Pin } from "./entities";
import { HUDElement } from "./hud-elements";
import { linAlg, mat4 } from "./math";
import { initMeshes } from "./meshes";
import { CROSSHAIR_MODEL } from "./models";
import { FireParticle, Particle } from "./particles";
import { ENTITY_SHADER, HUD_SHADER, PARTICLE_SHADER, SKYBOX_SHADER, initShaders, prepareShader } from "./shaders";
import { StarryNight } from "./skyboxes";
import { initTextures } from "./textures";
import { checkSphereCollision } from "./util";

const _entities: Entity[] = [];
export function entityCount(): number {
    return _entities.length;
}
export function addEntity(e: Entity): Entity {
    _entities.push(e);
    return e;
}
let _earth: Earth | undefined;
export function earth(): Earth | undefined {
    return _earth;
}

const _meteorites: Meteorite[] = [];
export function addMeteorite(m: Meteorite): Meteorite {
    addEntity(m);
    _meteorites.push(m);
    return m;
}

export const skybox = StarryNight.create(200);
export const hud = new HUDElement(CROSSHAIR_MODEL, linAlg.createVector(2, [0, 0]));

let _particles: Particle[] = [];
export function particleCount(): number {
    return _particles.length;
}
export function addParticle(p: Particle): Particle {
    _particles.push(p);
    return p;
}

let _pin: Pin | undefined;
export function setPin(p: Pin): void {
    _pin = p;
}

let _entityShader: WebGLProgram;
let _particleShader: WebGLProgram;
let _skyboxShader: WebGLProgram;
let _hudShader: WebGLProgram;
export function initWorld(gl: WebGL2RenderingContext): void {
    initShaders(gl);
    _entityShader = ENTITY_SHADER();
    _particleShader = PARTICLE_SHADER();
    _skyboxShader = SKYBOX_SHADER();
    _hudShader = HUD_SHADER();
    initMeshes(gl, _entityShader);
    initTextures(gl);
    _earth = addEntity(new Earth());
}

export function renderWorld(gl: WebGL2RenderingContext, P: mat4, V: mat4, C: mat4, O: mat4): void {
    prepareShader(gl, _entityShader, lightPos);
    for (const e of _entities)
        e.render(gl, _entityShader, P, V);
    prepareShader(gl, _particleShader);
    for (const p of _particles)
        p.render(gl, _particleShader, P, V, C);
    prepareShader(gl, _skyboxShader);
    skybox.render(gl, _skyboxShader, P, V, camMat);
    prepareShader(gl, _hudShader);
    hud.render(gl, _hudShader, O)
}

export function updateWorld(C: mat4): string[] {
    _earth!.orientation.updateR((r) => r.addL(linAlg.createVector(4, [0, Math.PI / 1000, 0, 0])));
    const earthPos = _earth!.orientation.t;

    const hits: string[] = [];
    for (const c of _meteorites) {
        const orbit = c.orbit;
        const newPos = earthPos.subR(linAlg.createVector(4, [orbit.data[0]!, orbit.data[1]!, orbit.data[2]!, 0]).scale(c.radius));
        const orient = c.orientation;
        orient.updateT((t) => t.loadMatrix(newPos));
        linAlg.mmulL(orbit, linAlg.ThreeD.rotateAffineY(Math.PI / 2000));
        orient.updateRMat((R) => R.loadMatrix(linAlg.mmulR(orbit, linAlg.ThreeD.rotateAffineY(c.spin += Math.PI / 200))));
        if (c.nextFire <= 0) {
            addParticle(new FireParticle(orient.t.addR(linAlg.mmulR(orbit, linAlg.createVector(4, [0.5 * Math.random() - 0.25, 0.5 * Math.random() - 0.25, -1, 0])))));
            c.nextFire = 2;
        } else
            --c.nextFire;
        const relPos = camMat.t.copy().subL(c.orientation.t);
        hits.push("  " + checkSphereCollision(relPos, linAlg.createVector(4, [C.data[8], C.data[9], C.data[10], 0]), 0.5));
    }

    _particles = _particles.filter((p, _i, _arr) => p.filter());

    const pin = _pin;
    if (pin != undefined) {
        pin.orientation.updateRMat((R) => linAlg.mmulR(linAlg.ThreeD.rotateAffineY(Math.PI / 1000), R));
        pin.hover += 0.1;
        pin.orientation.updateT((t) => {
            const R = pin.orientation.R;
            const up = linAlg.createVector(4, [R.data[4], R.data[5], R.data[6], 0]);
            t.loadMatrix(earthPos.addR(up.scale(5.5 + (Math.sin(pin.hover) + 1) / 2)));
        });
        pin.orientation.updateRMat((R) => {
            linAlg.mmulL(R, linAlg.ThreeD.rotateAffineY(0.1));
        })
    }

    return hits;
}