import React from 'react';
import { getTangents, getStartPosition } from '../../../util';
import { Cross } from '../../../workspace/components/overlayHelperShapes';

export default ({ args }, { nextToken, prevToken, currentLocation }) => {
  console.log('Context', prevToken, nextToken);
  const end = getStartPosition(nextToken);
  if (!nextToken || !prevToken || !end)
    return { str: '', helpers: [], end: currentLocation };

  // Tangent
  const [
    centerX,
    centerY,
    radius,
    flag1 = 0,
    flag2 = 0,
    sweep = 0,
    largeArcFlag = 0,
  ] = args;

  const center = { x: centerX, y: centerY };

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

  const t1 = getTangents(center, currentLocation, radius, flag1);
  const t2 = getTangents(center, end, radius, flag2);

  const arcString = `L ${t1.x} ${t1.y} A ${radius} ${radius} 0 ${sweep} ${largeArcFlag} ${t2.x} ${t2.y}`;
  const string = `${arcString} L ${t2.x} ${t2.y} ${end.x} ${end.y}`;
  const helpers = (
    <>
      <Cross x={center.x} y={center.y} size={10} />,
      <Cross x={t1.x} y={t1.y} size={10} color={'blue'} />,
      <Cross x={t2.x} y={t2.y} size={10} color={'blue'} />,
      <Cross x={end.x} y={end.y} size={10} color={'blue'} />,
      <circle
        cx={center.x}
        cy={center.y}
        r={radius}
        fill="none"
        stroke="red"
        strokeWidth="1"
        opacity="0.5"
      />
    </>
  );

  return {
    str: string,
    end,
    helpers,
  };
};
