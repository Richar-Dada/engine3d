import { Component } from "./component";

enum LightType {
    Directional = 0,
    Point = 1,
}

class Light extends Component {
    type: LightType;
    color: number[];
    intensity: number;
    range: number;

    constructor(type: LightType) {
        super();
        this.type = type;
        this.color = [1.0, 1.0, 1.0];
        this.intensity = 1.0;
        this.range = 1.0;
    }
}

export { Light, LightType };
