import { linAlg, mat4 } from "./math";
import { getOrthographicNO, getPerspectiveNO, latLongToVec4, resizeCanvasToDisplaySize } from "./util";
import { Meteorite, Pin } from "./entities";
import { camMat, camPos, lightPos } from "./camera";
import { initKeys, isLightModifierPressed, keyOffset, keyRoll, mouseX, mouseY, resetMouse } from "./keys";
import { addEntity, addMeteorite, earth, initWorld, renderWorld, setPin, updateWorld } from "./world";
import { renderText } from "./text";

export function initializeEverythin() {
  const drawCanvas = document.getElementById("canvas") as HTMLCanvasElement;
  resizeCanvasToDisplaySize(drawCanvas);
  const gl = drawCanvas.getContext('webgl2')!;

  const textCanvas = document.getElementById("text") as HTMLCanvasElement;
  resizeCanvasToDisplaySize(textCanvas);
  const d2 = textCanvas.getContext("2d")!;

  initWorld(gl);
  initKeys(drawCanvas);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.BLEND);
  gl.blendEquation(gl.FUNC_ADD);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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
    const pin = new Pin(pos);
    pin.orientation.updateRMat((R) => {
      R.load(4, 4, [
        xDir.data[0], xDir.data[1], xDir.data[2], 0,
        yDir.data[0], yDir.data[1], yDir.data[2], 0,
        zDir.data[0], zDir.data[1], zDir.data[2], 0,
        0, 0, 0, 1
      ]);
    });
    addEntity(pin);
    setPin(pin);
  });

  let controlsEnabled = false;
  document.addEventListener("click", () => {
    if (!document.pointerLockElement) {
      drawCanvas.requestPointerLock();
    } else if (C != undefined) {
      const zDir = linAlg.createVector(3, [-C.data[8], -C.data[9], -C.data[10]]);
      console.log(zDir + "\r\n");
      const xDir = linAlg.createZeroMatrix(3, 1).loadMatrix(earth()!.orientation.t.subR(camMat.t.copy()));
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
        0, 0, 0, 1
      ]);
      addMeteorite(new Meteorite(orbit, radius, camPos));
    }
  });
  document.addEventListener("pointerlockchange", () => {
    controlsEnabled = document.pointerLockElement === drawCanvas;
  }, false);

  let P: mat4 | undefined, O: mat4 | undefined;
  let C: mat4 | undefined, V: mat4 | undefined;

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
        const roll = keyRoll();
        if (isLightModifierPressed())
          lightPos.addL(offset);
        else if (camMat != undefined) {
          camMat.t.addL(linAlg.mmulR(camMat.M, offset));
          const innerRot = linAlg.mmulL(linAlg.ThreeD.rotateAffineX(mouseY()), linAlg.mmulL(linAlg.ThreeD.rotateAffineY(mouseX()), linAlg.ThreeD.rotateAffineZ(roll * 0.02)));
          linAlg.mmulL(camMat.M, innerRot);
        }
        resetMouse();
      }
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      C = camMat.composed();
      V = camMat.inverted();

      let deltaTime = new Date().getTime();
      if (P == undefined || O == undefined || resizeCanvasToDisplaySize(drawCanvas)) {
        gl.viewport(0, 0, drawCanvas.clientWidth, drawCanvas.clientHeight);
        P = getPerspectiveNO(drawCanvas.clientWidth, drawCanvas.clientHeight)
        O = getOrthographicNO(drawCanvas.clientWidth, drawCanvas.clientHeight)
      }
      renderWorld(gl, P, V, C, O);
      const hits = updateWorld(C);
      deltaTime = new Date().getTime() - deltaTime;

      resizeCanvasToDisplaySize(textCanvas);
      renderText(d2, deltaTime, hits);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }
}