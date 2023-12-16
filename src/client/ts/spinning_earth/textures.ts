import { initTexture } from "./util";
import earth_texture from '../../img/earth_texture.png';
import meteorite_texture from '../../img/meteorite_texture.png';
import sun_texture from '../../img/sun.png';
import background_texture from '../../img/spinning_earth_background.png';

const textures: ((gl: WebGL2RenderingContext) => void)[] = [];
export const EARTH_TEXTURE = addTexture(earth_texture);
export const METEORITE_TEXTURE = addTexture(meteorite_texture);
export const SUN_TEXTURE = addTexture(sun_texture);
export const BACKGROUND_TEXTURE = addTexture(background_texture);

function addTexture(url: string): () => WebGLTexture | undefined {
    let texture: WebGLTexture | undefined;
    textures.push((gl) => texture = initTexture(gl, url));
    return () => texture;
}

export function initTextures(gl: WebGL2RenderingContext) {
    textures.forEach(t => t(gl));
}