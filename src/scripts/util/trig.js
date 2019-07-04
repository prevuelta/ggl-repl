
function getMid (p1, p2) {
  return [(p1.x + p2.x) / 2, (p1.y + p2.y) / 2];
}
function getDistance (p1, p2) {
  return getSize(p1.y - p2.y, p1.x - p2.x);
}
function getSize (adj, opp, hyp) {
  if(!isNaN(adj) & !isNaN(hyp)) {
    return Math.sqrt(hyp*hyp - adj*adj);
  } else if(!isNaN(adj) & !isNaN(opp)) {
    return Math.sqrt(opp*opp + adj*adj);
  } else if(!isNaN(opp) & !isNaN(hyp)) {
    return Math.sqrt(hyp*hyp - opp*opp);
  }
  console.warn("Invalid values passed to getSize");
}
function getAngle (p1, p2) {
  var adj = getDistance(p1, {x: p2.x, y: p1.y});
  var hyp = getDistance(p1, p2);
  return (Math.PI / 2) - Math.acos( adj / hyp );

}
function radToDeg (radians) {
  return radians / (Math.PI / 180)
}
function degToRad (degrees) {
  return degrees * (Math.PI / 180);
}

function polarToCartesian(center, radius, angle) {
    return {
      x: Math.cos(angle) * radius + center.x,
      y: Math.sin(angle) * radius + center.y
    };
}

export {
  getMid,
  getDistance,
  getSize,
  getAngle,
  radToDeg,
  degToRad,
  polarToCartesian
}
