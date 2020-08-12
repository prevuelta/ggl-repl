import React from 'react';
import {
  getAngle,
  TWO_PI,
  PI,
  getDistance,
  polarToCartesian,
} from '../../../util';
import { Cross } from '../../../workspace/components/overlayHelperShapes';
import { getFlags } from '../parserUtil';

const flagHandlers = {
  sweep: {
    key: 's',
    defaultValue: 0,
    value: 1,
  },
  largeArcFlag: {
    key: 'f',
    defaultValue: 0,
    value: 1,
  },
};

function describeArc(start, center, angle, flags) {
  const originalAngle = angle;
  const startAngle = getAngle(start, center);
  angle += startAngle;
  angle = angle % TWO_PI;

  if (originalAngle > 0 && originalAngle < PI) {
    flags.largeArcFlag = flags.largeArcFlag === 0 ? 1 : 0;
  } else if (originalAngle > PI) {
    flags.sweep = flags.sweep === 0 ? 1 : 0;
    flags.largeArcFlag = flags.largeArcFlag === 0 ? 1 : 0;
  } else if (originalAngle < -PI) {
    flags.sweep = flags.sweep === 0 ? 1 : 0;
  }

  if (angle >= PI) {
    // largeArcFlag = largeArcFlag ? 0 : 1;
  }

  console.log('Flags', flags);

  const radius = getDistance(start, center);
  var end = polarToCartesian(center, radius, angle);

  return {
    string: `${start.x} ${start.y} A ${radius} ${radius} 0 ${flags.sweep} ${flags.largeArcFlag} ${end.x} ${end.y}`,
    end,
    start,
    radius,
    center,
  };
}

export default (token, { nextToken, prevToken, currentLocation }) => {
  const [currentX, currentY, angle, ...flagArgs] = token.args;

  const center = {
    x: currentLocation.x + currentX,
    y: currentLocation.y + currentY,
  };

  const flags = getFlags(flagHandlers, flagArgs);

  const arcData = describeArc(currentLocation, center, angle, flags);

  const str = `${!prevToken ? 'M' : 'L'} ${arcData.string}`;

  const helpers = [
    <circle
      cx={arcData.center.x}
      cy={arcData.center.y}
      r={arcData.radius}
      fill="none"
      stroke="red"
      strokeWidth="1"
      opacity="0.5"
    />,
    <Cross x={arcData.center.x} y={arcData.center.y} size={10} />,
    <Cross x={arcData.start.x} y={arcData.start.y} size={10} />,
    <Cross x={arcData.end.x} y={arcData.end.y} size={10} />,
  ];

  return { str, end: arcData.end, helpers };
};
