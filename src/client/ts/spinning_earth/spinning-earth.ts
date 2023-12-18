import { linAlg, mat4 } from "./math";
import { getOrthographicNO, getPerspectiveNO, resizeCanvasToDisplaySize } from "./util";
import { camMat } from "./camera";
import { MovementType, initKeys, isLightModifierPressed, keyOffset, keyRoll, mouseX, mouseY, movementType, resetMouse } from "./input";
import { earth, initWorld, renderWorld, updateWorld } from "./world";
import { renderText } from "./text";
import { Meteorite } from "./entities";
import { SPINNING_EARTH_COMPONENT_ID, tryShowTutorial } from "../base";

export function displaySpinningEarth() {
  const spinningEarth = document.getElementById('spinning-earth-container');
  console.log("SPIN TEST", spinningEarth?.style.display);
  if (spinningEarth) {
      spinningEarth.style.display = 'block';
      initializeEverything();
  }
}

export async function initializeEverything() {
  const offsetScale = linAlg.createVector(4, [0.02, 0.02, 1, 1]);
  const rollScale = 0.02;

  const drawCanvas = document.getElementById("canvas") as HTMLCanvasElement;
  resizeCanvasToDisplaySize(drawCanvas);
  const gl = drawCanvas.getContext('webgl2')!;

  const textCanvas = document.getElementById("text") as HTMLCanvasElement;
  resizeCanvasToDisplaySize(textCanvas);
  const d2 = textCanvas.getContext("2d")!;

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
  }, () => initKeys(drawCanvas));

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.BLEND);
  gl.blendEquation(gl.FUNC_ADD);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let controlsEnabled = false;
  document.addEventListener("pointerlockchange", () => {
    controlsEnabled = document.pointerLockElement === drawCanvas;
  }, false);

  let P: mat4 | undefined, O: mat4 | undefined;
  main();
  function main() {
    if (drawCanvas == null || textCanvas == null) {
      alert("Cannot instantiate canvas. Consider using vscode-preview-server.");
      return;
    }
    if (gl === null) {
      alert("Unable to initialize WebGL. Your browser or machine may not support it.");
      return;
    }
    function render() {
      if (controlsEnabled) {
        const offset = keyOffset();
        if (isLightModifierPressed()) {
          /*lightDir.addL(linAlg.createZeroVector(3).loadMatrix(offset));
          if (lightDir.norm() == 0)
            lightDir.load(3, 1, [0, 0, -1]);
          else
            lightDir.normalize();*/
        }
        else if (camMat != undefined) {
          const roll = rollScale * keyRoll();
          const moveType = movementType();
          if (moveType == MovementType.FREE) {
            camMat.t.addL(linAlg.mmulR(camMat.orbit, linAlg.mmulR(camMat.M, offset)));
          } else if (moveType == MovementType.LOCKED || moveType == MovementType.DETACHED) {
            const earthPos = earth()?.orientation?.t;
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

      resizeCanvasToDisplaySize(textCanvas);
      renderText(d2, deltaTime);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }
}