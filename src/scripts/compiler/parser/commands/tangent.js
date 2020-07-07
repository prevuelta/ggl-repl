import React from 'react';
import { getTangents, getStartPosition } from '../../../util';
import { Cross } from '../../../workspace/components/overlayHelperShapes';
import { tokenNames } from '../../../compiler/lexer/commands';
const { TANGENT } = tokenNames;

function getTangents2Circ(c1, r1, c2, r2) {
  const d_sq = (c1.x - c2.x) * (c1.x - c2.x) + (c1.y - c2.y) * (c1.y - c2.y);
  if (d_sq <= (r1 - r2) * (r1 - r2)) return;

  const d = Math.sqrt(d_sq);
  const vx = (c2.x - c1.x) / d;
  const vy = (c2.y - c1.y) / d;

  const res = [];

  for (let sign1 = 1; sign1 >= -1; sign1 -= 2) {
    const c = (r1 - sign1 * r2) / d;
    if (c ** 2 > 1.0) continue;
    const h = Math.sqrt(Math.max(0, 1.0 - c ** 2));

    for (let sign2 = 1; sign2 >= -1; sign2 -= 2) {
      const nx = vx * c - sign2 * h * vy;
      const ny = vy * c + sign2 * h * vx;

      const a = [];
      a[0] = c1.x + r1 * nx;
      a[1] = c1.y + r1 * ny;
      a[2] = c2.x + sign1 * r2 * nx;
      a[3] = c2.y + sign1 * r2 * ny;
      res.push(a);
    }
  }
  return res;
}

export default ({ args }, { nextToken, prevToken, currentLocation }) => {
  const nextIsTangent = nextToken && nextToken.name === TANGENT;
  console.log('Context', nextIsTangent, prevToken, nextToken, currentLocation);

  // Tangent
  const [centerX, centerY, radius, flag1, flag2, sweep, largeArcFlag] = args;

  if (!centerX || !centerY || isNaN(radius)) {
    return { str: '', helpers: [], end: currentLocation };
  }

  const center = { x: centerX, y: centerY };

  let end = currentLocation;
  let tangents;

  if (!nextIsTangent) {
    end = getStartPosition(nextToken);
  } else {
    tangents = getTangents2Circ(
      center,
      radius,
      { x: nextToken.args[0], y: nextToken.args[1] },
      nextToken.args[2]
    );
    if (tangents.length) {
      end = {
        x: tangents[flag1][0],
        y: tangents[flag1][1],
      };
    }
  }

  if (
    !nextIsTangent &&
    (!nextToken || !prevToken || !end || !currentLocation)
  ) {
    return { str: '', helpers: [], end };
  }

  console.log(
    'Tangent',
    center,
    end,
    currentLocation,
    radius,
    'Context',
    prevToken,
    nextToken
  );

  console.log('Mult tangents', tangents);

  const t1 = getTangents(center, currentLocation, radius, flag1);
  const t2 = getTangents(center, end, radius, flag2);

  const arcString = `L ${t1.x} ${t1.y} A ${radius} ${radius} 0 ${sweep} ${largeArcFlag} ${t2.x} ${t2.y}`;
  const string = `${arcString} L ${t2.x} ${t2.y} ${end.x} ${end.y}`;
  const helpers = [
    tangents &&
      tangents.map(tangent => (
        <>
          <Cross x={tangent[0]} y={tangent[1]} />
          <Cross x={tangent[2]} y={tangent[3]} />
        </>
      )),
    <circle
      cx={center.x}
      cy={center.y}
      r={radius}
      fill="none"
      stroke="red"
      strokeWidth="1"
      opacity="0.5"
    />,
    <Cross x={center.x} y={center.y} size={10} />,
    <Cross x={t1.x} y={t1.y} size={10} color={'blue'} />,
  ];
  // <Cross x={t2.x} y={t2.y} size={10} color={'blue'} />,
  // <Cross x={end.x} y={end.y} size={10} color={'blue'} />,

  return {
    str: string,
    end,
    helpers,
  };
};
