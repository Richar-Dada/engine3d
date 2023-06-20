import { Camera, Light, MeshRenderer, Projector } from "..";

enum SystemComponents {
    MeshRenderer = "renderer",
    Camera = "camera",
    Light = "light",
    Projector = "projector",
}

export type Components = MeshRenderer | Camera | Light | Projector;

export { SystemComponents };
