import React from 'react';
import { getTangents, getStartPosition, getTangents2Circ } from '../../../util';
import { Cross } from '../../../workspace/components/overlayHelperShapes';
import { tokenNames } from '../../../compiler/lexer/commands';
import { getFlags } from '../parserUtil';
const { TANGENT } = tokenNames;

const flagHandlers = {
  tangent: {
    regex: /t[1-4]/,
    defaultValue: 1,
    value: arg => +arg[1] - 1,
  },
  exitTangent: {
    regex: /e[1-2]/,
    defaultValue: 1,
    value: arg => +arg[1] - 1,
  },
  sweep: {
    key: 's',
    defaultValue: 0,
    value: 1,
  },
  largeArcFlag: {
    key: 'la',
    defaultValue: 1,
    value: 0,
  },
};

export default ({ args }, { nextToken, prevToken, currentLocation }) => {
  const nextIsTangent = nextToken && nextToken.name === TANGENT;
  console.log('Context', nextIsTangent, prevToken, nextToken, currentLocation);

  const [centerX, centerY, radius = 10, ...flagArgs] = args;

  const flags = getFlags(flagHandlers, flagArgs);
  console.log('Flags', flagArgs, flags);

  if (!centerX || !centerY) {
    return { str: '', helpers: [], end: currentLocation };
  }

  const center = { x: centerX, y: centerY };

  const t1 = getTangents(center, currentLocation, radius, flags.tangent);

  let helpers = [
    <Cross x={center.x} y={center.y} size={10} />,
    <circle
      cx={center.x}
      cy={center.y}
      r={radius}
      fill="none"
      stroke="red"
      strokeWidth="1"
      opacity="0.5"
    />,
    <Cross x={t1.x} y={t1.y} size={10} color={'blue'} />,
  ];

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
        x: tangents[flags.tangent][0],
        y: tangents[flags.tangent][1],
      };
    }
  }

  let str = '';
  let exitTangent;

  if (end) {
    exitTangent = getTangents(center, end, radius, flags.exitTangent);
  }

  if (t1 && exitTangent) {
    console.log('Tangent with arc');
    if (tangents && tangents.length) {
      currentLocation = {
        x: tangents[flags.tangent][2],
        y: tangents[flags.tangent][3],
      };
    }

    const arcString = `${
      prevToken ? '' : `M ${currentLocation.x} ${currentLocation.y}`
    }L ${t1.x} ${t1.y} A ${radius} ${radius} 0 ${flags.sweep} ${
      flags.largeArcFlag
    } ${exitTangent.x} ${exitTangent.y}`;
    str = `${arcString} L ${exitTangent.x} ${exitTangent.y} ${end.x} ${end.y}`;

    helpers = [
      ...helpers,
      ...(tangents
        ? tangents.map((tangent, i) => (
            <>
              <Cross x={tangent[0]} y={tangent[1]} />
              <Cross x={tangent[2]} y={tangent[3]} />
            </>
          ))
        : []),
      <Cross x={exitTangent.x} y={exitTangent.y} size={10} color={'blue'} />,
    ];
  } else if (t1) {
    str = `M ${currentLocation.x} ${currentLocation.y} L ${t1.x} ${t1.y}`;
  } else if (exitTangent) {
    str = `M ${exitTangent.x} ${exitTangent.y} L ${end.x} ${end.y}`;
  }

  return {
    str,
    end,
    helpers,
  };
};
