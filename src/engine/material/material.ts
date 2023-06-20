import { RenderPass, LightMode } from "./renderPass";
import { Shader } from "../core/shader";
import { Mesh, Vector3 } from "..";

let SystemUniforms = {
    MvpMatrix: "u_mvpMatrix",
    Object2World: "u_object2World",
    World2Object: "u_world2Object", //normal matrix请使用World2Object，然后在shader里面矩阵放右边即可: vec3 worldNormal = normalize(a_Normal * mat3(u_world2Object));
    WorldCameraPos: "u_worldCameraPos",
    WorldLightPos: "u_worldLightPos",
    LightColor: "u_LightColor",
    SceneAmbient: "u_ambient",
};

let vs_errorReplace = `
attribute vec4 a_Position;
uniform mat4 u_mvpMatrix;
void main(){
    gl_Position = u_mvpMatrix * a_Position;
}
`;

let fs_errorReplace = `
#ifdef GL_ES
precision mediump float;
#endif
void main(){
    gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
}
`;

class Material {
    renderPasses: RenderPass[];
    constructor() {
        this.renderPasses = [];
    }

    addRenderPass(shader: Shader, lightMode = LightMode.None) {
        let pass = new RenderPass(lightMode);
        pass.shader = shader;
        pass.index = this.renderPasses.length;
        this.renderPasses.push(pass);
        return pass;
    }

    destroy() {
        for (let pass of this.renderPasses) {
            pass.destroy();
        }
        this.renderPasses = [];
    }

    //Override
    get systemUniforms() {
        return [SystemUniforms.MvpMatrix];
    }

    //自动设置system uniforms (根据systemUniforms的返回值)
    setSysUniformValues(pass: RenderPass, context: Record<string, Float32Array | Vector3 | number[]>) {
        let systemUniforms = this.systemUniforms;
        for (let sysu of systemUniforms) {
            if (pass.shader.hasUniform(sysu)) {
                //pass不一定使用材质所有的uniform，所以要判断一下
                pass.shader.setUniform(sysu, context[sysu]);
            }
        }
    }

    //Override
    //材质子类中手动设置uniform，需要重载
    setCustomUniformValues(pass: RenderPass) {}

    //Override
    //渲染pass后的清理工作
    afterRender(pass: RenderPass) {}

    renderPass(mesh: Mesh, context: Record<string, Float32Array | Vector3 | number[]>, pass: RenderPass) {
        pass.shader.use();
        this.setSysUniformValues(pass, context);
        this.setCustomUniformValues(pass);
        mesh.render(pass.shader);
        this.afterRender(pass);
    }

    static createShader(vs: string, fs: string, attributesMap: { semantic: string; name: string }[]) {
        let shader = new Shader();
        if (!shader.create(vs, fs)) {
            console.log("Failed to initialize shaders");
            //Set to a default error replace shader
            shader.create(vs_errorReplace, fs_errorReplace);
        }
        shader.setAttributesMap(attributesMap);
        return shader;
    }
}

export { SystemUniforms, Material };
