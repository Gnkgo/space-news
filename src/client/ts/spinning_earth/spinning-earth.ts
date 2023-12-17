import { linAlg, mat4 } from "./math";
import { getOrthographicNO, getPerspectiveNO, resizeCanvasToDisplaySize } from "./util";
import { camMat } from "./camera";
import { MovementType, initKeys, isLightModifierPressed, keyOffset, keyRoll, mouseX, mouseY, movementType, resetMouse } from "./input";
import { earth, initWorld, renderWorld, updateWorld } from "./world";
import { renderText } from "./text";
import { Meteorite } from "./entities";
import { SPINNING_EARTH_COMPONENT_ID, tryShowTutorial } from "../base";

export async function initializeEverythin() {
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
    "en": "Here, you can check out our beautiful earth in all of its 3D glory!\r\n"
        + "\r\n"
        + "Your location is marked on the globe with a spinning arrow.\r\n"
        + "\r\n"
        + "The dots on our blue planet represent Fireball's, which are exceptionally bright\r\n"
        + "meteors that were able to be observed over a wide area. The size and red-ness of\r\n"
        + "a dot is proportial to the related Fireball's estimated kinetic energy."
        + "\r\n"
        + "The flying asteroid(s) are Near Earth Object's that are observed in the zone between\r\n"
        + "Earth and the Moon. Hover over one of them and mark it to see some more details on\r\n"
        + "the top left!\r\n"
        + "\r\n"
        + "You can change the way you move around the scene by pressing 'X'. The movement types are:\r\n:"
        + "Locked:   Movement and rotation is locked to the center of Earth.\r\n"
        + "Detached: Movement is locked to the center of Earth. Free rotation via the mouse.\r\n"
        + "Free:     Free movement and rotation in the scene.\r\n"
        + "Tracking: Movement follows the selected Near Earth Object, if present. Free rotation."
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