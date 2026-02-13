// planets.js — Solar system body data and J2000 Keplerian orbital elements
// Sources: NASA JPL, "Keplerian Elements for Approximate Positions of the Major Planets"
// https://ssd.jpl.nasa.gov/planets/approx_pos.html
//
// Elements valid for 1800 AD – 2050 AD
// a  = semi-major axis (AU)
// e  = eccentricity
// I  = inclination (deg)
// L  = mean longitude (deg)
// wBar = longitude of perihelion (deg)
// Omega = longitude of ascending node (deg)
// Rates are per Julian century.

export const AU_KM = 1.496e8; // 1 AU in km
export const G_REAL = 6.674e-11; // m³ kg⁻¹ s⁻²
export const SOLAR_MASS = 1.989e30; // kg

// Gravitational parameter GM in AU³/day² for simulation
// GM_sun in m³/s² = 1.327e20, convert to AU³/day² :
// 1 AU = 1.496e11 m, 1 day = 86400 s
// GM_sun_AU_day2 = 1.327e20 / (1.496e11)³ * (86400)² ≈ 2.959e-4
export const GM_SUN_AU3_DAY2 = 2.9591e-4;

export const SUN = {
    name: 'Sun',
    mass: SOLAR_MASS,
    GM_AU3_day2: GM_SUN_AU3_DAY2,
    radiusKm: 696340,
    color: 0xffdd44,
    emissive: 0xffaa00,
};

// Each planet: orbital elements at J2000 + rates per century, plus physical data
export const PLANETS = [
    {
        name: 'Mercury',
        mass: 3.301e23,
        radiusKm: 2439.7,
        color: 0xaaaaaa,
        elements: {
            a: 0.38709927, aRate: 0.00000037,
            e: 0.20563593, eRate: 0.00001906,
            I: 7.00497902, IRate: -0.00594749,
            L: 252.25032350, LRate: 149472.67411175,
            wBar: 77.45779628, wBarRate: 0.16047689,
            Omega: 48.33076593, OmegaRate: -0.12534081,
        }
    },
    {
        name: 'Venus',
        mass: 4.867e24,
        radiusKm: 6051.8,
        color: 0xe8cda0,
        elements: {
            a: 0.72333566, aRate: 0.00000390,
            e: 0.00677672, eRate: -0.00004107,
            I: 3.39467605, IRate: -0.00078890,
            L: 181.97909950, LRate: 58517.81538729,
            wBar: 131.60246718, wBarRate: 0.00268329,
            Omega: 76.67984255, OmegaRate: -0.27769418,
        }
    },
    {
        name: 'Earth',
        mass: 5.972e24,
        radiusKm: 6371,
        color: 0x4488ff,
        elements: {
            a: 1.00000261, aRate: 0.00000562,
            e: 0.01671123, eRate: -0.00004392,
            I: -0.00001531, IRate: -0.01294668,
            L: 100.46457166, LRate: 35999.37244981,
            wBar: 102.93768193, wBarRate: 0.32327364,
            Omega: 0.0, OmegaRate: 0.0,
        }
    },
    {
        name: 'Mars',
        mass: 6.417e23,
        radiusKm: 3389.5,
        color: 0xcc4422,
        elements: {
            a: 1.52371034, aRate: 0.00001847,
            e: 0.09339410, eRate: 0.00007882,
            I: 1.84969142, IRate: -0.00813131,
            L: -4.55343205, LRate: 19140.30268499,
            wBar: -23.94362959, wBarRate: 0.44441088,
            Omega: 49.55953891, OmegaRate: -0.29257343,
        }
    },
    {
        name: 'Jupiter',
        mass: 1.898e27,
        radiusKm: 69911,
        color: 0xddaa77,
        elements: {
            a: 5.20288700, aRate: -0.00011607,
            e: 0.04838624, eRate: -0.00013253,
            I: 1.30439695, IRate: -0.00183714,
            L: 34.39644051, LRate: 3034.74612775,
            wBar: 14.72847983, wBarRate: 0.21252668,
            Omega: 100.47390909, OmegaRate: 0.20469106,
        }
    },
    {
        name: 'Saturn',
        mass: 5.683e26,
        radiusKm: 58232,
        color: 0xeecc88,
        elements: {
            a: 9.53667594, aRate: -0.00125060,
            e: 0.05386179, eRate: -0.00050991,
            I: 2.48599187, IRate: 0.00193609,
            L: 49.95424423, LRate: 1222.49362201,
            wBar: 92.59887831, wBarRate: -0.41897216,
            Omega: 113.66242448, OmegaRate: -0.28867794,
        }
    },
    {
        name: 'Uranus',
        mass: 8.681e25,
        radiusKm: 25362,
        color: 0x88ccee,
        elements: {
            a: 19.18916464, aRate: -0.00196176,
            e: 0.04725744, eRate: -0.00004397,
            I: 0.77263783, IRate: -0.00242939,
            L: 313.23810451, LRate: 428.48202785,
            wBar: 170.95427630, wBarRate: 0.40805281,
            Omega: 74.01692503, OmegaRate: 0.04240589,
        }
    },
    {
        name: 'Neptune',
        mass: 1.024e26,
        radiusKm: 24622,
        color: 0x4466ff,
        elements: {
            a: 30.06992276, aRate: 0.00026291,
            e: 0.00859048, eRate: 0.00005105,
            I: 1.77004347, IRate: 0.00035372,
            L: -55.12002969, LRate: 218.45945325,
            wBar: 44.96476227, wBarRate: -0.32241464,
            Omega: 131.78422574, OmegaRate: -0.00508664,
        }
    },
    {
        name: 'Pluto',
        mass: 1.303e22,
        radiusKm: 1188.3,
        color: 0xccbbaa,
        elements: {
            a: 39.48211675, aRate: -0.00031596,
            e: 0.24882730, eRate: 0.00005170,
            I: 17.14001206, IRate: 0.00004818,
            L: 238.92903833, LRate: 145.20780515,
            wBar: 224.06891629, wBarRate: -0.04062942,
            Omega: 110.30393684, OmegaRate: -0.01183482,
        }
    },
];

// GM values in AU³/day² (derived from mass ratios to Sun)
PLANETS.forEach(p => {
    p.GM_AU3_day2 = GM_SUN_AU3_DAY2 * (p.mass / SOLAR_MASS);
});
