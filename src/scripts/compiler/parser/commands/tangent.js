import React from 'react';
import { getTangents, getStartPosition, getTangents2Circ } from '../../../util';
import { Cross } from '../../../workspace/components/overlayHelperShapes';
import { Line } from '../../../workspace/components';
import { tokenNames } from '../../../compiler/lexer/commands';
import { getFlags } from '../parserUtil';
const { TANGENT } = tokenNames;

const flagHandlers = {
  entryTangent: {
    regex: /e[1-2]/,
    defaultValue: 1,
    value: arg => +arg[1] - 1,
  },
  exitTangent: {
    regex: /x[1-4]/,
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

function isTangent(token) {
  return token && token.name === TANGENT;
}

export default ({ args }, { nextToken, prevToken, currentLocation }) => {
  const nextIsTangent = isTangent(nextToken);
  const prevIsTangent = isTangent(prevToken);

  const [centerX, centerY, radius = 10, ...flagArgs] = args;

  const flags = getFlags(flagHandlers, flagArgs);

  if (!centerX || !centerY) {
    return { str: '', helpers: [], end: currentLocation };
  }

  const center = { x: centerX, y: centerY };

  const entryTangent = prevIsTangent
    ? currentLocation
    : getTangents(center, radius, currentLocation, flags.entryTangent);

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
    <Cross x={entryTangent.x} y={entryTangent.y} size={10} color={'green'} />,
  ];

  let tangents, endPoint, exitTangent;

  if (nextIsTangent) {
    const [nextTokenX, nextTokenY, nextTokenRadius] = nextToken.args;
    tangents = getTangents2Circ(
      center,
      radius,
      { x: nextTokenX, y: nextTokenY },
      nextTokenRadius
    );
    if (tangents.length) {
      exitTangent = {
        x: tangents[flags.exitTangent][0],
        y: tangents[flags.exitTangent][1],
      };
      endPoint = {
        x: tangents[flags.exitTangent][2],
        y: tangents[flags.exitTangent][3],
      };
    }
  } else {
    endPoint = getStartPosition(nextToken);
    exitTangent = getTangents(center, radius, endPoint, flags.exitTangent);
  }

  let str = '';

  if (entryTangent && exitTangent) {
    if (tangents && tangents.length) {
      tangents.forEach(tangent => {
        helpers.push(
          <Line
            color={'red'}
            opacity={0.3}
            x1={tangent[0]}
            y1={tangent[1]}
            x2={tangent[2]}
            y2={tangent[3]}
          />
        );
      });
    }

    const arcString = `${
      prevToken ? '' : `M ${currentLocation.x} ${currentLocation.y}`
    }L ${entryTangent.x} ${entryTangent.y} A ${radius} ${radius} 0 ${
      flags.sweep
    } ${flags.largeArcFlag} ${exitTangent.x} ${exitTangent.y}`;
    str = `${arcString} L ${exitTangent.x} ${exitTangent.y} ${endPoint.x} ${endPoint.y}`;

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
      <Cross x={currentLocation.x} y={currentLocation.y} color={'pink'} />,
      <Cross
        x={entryTangent.x}
        y={entryTangent.y}
        size={20}
        color={'purple'}
      />,
    ];
  } else if (entryTangent) {
    helpers = [
      <Cross
        x={entryTangent.x}
        y={entryTangent.y}
        size={20}
        color={'purple'}
      />,
    ];
    str = `M ${currentLocation.x} ${currentLocation.y} L ${entryTangent.x} ${entryTangent.y}`;
  } else if (exitTangent) {
    helpers = [<Cross x={exitTangent.x} y={exitTangent.y} color={'red'} />];
    str = `M ${exitTangent.x} ${exitTangent.y} L ${endPoint.x} ${endPoint.y}`;
  }

  // sets currentlocation for next token
  if (tangents && tangents.length) {
    currentLocation = {
      x: tangents[flags.exitTangent][2],
      y: tangents[flags.exitTangent][3],
    };
  }

  return {
    str,
    end: endPoint,
    helpers,
  };
};
