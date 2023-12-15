import { vec4 } from "./math";

function initShader(gl: WebGL2RenderingContext, vsSource: string, fsSource: string): WebGLProgram {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)!;
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)!;
    const shaderProgram = gl.createProgram()!;
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
            `Unable to initialize the shader program: ${gl.getProgramInfoLog(
                shaderProgram,
            )}`,
        );
        while (true);
    }
    return shaderProgram;
}

function loadShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | undefined {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
        );
        gl.deleteShader(shader);
        return undefined;
    }
    return shader;
}

export function prepareShader(gl: WebGL2RenderingContext, shader: WebGLProgram, lightPos?: vec4) {
    gl.useProgram(shader);
    if (lightPos != undefined) {
        const uLightPos = gl.getUniformLocation(shader, 'uLightPos');
        gl.uniform4fv(uLightPos, new Float32Array(lightPos.data));
    }
}

const fsSourceEntity = /*glsl*/ `#version 300 es
    in lowp vec4 vColor;
    in highp vec2 vTextureCoord;
    in lowp float light;

    out lowp vec4 fColor;

    uniform lowp float uUseTexture;
    uniform sampler2D uSampler;

    void main(void) {
        fColor = uUseTexture * texture(uSampler, vTextureCoord) + (1.0 - uUseTexture) * vColor;
        lowp float alpha = fColor[3];
        fColor = clamp(light * fColor, 0.0, 1.0);
        fColor[3] = alpha;
    } 
`;
const vsSourceEntity = /*glsl*/ `#version 300 es
    in vec4 aVertexPosition;
    in vec4 aVertexColor;
    in vec3 aVertexNormal;
    in vec2 aTextureCoord;

    uniform mat4 uModelMatrix;
    uniform mat4 uModelNormalMatrix;
    uniform mat4 uPerspectiveMatrix;
    uniform vec4 uLightPos;

    out lowp vec4 vColor;
    out highp vec2 vTextureCoord;
    out lowp float light;

    float computeDiffuseIntens(in vec4 position, in vec3 normal, in vec4 lightPos) {
        // since the lightPos is in world coordinates, need to transform the vertex position and normal first
        position = uModelMatrix * position;
        normal = (uModelNormalMatrix * vec4(normal, 0.0)).xyz;
        normal = normalize(normal);    
        
        // compute the light direction
        vec3 vecToLight = normalize(lightPos.xyz - position.xyz);
        
        // the intensity is proportional to the angle between the surface and the light direction
        float diffuseIntensity = dot(normal, vecToLight);
        diffuseIntensity = 0.6 * clamp(diffuseIntensity, 0.0, 1.0);
        
        return diffuseIntensity;
    }

    void main(void) {
        // transform the vertex position from object space to camera space 
        gl_Position = uPerspectiveMatrix * aVertexPosition;

        // === very simplistic lighting model ===
        float ambientIntensity = 0.4; // controls how much ambient light there is in the scene, some value between 0.0 and 1.0
        float diffuseIntensity = computeDiffuseIntens(aVertexPosition, aVertexNormal, uLightPos); // accounts for direct light
        light = diffuseIntensity + ambientIntensity;
        vColor = aVertexColor;
        vTextureCoord = aTextureCoord;
    }
`;

const fsSourceParticle = /*glsl*/ `#version 300 es
    in lowp vec4 vColor;
    out lowp vec4 fColor;

    void main(void) {
        fColor = vColor;
    }
`;
const vsSourceParticle = /*glsl*/ `#version 300 es
    in vec4 aVertexPosition;
    in vec4 aVertexColor;

    uniform mat4 uModelMatrix;
    uniform mat4 uPerspectiveMatrix;
    uniform float uBrightness;

    out lowp vec4 vColor;

    void main(void) {
        gl_Position = uPerspectiveMatrix * aVertexPosition;
        vColor = vec4(uBrightness * aVertexColor.xyz, 1);
    }
`;

const fsSourceSkybox = /*glsl*/ `#version 300 es
    in lowp vec4 vColor;
    out lowp vec4 fColor;

    void main(void) {
        fColor = vColor;
    }
`;
const vsSourceSkybox = /*glsl*/ `#version 300 es
    in vec4 aVertexPosition;
    in vec4 aVertexColor;

    uniform mat4 uModelMatrix;
    uniform mat4 uPerspectiveMatrix;
    uniform float uBrightness;

    out lowp vec4 vColor;

    void main(void) {
        vec4 pos = uPerspectiveMatrix * aVertexPosition;
        pos.xy /= pos.w;
        pos.z = 1.0;
        pos.w = 1.0;
        gl_Position = pos;
        vColor = vec4(uBrightness * aVertexColor.xyz, 1);
    }
`;

const fsSourceHUD = /*glsl*/ `#version 300 es
    in lowp vec4 vColor;
    out lowp vec4 fColor;

    void main(void) {
        fColor = vColor;
    }
`;
const vsSourceHUD = /*glsl*/ `#version 300 es
    in vec4 aVertexPosition;
    in vec4 aVertexColor;

    uniform mat4 uModelMatrix;
    uniform mat4 uPerspectiveMatrix;

    out lowp vec4 vColor;

    void main(void) {
        vec4 pos = uPerspectiveMatrix * aVertexPosition;
        pos.xy /= pos.w;
        pos.z = 0.0;
        pos.w = 1.0;
        gl_Position = pos;
        vColor = aVertexColor;
    }
`;

const shaders: ((gl: WebGL2RenderingContext) => void)[] = [];
export const ENTITY_SHADER = addShader(vsSourceEntity, fsSourceEntity);
export const PARTICLE_SHADER = addShader(vsSourceParticle, fsSourceParticle);
export const SKYBOX_SHADER = addShader(vsSourceSkybox, fsSourceSkybox);
export const HUD_SHADER = addShader(vsSourceHUD, fsSourceHUD);

function addShader(vsSource: string, fsSource: string): () => WebGLTexture {
    let shader: WebGLProgram;
    shaders.push((gl) => shader = initShader(gl, vsSource, fsSource));
    return () => shader;
}

export function initShaders(gl: WebGL2RenderingContext) {
    shaders.forEach(s => s(gl));
}