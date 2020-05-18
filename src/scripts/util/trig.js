export function getMid(p1, p2) {
  return [(p1.x + p2.x) / 2, (p1.y + p2.y) / 2];
}

export function getDistance(p1, p2) {
  return getSide(p1.y - p2.y, p1.x - p2.x);
}

export function getSide(adj, opp, hyp) {
  if (!isNaN(adj) & !isNaN(hyp)) {
    return Math.sqrt(hyp * hyp - adj * adj);
  } else if (!isNaN(adj) & !isNaN(opp)) {
    return Math.sqrt(opp * opp + adj * adj);
  } else if (!isNaN(opp) & !isNaN(hyp)) {
    return Math.sqrt(hyp * hyp - opp * opp);
  }
  console.warn('Invalid values passed to getSide');
}

export function soh(angle, opp, hyp) {
  if (opp) {
    return opp / Math.sin(angle);
  } else {
    return hyp * Math.sin(angle);
  }
}

export function cah(angle, adj, hyp) {
  if (adj) {
    return adj / Math.cos(angle);
  } else {
    return hyp * Math.cos(angle);
  }
}

export function toa(angle, opp, adj) {
  if (opp) {
    return opp / Math.tan(angle);
  } else {
    return adj * Math.tan(angle);
  }
}

export function getTri(adj, opp, hyp) {
  if (isNaN(opp) || isNaN(opp) || isNaN(hyp)) {
    console.warn('Invalid values passed to getSide');
  }

  if (!isNaN(adj) & !isNaN(hyp)) {
    opp = Math.sqrt(hyp * hyp - adj * adj);
  } else if (!isNaN(adj) & !isNaN(opp)) {
    hyp = Math.sqrt(opp * opp + adj * adj);
  } else if (!isNaN(opp) & !isNaN(hyp)) {
    adj = Math.sqrt(hyp * hyp - opp * opp);
  }

  return { adj, opp, hyp };
}

export function addVector(v1, v2) {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}

export function getTangents(center, point, radius, flag = true) {
  // find tangents
  const dx = center.x - point.x;
  const dy = center.y - point.y;
  const dd = Math.sqrt(dx * dx + dy * dy);
  const a = Math.asin(radius / dd);
  const b = Math.atan2(dy, dx);

  let t = b - a;
  const t1 = {
    x: center.x + radius * Math.sin(t),
    y: center.y + radius * -Math.cos(t),
  };

  t = b + a;
  const t2 = {
    x: center.x + radius * -Math.sin(t),
    y: center.y + radius * Math.cos(t),
  };

  return flag ? t1 : t2;
}

export function getAngle(p1, p2) {
  let angle = Math.atan2(p1.y - p2.y, p1.x - p2.x);
  return angle;
}

export function radToDeg(radians) {
  return radians / (Math.PI / 180);
}

export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

export function polarToCartesian(center, radius, angle) {
  return {
    x: Math.cos(angle) * radius + center.x,
    y: Math.sin(angle) * radius + center.y,
  };
}
