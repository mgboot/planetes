// hud.js — Heads-up display updates
import { getSpeedKmS, getGravityMagnitude, getPerBodyGravity } from './spacecraft.js';

const speedEl = document.getElementById('speed-display');
const totalGravEl = document.getElementById('total-gravity-display');
const gravityTbody = document.querySelector('#gravity-table tbody');
const timeWarpEl = document.getElementById('time-warp-display');

function formatNumber(n, decimals = 2) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return n.toFixed(decimals);
}

function formatDistance(distAU, distKm) {
    if (distKm < 1e6) return formatNumber(distKm) + ' km';
    return distAU.toFixed(3) + ' AU';
}

function formatGravity(ms2) {
    if (ms2 >= 0.01) return ms2.toFixed(3) + ' m/s²';
    return ms2.toExponential(2) + ' m/s²';
}

export function updateHUD(spacecraft, bodies, timeWarp) {
    const speed = getSpeedKmS(spacecraft);
    const totalGrav = getGravityMagnitude(spacecraft, bodies);
    const perBody = getPerBodyGravity(spacecraft, bodies);

    speedEl.textContent = `Speed: ${formatNumber(speed)} km/s`;
    totalGravEl.textContent = `Net gravity: ${formatGravity(totalGrav)}`;

    // Show all bodies sorted by strongest gravitational pull
    const allBodies = perBody;

    // Build table rows
    let html = '';
    for (const entry of allBodies) {
        const dist = formatDistance(entry.distanceAU, entry.distanceKm);
        const grav = formatGravity(entry.gravityMs2);
        html += `<tr>
            <td class="body-name">${entry.name}</td>
            <td class="body-dist">${dist}</td>
            <td class="body-grav">${grav}</td>
        </tr>`;
    }
    gravityTbody.innerHTML = html;

    const warpLabels = ['1×', '10×', '100×', '1,000×', '10,000×', '100,000×', '1M×', '10M×'];
    timeWarpEl.textContent = `Time: ${warpLabels[timeWarp] || timeWarp + '×'}`;
}
