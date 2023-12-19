import { linAlg, mat4 } from "./math";
import { getOrthographicNO, getPerspectiveNO, resizeCanvasToDisplaySize } from "./util";
import { camMat } from "./camera";
import { MovementType, initInput, keyOffset, keyRoll, mouseX, mouseY, movementType, resetMouse } from "./input";
import { earth, initWorld, renderWorld, updateWorld } from "./world";
import { renderFPSText, renderMovementType, renderCADInfo } from "./text";
import { Meteorite } from "./entities";
import { SPINNING_EARTH_COMPONENT_ID, tryShowTutorial } from "../base";

let doRender: boolean = true;
export function setRender(render: boolean) {
  doRender = render;
}
let controlsEnabled = false;

let P: mat4 | undefined, O: mat4 | undefined;

let drawCanvas: HTMLCanvasElement | undefined;
let gl: WebGL2RenderingContext | undefined;
let fpsDisplay: HTMLDivElement | undefined;
let controlBox: HTMLElement;

export function displaySpinningEarth() {
  const spinningEarth = document.getElementById('spinning-earth-container');
  if (spinningEarth) {
    spinningEarth.style.display = 'grid';
    initializeEverything();
    setRender(true);
    requestAnimationFrame(_render);
  }
}

function _render() {
  const offsetScale = linAlg.createVector(4, [0.02, 0.02, 1, 1]);
  const rollScale = 0.02;

  if (!doRender || gl == undefined || drawCanvas == undefined || fpsDisplay == undefined)
    return;
  if (controlsEnabled) {
    const offset = keyOffset();
    if (camMat != undefined) {
      const roll = rollScale * keyRoll();
      const moveType = movementType();
      const earthPos = earth()!.orientation?.t;
      if (moveType == MovementType.FREE) {
        camMat.t.addL(linAlg.mmulR(camMat.orbit, linAlg.mmulR(camMat.M, offset)));
      } else if (moveType == MovementType.LOCKED || moveType == MovementType.DETACHED) {
        if (earthPos != undefined) {
          offset.scaleRows(offsetScale);
          camMat.dist += offset.data[2]!;
          const outerRot = linAlg.mmulL(linAlg.ThreeD.rotateAffineX(-offset.data[1]!), linAlg.mmulL(linAlg.ThreeD.rotateAffineY(offset.data[0]!), linAlg.ThreeD.rotateAffineZ(roll)));
          linAlg.mmulL(camMat.orbit, outerRot);
          const newPos = earthPos.addR(linAlg.createVector(4, [camMat.orbit.data[8]!, camMat.orbit.data[9]!, camMat.orbit.data[10]!, 0]).scale(camMat.dist));
          camMat.t.loadMatrix(newPos);
        }
      } else if (moveType == MovementType.TRACKING) {
        const offset = Meteorite.offset();
        if (offset != undefined) {
          const marked = Meteorite.marked()!
          linAlg.mmul(marked.orbit, offset, camMat.t);
          camMat.t.addL(marked.orientation.t);
        }
      }
      const distFromEarth = camMat.t.copy().subL(earthPos).norm();
      if (distFromEarth > 80) {
        camMat.t.scale(80 / distFromEarth);
        camMat.dist = 80;
      }
      if (moveType == MovementType.FREE || moveType == MovementType.TRACKING)
        linAlg.mmulL(camMat.M, linAlg.mmulL(linAlg.ThreeD.rotateAffineX(mouseY()), linAlg.mmulL(linAlg.ThreeD.rotateAffineY(mouseX()), linAlg.ThreeD.rotateAffineZ(roll))));
      else if (moveType == MovementType.LOCKED)
        camMat.M.resetToIdentity();
      else if (moveType == MovementType.DETACHED)
        linAlg.mmulL(camMat.M, linAlg.mmulL(linAlg.ThreeD.rotateAffineX(mouseY()), linAlg.ThreeD.rotateAffineY(mouseX())));
    }
    resetMouse();
  }
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  camMat.compose();
  camMat.invert();

  let deltaTime = new Date().getTime();
  if (P == undefined || O == undefined || resizeCanvasToDisplaySize(drawCanvas)) {
    gl.viewport(0, 0, drawCanvas.clientWidth, drawCanvas.clientHeight);
    P = getPerspectiveNO(drawCanvas.clientWidth, drawCanvas.clientHeight)
    O = getOrthographicNO(drawCanvas.clientWidth, drawCanvas.clientHeight)
  }
  renderWorld(gl, P, camMat.V!, camMat.C!, O);
  updateWorld();
  deltaTime = new Date().getTime() - deltaTime;

  renderFPSText(fpsDisplay, deltaTime);
  renderMovementType();
  renderCADInfo();
  requestAnimationFrame(_render);
}

let initialized = false;
export function initializeEverything(): void {
  if (initialized) {
    initInput(drawCanvas!);
    return;
  }
  drawCanvas = document.getElementById("canvas") as HTMLCanvasElement;
  document.addEventListener("pointerlockchange", () => {
    controlsEnabled = document.pointerLockElement === drawCanvas;
  }, false);
  resizeCanvasToDisplaySize(drawCanvas);
  gl = drawCanvas.getContext('webgl2')!;
  fpsDisplay = document.getElementById("fps-display") as HTMLDivElement;
  controlBox = document.getElementById("control-box-toggle") as HTMLElement;
  controlBox.addEventListener('click', toggleControlBox);

  initWorld(gl);
  tryShowTutorial(SPINNING_EARTH_COMPONENT_ID, {
    "en": "Here, you can check out our beautiful earth in all of its 3D glory!<br>"
      + "<br>"
      + "Your location is marked on the globe with a spinning arrow.<br>"
      + "<br>"
      + "The dots on our blue planet represent Fireball's, with size and red-ness<br>"
      + "proportial to the estimated kinetic energy.<br>"
      + "<br>"
      + "The asteroids are Near Earth Object's observed in the zone between<br>"
      + "Earth and the Moon. Hover over or select them to see some more details.<br>"
      + "<br>"
      + "There are different ways to move around the scene.<br>"
      + "Locked: &nbsp&nbspMovement and rotation locked to the center of Earth.<br>"
      + "Detached: Movement locked to the center of Earth. Free rotation via the mouse.<br>"
      + "Free: &nbsp&nbsp&nbsp&nbspFree movement and rotation.<br>"
      + "Tracking: Movement follows the selected asteroid, if present. Free rotation."
  }, () => initInput(drawCanvas!));

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.BLEND);
  gl.blendEquation(gl.FUNC_ADD);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  initialized = true;
}

function toggleControlBox() {
  const icon = document.getElementById("control-box-toggle");
  const controlBoxContent = document.getElementById("control-box-content");
  if (controlBoxContent && icon) {
    const currentDisp = controlBoxContent.style.display;
    if (currentDisp == "none") {
      controlBoxContent.style.display = "block";
      icon.style.rotate = "0deg";
    } else {
      controlBoxContent.style.display = "none";
      icon.style.rotate = "180deg";
    }
  }
}