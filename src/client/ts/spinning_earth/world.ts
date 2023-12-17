import { CADRes, FireballRes } from "../../../common/api";
import { getFormattedDate } from "../../../common/utils";
import { camMat } from "./camera";
import { Disk, Earth, Entity, Meteorite, Pin } from "./entities";
import { HUDElement } from "./hud-elements";
import { linAlg, mat4 } from "./math";
import { initMeshes } from "./meshes";
import { CROSSHAIR_MODEL } from "./models";
import { Particle } from "./particles";
import { ENTITY_SHADER, HUD_SHADER, PARTICLE_SHADER, SKYBOX_SHADER, initShaders, prepareShader } from "./shaders";
import { EternalDarkness, Skybox } from "./skyboxes";
import { initTextures } from "./textures";
import { attachToEarth, createOrbit, getRandomVec4 } from "./util";

const cadMinDate = getFormattedDate();
const cadMaxDate = '30';
const cadMinDistMax = 0.0026; //Distance to moon in unit 'au'
const cadApiUrl = `/nasa-cad-api?date-min=${cadMinDate}&date-max=${cadMaxDate}&min-dist-max=${cadMinDistMax}`;

const fireballMinDate = '2010-01-01';
const fireballReqLocBool = true;
const fireballApiUrl = `/nasa-fireball-api?date-min=${fireballMinDate}&req-loc=${fireballReqLocBool}`;

export const lightDir = linAlg.createVector(3, [0, 0, -1]).normalize();
export const lightRot = Math.PI / 2000;

export const earthRot = linAlg.createVector(4, [0, Math.PI / 1000, 0, 0]);

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

let _particles: Particle[] = [];
export function particleCount(): number {
    return _particles.length;
}
export function addParticle(p: Particle): Particle {
    _particles.push(p);
    return p;
}

let _skybox: Skybox;
let _crosshair: HUDElement;
let _entityShader: WebGLProgram;
let _particleShader: WebGLProgram;
let _skyboxShader: WebGLProgram;
let _hudShader: WebGLProgram;
export async function initWorld(gl: WebGL2RenderingContext): Promise<void> {
    initShaders(gl);
    _entityShader = ENTITY_SHADER();
    _particleShader = PARTICLE_SHADER();
    _skyboxShader = SKYBOX_SHADER();
    _hudShader = HUD_SHADER();
    initMeshes(gl, _entityShader, _particleShader, _skyboxShader, _hudShader);
    initTextures(gl);
    _earth = addEntity(new Earth());
    _skybox = new EternalDarkness(); //StarryNight.create(200);
    _crosshair = new HUDElement(CROSSHAIR_MODEL, linAlg.createVector(2, [0, 0]))
    navigator.geolocation.getCurrentPosition((geo) => {
        addEntity(attachToEarth(geo.coords.latitude, geo.coords.longitude, () => new Pin()));
    });

    const cad = await fetch(cadApiUrl).then(data => data.json()) as CADRes;
    console.log(cad);
    console.log("\r\n");
    for (const d of cad.data) {
        const radius = 10 * (1 + Number(d[5])/cadMinDistMax);
        const dir = getRandomVec4(radius);
        const pos = getRandomVec4(radius);
        const [orbit, _radius] = createOrbit(dir, pos);
        addEntity(new Meteorite(orbit, radius, pos, d));
    }

    const fireball = await fetch(fireballApiUrl).then(data => data.json()) as FireballRes;
    console.log(fireball);
    console.log("\r\n");
    for (const d of fireball.data) {
        console.log(d);
        const logKt = Math.log10(Number(d[2]!));
        console.log("logKt: " + logKt + "\r\n");
        const scale = Math.min(Math.max(0, logKt + 1) / 3.5, 1);
        const color = linAlg.createVector(4, [1, 0, 0, 1]).scale(scale).addL(linAlg.createVector(4, [0, 1, 0, 1]).scale(1 - scale));
        const disk = attachToEarth((d[4] == "N" ? 1 : -1) * Number(d[3]!), (d[6] == "E" ? 1 : -1) * Number(d[5]!), () => new Disk(scale, color));
        addEntity(disk);
    }
}

export function renderWorld(gl: WebGL2RenderingContext, P: mat4, V: mat4, C: mat4, O: mat4): void {
    prepareShader(gl, _entityShader, lightDir);
    for (const e of _entities)
        e.render(gl, _entityShader, P, V);
    prepareShader(gl, _particleShader);
    for (const p of _particles)
        p.render(gl, _particleShader, P, V, C);
    prepareShader(gl, _skyboxShader);
    _skybox.render(gl, _skyboxShader, P, V, camMat);
    prepareShader(gl, _hudShader);
    _crosshair.render(gl, _hudShader, O)
}

export function updateWorld(): void {
    _earth!.orientation.updateR((r) => r.addL(earthRot));

    Meteorite.resetTracked();
    for (const e of _entities)
        e.update();
    Meteorite.updateTracked();

    for (const p of _particles)
        p.update();
    _particles = _particles.filter((p, _i, _arr) => p.filter());

    _skybox.update();
    linAlg.mmulR(linAlg.ThreeD.rotateY(lightRot), lightDir);
}