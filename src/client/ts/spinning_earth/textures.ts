import { initTexture } from "./util";
import earth_texture from '../../img/earth_texture.png';
import meteorite_texture from '../../img/meteorite_texture.png'
const textures: ((gl: WebGL2RenderingContext) => void)[] = [];
export const EARTH_TEXTURE = addTexture(earth_texture);
export const METEORITE_TEXTURE = addTexture(meteorite_texture);

function addTexture(url: string): () => WebGLTexture {
    let texture: WebGLTexture;
    textures.push((gl) => texture = initTexture(gl, url));
    return () => texture;
}

export function initTextures(gl: WebGL2RenderingContext) {
    textures.forEach(t => t(gl));
}