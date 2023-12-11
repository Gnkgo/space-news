import { linAlg, mat4 } from "./global";
import { checkSphereCollision, getOrthographicNO, getPerspectiveNO, latLongToVec4 } from "./util";
import { Earth, Entity, Meteorite, Pin } from "./entities";
import { ComposedMTMatrix } from "./affine-matrix";
import { initTextures } from "./textures";
import { initMeshes } from "./meshes";
import { FireParticle, Particle } from "./particles";
import { ENTITY_SHADER, HUD_SHADER, PARTICLE_SHADER, SKYBOX_SHADER, initShaders, prepareShader } from "./shaders";
import { StarryNight } from "./skyboxes";
import { HUDElement } from "./hud-elements";
import { CROSSHAIR_MODEL } from "./models";

const pressed = new Map<string, boolean>();
document.addEventListener("keydown", (event) => {
  pressed.set(event.code, true);
})
document.addEventListener("keyup", (event) => {
  pressed.set(event.code, false);
})
const mouse: [number, number] = [0, 0];
document.addEventListener("mousemove", (event) => {
  mouse[0] = -event.movementX/canvas.width * 3*Math.PI;
  mouse[1] = -event.movementY/canvas.height * 3*Math.PI;
})

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

const gl = canvas.getContext('webgl2')!;
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clearDepth(1.0);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
gl.enable(gl.BLEND);
gl.blendEquation(gl.FUNC_ADD);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

initShaders(gl);
const entityShader = ENTITY_SHADER();
const particleShader = PARTICLE_SHADER();
const skyboxShader = SKYBOX_SHADER();
const hudShader = HUD_SHADER();
initMeshes(gl, entityShader);
initTextures(gl);

const entities: Entity[] = [];
const earth = new Earth();
entities.push(earth);

const meteorites: Meteorite[] = [];
let particles: Particle[] = [];
const skybox = StarryNight.create(200);
let pin: Pin;
let hud = new HUDElement(CROSSHAIR_MODEL, linAlg.createVector(2, [0,0]));

navigator.geolocation.getCurrentPosition((geo) => {
  const coords: [number, number] = [geo.coords.latitude * Math.PI/180 - Math.PI/60, geo.coords.longitude * Math.PI/180 + Math.PI/1.97];
  coords[1] += earth.orientation.r.data[1];
  console.log(coords + "\r\n");
  const vec = latLongToVec4(coords[0], coords[1], 5.5);
  const yDir = linAlg.createZeroMatrix(3, 1).loadMatrix(vec).normalize();
  const pos = earth.orientation.t.addR(vec);
  const zDir = linAlg.createZeroMatrix(3, 1).loadMatrix(camMat.t).subL(linAlg.createZeroMatrix(3, 1).loadMatrix(pos));
  const xDir = linAlg.ThreeD.cross(yDir, zDir).normalize();
  linAlg.ThreeD.cross(xDir, yDir, zDir).normalize();
  pin = new Pin(pos);
  pin.orientation.updateRMat((R) => {
    R.load(4, 4, [
      xDir.data[0], xDir.data[1], xDir.data[2], 0,
      yDir.data[0], yDir.data[1], yDir.data[2], 0,
      zDir.data[0], zDir.data[1], zDir.data[2], 0,
                 0,            0,            0, 1
    ]);
  });
  entities.push(pin);
});

let controlsEnabled = false;
document.addEventListener("click", () => {
  if (!document.pointerLockElement) {
    canvas.requestPointerLock();
  } else if (C != undefined) {
    const zDir = linAlg.createVector(3, [-C.data[8], -C.data[9], -C.data[10]]);
    console.log(zDir + "\r\n");
    const xDir = linAlg.createZeroMatrix(3, 1).loadMatrix(earth.orientation.t.subR(camMat.t.copy()));
    const radius = xDir.norm();
    xDir.normalize();
    console.log(xDir + ", " + radius + "\r\n");
    const yDir = linAlg.ThreeD.cross(zDir, xDir).normalize();
    console.log(yDir + "\r\n");
    linAlg.ThreeD.cross(xDir, yDir, zDir).normalize();
    console.log(zDir + "\r\n");
    const orbit = linAlg.createMatrix(4, 4, [
        xDir.data[0]!, xDir.data[1]!, xDir.data[2]!, 0,
        yDir.data[0]!, yDir.data[1]!, yDir.data[2]!, 0,
        zDir.data[0]!, zDir.data[1]!, zDir.data[2]!, 0,
        0,                         0,             0, 1
    ]);
    const meteorite = new Meteorite(orbit, radius, camPos);
    entities.push(meteorite);
    meteorites.push(meteorite);
  }
});
document.addEventListener("pointerlockchange", () => {
  controlsEnabled = document.pointerLockElement === canvas;
}, false);

const textCanvas = document.getElementById("text") as HTMLCanvasElement;
textCanvas.width = document.body.clientWidth;
textCanvas.height = document.body.clientHeight;
const ctx = textCanvas.getContext("2d")!;

const P = getPerspectiveNO(canvas.clientWidth, canvas.clientHeight);
const O = getOrthographicNO(canvas.clientWidth, canvas.clientHeight);

