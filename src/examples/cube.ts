import { Scene, Cube, MatSolidColor, canvas, Vector3, init } from "../engine";

export const createCubeScene = () => {
    const app = new CubeScene();
    init("canvas", app);
};

class CubeScene {
    _scene: Scene | null = null;
    _cameraNode;
    cube;
    _time = 0;
    constructor() {}

    onInit = () => {
        this.start();
    };

    onResize = (width: number, height: number) => {
        if (this._scene) {
            this._scene.onScreenResize(width, height);
        }
    };

    start = () => {
        this.createWorld();
    };

    createWorld = () => {
        this._scene = new Scene();

        const meshRoot = this._scene.root.addEmptyNode();

        const cubeMesh = Cube.createMesh();
        const material = new MatSolidColor([1, 0, 0]);

        this.cube = meshRoot.addMeshNode(cubeMesh, material);
        this.cube.localPosition.set(0, 0, 0);

        // Add a perspective camera
        this._cameraNode = this._scene.root.addPerspectiveCamera(60, canvas!.width / canvas!.height, 1.0, 1000);
        this._cameraNode.localPosition.set(0, 10, 10);
        this._cameraNode.lookAt(new Vector3(0, 0, 0));
        this._cameraNode.camera.clearColor = [0.2, 0.5, 0.5];
    };

    onUpdate = (dt) => {
        this._time += dt;
        this._scene?.update();

        if (this.cube) {
            //灯光做圆周运动
            let cosv = Math.cos(this._time / 1000);
            let sinv = Math.sin(this._time / 1000);
            let radius = 5;

            this.cube.localPosition.x = radius * cosv * cosv;
            this.cube.localPosition.z = radius * sinv * cosv;
            this.cube.localPosition.y = 1 + radius * (0.5 + 0.5 * sinv);
            this.cube.setTransformDirty();

            this._scene?.render();
        }
    };
}
