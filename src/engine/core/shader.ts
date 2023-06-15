import { gl } from "./gl";

class UniformInfo {
  constructor(name, location, type, size, isArray) {
    this.name = name;
    this.location = location; //WebGLUniformLocation
    this.type = type;
    this.size = size;
    this.isArray = isArray;
  }
}

class Shader {
  constructor() {
    this.program = null;
    this._semanticToAttribName = {}; // {[semantic:string]:string}
    this._attributes = {}; // {[name:string]:number}
    this._uniforms = {}; // {[name:string]:WebGLUniformLocation}
  }

  mapAttributeSemantic(semantic, attribName) {
    this._semanticToAttribName[semantic] = attribName;
  }

  //set the semantic to attribute map from a list of {'semantic':semanticName, 'name':attributeName}
  setAttributesMap(attributesMap) {
    for (let attr of attributesMap) {
      let semantic = attr["semantic"];
      let name = attr["name"];
      this.mapAttributeSemantic(semantic, name);
    }
  }

  create(vshader, fshader) {
    let vertexShader = this.loadShader(gl.VERTEX_SHADER, vshader);
    let fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fshader);
    if (!vertexShader || !fragmentShader) {
      return false;
    }

    // Create a program object
    this.program = gl.createProgram();
    if (!this.program) {
      return false;
    }

    // Attach the shader objects
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);

    // Link the program object
    gl.linkProgram(this.program);

    // Check the result of linking
    let linked = gl.getProgramParameter(this.program, gl.LINK_STATUS);
    if (!linked) {
      let error = gl.getProgramInfoLog(this.program);
      console.log("Failed to link program: " + error);
      gl.deleteProgram(this.program);
      gl.deleteShader(fragmentShader);
      gl.deleteShader(vertexShader);
      this.program = null;
      return false;
    }

    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);

    this.findoutAttributes();
    this.findoutUniforms();

    return true;
  }

  destroy() {
    gl.deleteProgram(this.program);
    this.program = null;
  }

  loadShader(type, source) {
    let shader = gl.createShader(type);
    if (shader == null) {
      console.log("unable to create shader");
      return null;
    }

    // Set the shader program
    gl.shaderSource(shader, source);

    // Compile the shader
    gl.compileShader(shader);

    // Check the result of compilation
    let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      let error = gl.getShaderInfoLog(shader);
      console.error("Failed to compile shader: " + error);
      console.log("---------shader source----------");
      console.log(source);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  findoutAttributes() {
    let attributeCount = gl.getProgramParameter(
      this.program,
      gl.ACTIVE_ATTRIBUTES
    );
    for (let i = 0; i < attributeCount; ++i) {
      let info = gl.getActiveAttrib(this.program, i);
      if (!info) {
        break;
      }

      this._attributes[info.name] = gl.getAttribLocation(
        this.program,
        info.name
      );
    }

    console.log("attributes", this._attributes);
  }

  findoutUniforms() {
    let uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; ++i) {
      let info = gl.getActiveUniform(this.program, i);
      if (!info) {
        break;
      }

      let location = gl.getUniformLocation(this.program, info.name);
      let isArray = info.size > 1 && info.name.substr(-3) === "[0]";
      let uniformInfo = new UniformInfo(
        info.name,
        location,
        info.type,
        info.size,
        isArray
      );
      this._uniforms[info.name] = uniformInfo;
    }

    console.log("uniforms", this._uniforms);
  }

  hasUniform(name) {
    return this._uniforms[name] != null;
  }

  setUniformSafe(name, value) {
    if (this.hasUniform(name)) {
      this.setUniform(name, value);
    }
  }

  setUniform(name, value) {
    let info = this._uniforms[name];
    if (!info) {
      console.error("can not find uniform named " + name);
      return;
    }
    switch (info.type) {
      case gl.INT: {
        if (info.isArray) {
          gl.uniform1iv(info.location, value);
        } else {
          gl.uniform1i(info.location, value);
        }
        break;
      }
      case gl.FLOAT: {
        if (info.isArray) {
          gl.uniform1fv(info.location, value);
        } else {
          gl.uniform1f(info.location, value);
        }
        break;
      }
      case gl.FLOAT_VEC2: {
        gl.uniform2fv(info.location, value);
        break;
      }
      case gl.FLOAT_VEC3: {
        gl.uniform3fv(info.location, value);
        break;
      }
      case gl.FLOAT_VEC4: {
        gl.uniform4fv(info.location, value);
        break;
      }
      case gl.FLOAT_MAT3: {
        gl.uniformMatrix3fv(info.location, false, value);
        break;
      }
      case gl.FLOAT_MAT4: {
        gl.uniformMatrix4fv(info.location, false, value);
        break;
      }
      case gl.SAMPLER_2D: {
        gl.uniform1i(info.location, value);
        break;
      }
      default: {
        console.error("uniform type not support", info.type);
        break;
      }
    }
  }

  getAttributeLocation(semantic) {
    let name = this._semanticToAttribName[semantic];
    if (name) {
      let location = this._attributes[name];
      return location;
    } else {
      //console.warn('Shader: can not find attribute for semantic '+semantic);
      return -1;
    }
  }

  use() {
    if (this.program) {
      gl.useProgram(this.program);
    }
  }
}

export { Shader };
