class MathUtils {
    Pi: number;
    TwoPi: number;
    HalfPi: number;
    Epsilon: number;
    ZeroEpsilon: number;

    constructor() {
        this.Pi = 3.141592654;
        this.TwoPi = 6.283185307;
        this.HalfPi = 1.570796327;

        this.Epsilon = 0.000001;
        this.ZeroEpsilon = 32.0 * 1.175494351e-38; // Very small epsilon for checking against 0.0f
    }

    degToRad(degree: number) {
        return degree * 0.017453293;
    }

    radToDeg(rad: number) {
        return rad * 57.29577951;
    }

    clamp(f: number, min: number, max: number) {
        if (f < min) f = min;
        else if (f > max) f = max;
        return f;
    }
}

let math = new MathUtils();

export { math };
