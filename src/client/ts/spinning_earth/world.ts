import { CADRes } from "../../../common/api";
import { getFormattedDate } from "../../../common/utils";
import { camMat } from "./camera";
import { Earth, Entity, Meteorite, Pin } from "./entities";
import { HUDElement } from "./hud-elements";
import { linAlg, mat4 } from "./math";
import { initMeshes } from "./meshes";
import { CROSSHAIR_MODEL } from "./models";
import { Particle } from "./particles";
import { ENTITY_SHADER, HUD_SHADER, PARTICLE_SHADER, SKYBOX_SHADER, initShaders, prepareShader } from "./shaders";
import { EternalDarkness, Skybox } from "./skyboxes";
import { initTextures } from "./textures";
import { createOrbit, getRandomVec4, latLongToVec4 } from "./util";

const cadMinDate = getFormattedDate();
const cadMaxDate = '30';
const cadMinDistMax = 0.0026; //Distance to moon in unit 'au'
const cadApiUrl = `/nasa-cad-api?date-min=${cadMinDate}&date-max=${cadMaxDate}&min-dist-max=${cadMinDistMax}`;

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

const _meteorites: Meteorite[] = [];
export function addMeteorite(m: Meteorite): Meteorite {
    addEntity(m);
    _meteorites.push(m);
    return m;
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
let _pin: Pin | undefined;
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
        const coords: [number, number] = [geo.coords.latitude * Math.PI / 180 - Math.PI / 60, geo.coords.longitude * Math.PI / 180 + Math.PI / 1.97];
        coords[1] += earth()!.orientation.r.data[1];
        console.log(coords + "\r\n");
        const vec = latLongToVec4(coords[0], coords[1], 5.5);
        const yDir = linAlg.createZeroMatrix(3, 1).loadMatrix(vec).normalize();
        const pos = earth()!.orientation.t.addR(vec);
        const zDir = linAlg.createZeroMatrix(3, 1).loadMatrix(camMat.t).subL(linAlg.createZeroMatrix(3, 1).loadMatrix(pos));
        const xDir = linAlg.ThreeD.cross(yDir, zDir).normalize();
        linAlg.ThreeD.cross(xDir, yDir, zDir).normalize();
        _pin = new Pin(pos);
        _pin.orientation.updateRMat((R) => {
            R.load(4, 4, [
                xDir.data[0], xDir.data[1], xDir.data[2], 0,
                yDir.data[0], yDir.data[1], yDir.data[2], 0,
                zDir.data[0], zDir.data[1], zDir.data[2], 0,
                0, 0, 0, 1
            ]);
        });
        addEntity(_pin);
    });

    const res = await fetch(cadApiUrl);
    const cad = await res.json() as CADRes;
    console.log(cad);
    console.log("\r\n");
    for (const d of cad.data) {
        const radius = 10 * (1 + Number(d[5])/cadMinDistMax);
        const dir = getRandomVec4(radius);
        const pos = getRandomVec4(radius);
        const [orbit, _radius] = createOrbit(dir, pos);
        addMeteorite(new Meteorite(orbit, radius, pos, d));
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