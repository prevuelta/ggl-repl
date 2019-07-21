function getMid(p1, p2) {
    return [(p1.x + p2.x) / 2, (p1.y + p2.y) / 2];
}
function getDistance(p1, p2) {
    return getSide(p1.y - p2.y, p1.x - p2.x);
}
function getSide(adj, opp, hyp) {
    if (!isNaN(adj) & !isNaN(hyp)) {
        return Math.sqrt(hyp * hyp - adj * adj);
    } else if (!isNaN(adj) & !isNaN(opp)) {
        return Math.sqrt(opp * opp + adj * adj);
    } else if (!isNaN(opp) & !isNaN(hyp)) {
        return Math.sqrt(hyp * hyp - opp * opp);
    }
    console.warn('Invalid values passed to getSide');
}

export function getCross (p1, p2) {
  return (p1.x * p2.y) -(p1.y * p2.x)
}

export function addVector(v1, v2) {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}


function getAngle(p1, p2) {
    let angle = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    return angle;
}

function radToDeg(radians) {
    return radians / (Math.PI / 180);
}
function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

function polarToCartesian(center, radius, angle) {
    return {
        x: Math.cos(angle) * radius + center.x,
        y: Math.sin(angle) * radius + center.y,
    };
}

const { PI } = Math;
const HALF_PI = PI / 2;
const TWO_PI = PI * 2;

export {
    getMid,
    getDistance,
    getSide,
    getAngle,
    radToDeg,
    degToRad,
    polarToCartesian,
    HALF_PI,
    PI,
    TWO_PI,
};