const camUp = linAlg.createVector(4, [0, 1, 0, 1]); // camera up-vector
const camPos = linAlg.createVector(4, [0, 0, 50, 1]); // initial camera position
const camDir = linAlg.createVector(4, [0, 0, -1, 0]).normalize(); // camera viewing direction
const lightPos = linAlg.createVector(4, [5, 0, -30, 1]); // initial light position

const camMat = new ComposedMTMatrix(camDir, camUp, camPos);
let C: mat4 | undefined, V: mat4 | undefined;

main();
function main() {
  if (canvas == null || textCanvas == null) {
    alert("Cannot instantiate canvas. Consider using vscode-preview-server.");
    return;
  }
  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }
  function render() {
    if (controlsEnabled) {
      const offset = linAlg.createVector(4, [
        (pressed.get("KeyD") ? 1 : 0) - (pressed.get("KeyA") ? 1 : 0),
        (pressed.get("Space") ? 1 : 0) - (pressed.get("KeyC") ? 1 : 0),
        (pressed.get("KeyS") ? 1 : 0) - (pressed.get("KeyW") ? 1 : 0),
        0
      ]);
      const roll = (pressed.get("KeyQ") ? 1 : 0) - (pressed.get("KeyE") ? 1 : 0);
      if (pressed.get("ShiftLeft"))
        lightPos.addL(offset);
      else if (camMat != undefined) {
        camMat.t.addL(linAlg.mmulR(camMat.M, offset));
        //const vec = linAlg.createVector(4, [0, 0, -1, 0]);
        const innerRot = linAlg.mmulL(linAlg.ThreeD.rotateAffineX(mouse[1]), linAlg.mmulL(linAlg.ThreeD.rotateAffineY(mouse[0]), linAlg.ThreeD.rotateAffineZ(roll * 0.02)));
        linAlg.mmulL(camMat.M, innerRot);
        mouse[0] = 0;
        mouse[1] = 0;
        //linAlg.mmulR(rot, vec);
        //camDir.loadMatrix(vec);
      }
    }
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    C = camMat.composed();
    V = camMat.inverted();

    let deltaTime = new Date().getTime();

    prepareShader(gl, entityShader, lightPos);
    for (const e of entities)
      e.render(gl, entityShader, P, V);
    prepareShader(gl, particleShader);
    for (const p of particles)
      p.render(gl, particleShader, P, V, C);
    prepareShader(gl, skyboxShader);
    skybox.render(gl, skyboxShader, P, V, camMat);
    prepareShader(gl, hudShader);
    hud.render(gl, hudShader, O)
    
    earth.orientation.updateR((r) => r.addL(linAlg.createVector(4, [0, Math.PI/1000, 0, 0])));
    const earthPos = earth.orientation.t;

    const hits: string[] = [];
    for (const c of meteorites) {
      const orbit = c.orbit;
      const newPos = earthPos.subR(linAlg.createVector(4, [orbit.data[0]!, orbit.data[1]!, orbit.data[2]!, 0]).scale(c.radius));
      const orient = c.orientation;
      orient.updateT((t) => t.loadMatrix(newPos));
      linAlg.mmulL(orbit, linAlg.ThreeD.rotateAffineY(Math.PI / 2000));
      orient.updateRMat((R) => R.loadMatrix(linAlg.mmulR(orbit, linAlg.ThreeD.rotateAffineY(c.spin += Math.PI / 200))));
      if (c.nextFire <= 0) {
        particles.push(new FireParticle(orient.t.addR(linAlg.mmulR(orbit, linAlg.createVector(4, [0.5*Math.random() - 0.25, 0.5*Math.random() - 0.25, -1, 0])))));
        c.nextFire = 2;
      } else
        --c.nextFire;
      const relPos = camMat.t.copy().subL(c.orientation.t);
      hits.push("  " + checkSphereCollision(relPos, linAlg.createVector(4, [C.data[8], C.data[9], C.data[10], 0]), 0.5));
    }

    particles = particles.filter((p, _i, _arr) => p.filter());

    if (pin != undefined) {
      pin.orientation.updateRMat((R) => linAlg.mmulR(linAlg.ThreeD.rotateAffineY(Math.PI/1000), R));
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

    deltaTime = new Date().getTime() - deltaTime;

    const lineHeight = 30;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.font = "bold 24px monospace ";
    ctx.fillStyle = "#ffffff";
    let controlText = [
      "controls:",
      "  camera move  : A D / W S / Space C",
      "  roll         : Q E",
      "  move light   : hold shift + (A D / W S / Space C)",
      "light:",
      "  " + lightPos.data.slice(0, 3),
      "character:",
      "  " + camMat.t.data.slice(0, 3),
      "dT:",
      "  " + deltaTime + "ms",
      "entities:",
      "  " + entities.length,
      "particles:",
      "  " + particles.length,
      "linalg:",
      "  " + linAlg.bufferUsage(),
      "  " + linAlg.iteratorUsage(),
      "hits:",
      ...hits
    ];
    for (let i = 0; i < controlText.length; i++)
      ctx.fillText(controlText[i]!, 0, (i+1)*lineHeight);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}