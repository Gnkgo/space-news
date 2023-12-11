import { initTexture } from "./util";

const textures: ((gl: WebGL2RenderingContext) => void)[] = [];
export const EARTH_TEXTURE = addTexture("./earth_texture.bmp");
export const METEORITE_TEXTURE = addTexture("./meteorite_texture.bmp");

function addTexture(url: string): () => WebGLTexture {
    let texture: WebGLTexture;
    textures.push((gl) => texture = initTexture(gl, url));
    return () => texture;
}

export function initTextures(gl: WebGL2RenderingContext) {
    textures.forEach(t => t(gl));
}