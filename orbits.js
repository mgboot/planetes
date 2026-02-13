// orbits.js — Compute planet positions from Keplerian orbital elements

const DEG2RAD = Math.PI / 180;

/**
 * Julian date from a JS Date object.
 */
export function julianDate(date) {
    return date.getTime() / 86400000 + 2440587.5;
}

/**
 * Centuries since J2000.0 epoch (JD 2451545.0).
 */
export function centuriesSinceJ2000(jd) {
    return (jd - 2451545.0) / 36525.0;
}

/**
 * Solve Kepler's equation M = E - e*sin(E) for E, given M (radians) and e.
 * Uses Newton-Raphson iteration.
 */
export function solveKepler(M, e, tolerance = 1e-8) {
    // Normalize M to [0, 2π)
    M = M % (2 * Math.PI);
    if (M < 0) M += 2 * Math.PI;

    let E = M + e * Math.sin(M); // initial guess
    for (let i = 0; i < 50; i++) {
        const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
        E -= dE;
        if (Math.abs(dE) < tolerance) break;
    }
    return E;
}

/**
 * Compute heliocentric ecliptic (x, y, z) in AU for a planet at a given Date.
 * Returns { x, y, z } in the ecliptic J2000 frame.
 */
export function computePosition(elements, date) {
    const jd = julianDate(date);
    const T = centuriesSinceJ2000(jd);

    // Current elements
    const a = elements.a + elements.aRate * T;
    const e = elements.e + elements.eRate * T;
    const I = (elements.I + elements.IRate * T) * DEG2RAD;
    const L = (elements.L + elements.LRate * T) * DEG2RAD;
    const wBar = (elements.wBar + elements.wBarRate * T) * DEG2RAD;
    const Omega = (elements.Omega + elements.OmegaRate * T) * DEG2RAD;

    // Argument of perihelion and mean anomaly
    const omega = wBar - Omega;
    const M = L - wBar;

    // Solve Kepler's equation
    const E = solveKepler(M, e);

    // Heliocentric coords in orbital plane
    const xPrime = a * (Math.cos(E) - e);
    const yPrime = a * Math.sqrt(1 - e * e) * Math.sin(E);

    // Rotate to ecliptic J2000
    const cosOmega = Math.cos(Omega);
    const sinOmega = Math.sin(Omega);
    const cosI = Math.cos(I);
    const sinI = Math.sin(I);
    const cosW = Math.cos(omega);
    const sinW = Math.sin(omega);

    const x = (cosOmega * cosW - sinOmega * sinW * cosI) * xPrime +
              (-cosOmega * sinW - sinOmega * cosW * cosI) * yPrime;
    const y = (sinOmega * cosW + cosOmega * sinW * cosI) * xPrime +
              (-sinOmega * sinW + cosOmega * cosW * cosI) * yPrime;
    const z = (sinW * sinI) * xPrime + (cosW * sinI) * yPrime;

    return { x, y, z };
}

/**
 * Compute an array of positions tracing the full orbit path (for rendering).
 * Returns array of { x, y, z } in AU.
 */
export function computeOrbitPath(elements, segments = 128) {
    const jd = julianDate(new Date());
    const T = centuriesSinceJ2000(jd);

    const a = elements.a + elements.aRate * T;
    const e = elements.e + elements.eRate * T;
    const I = (elements.I + elements.IRate * T) * DEG2RAD;
    const wBar = (elements.wBar + elements.wBarRate * T) * DEG2RAD;
    const Omega = (elements.Omega + elements.OmegaRate * T) * DEG2RAD;
    const omega = wBar - Omega;

    const cosOmega = Math.cos(Omega);
    const sinOmega = Math.sin(Omega);
    const cosI = Math.cos(I);
    const sinI = Math.sin(I);
    const cosW = Math.cos(omega);
    const sinW = Math.sin(omega);

    const points = [];
    for (let i = 0; i <= segments; i++) {
        const E = (2 * Math.PI * i) / segments;
        const xPrime = a * (Math.cos(E) - e);
        const yPrime = a * Math.sqrt(1 - e * e) * Math.sin(E);

        const x = (cosOmega * cosW - sinOmega * sinW * cosI) * xPrime +
                  (-cosOmega * sinW - sinOmega * cosW * cosI) * yPrime;
        const y = (sinOmega * cosW + cosOmega * sinW * cosI) * xPrime +
                  (-sinOmega * sinW + cosOmega * cosW * cosI) * yPrime;
        const z = (sinW * sinI) * xPrime + (cosW * sinI) * yPrime;

        points.push({ x, y, z });
    }
    return points;
}
