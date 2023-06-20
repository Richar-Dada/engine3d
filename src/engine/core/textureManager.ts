import { Texture2D } from "./texture";
import { assetManager } from "../assets/assetManager";

class SharedTexture {
    texture;
    refCount;
    constructor(texture: Texture2D) {
        this.texture = texture;
        this.refCount = 1;
    }
}

//TODO: LRU or LFU cache, if the GPU texture memory is out of some limit, remove from GPU and cache data in RAM

class TextureManager {
    _defaultTexture: Texture2D | null = null;
    _defaultBumpTexture: Texture2D | null = null;
    _textures: Record<string, SharedTexture>;
    constructor() {
        this._textures = {};
    }

    getTexture(texturePath: string) {
        if (this._textures[texturePath] == null) {
            let texture = new Texture2D();
            texture.create(assetManager.getAsset(texturePath).data);
            this._textures[texturePath] = new SharedTexture(texture);
        } else {
            this._textures[texturePath].refCount++;
        }

        return this._textures[texturePath].texture;
    }

    releaseTexture(texturePath: string) {
        if (this._textures[texturePath] == null) {
            console.error("releaseTexture: texture not found: " + texturePath);
        } else {
            this._textures[texturePath].refCount--;
            if (this._textures[texturePath].refCount < 1) {
                this._textures[texturePath].texture.destroy();
                this._textures[texturePath] = null;
                delete this._textures[texturePath];
            }
        }
    }

    getDefaultTexture() {
        if (this._defaultTexture == null) {
            this._defaultTexture = new Texture2D();
            this._defaultTexture.createDefault();
        }
        return this._defaultTexture;
    }

    getDefaultBumpTexture() {
        if (this._defaultBumpTexture == null) {
            this._defaultBumpTexture = new Texture2D();
            this._defaultBumpTexture.createDefaultBump();
        }
        return this._defaultBumpTexture;
    }
}

let textureManager = new TextureManager();

export { textureManager };
