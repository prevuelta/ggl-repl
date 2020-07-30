import React from 'react';
import { getTangents, getStartPosition, getTangents2Circ } from '../../../util';
import { Cross } from '../../../workspace/components/overlayHelperShapes';
import { Line } from '../../../workspace/components';
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

  const [centerX, centerY, radius = 10, ...flagArgs] = args;

  const flags = getFlags(flagHandlers, flagArgs);

  if (!centerX || !centerY) {
    return { str: '', helpers: [], end: currentLocation };
  }

  const center = { x: centerX, y: centerY };

  const entryTangent = getTangents(
    center,
    currentLocation,
    radius,
    flags.tangent
  );

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
    <Cross x={entryTangent.x} y={entryTangent.y} size={10} color={'blue'} />,
  ];

  let end = currentLocation;
  let tangents;

  if (!nextIsTangent) {
    end = getStartPosition(nextToken);
  } else {
    const [nextTokenX, nextTokenY, nextTokenRadius] = nextToken.args;
    tangents = getTangents2Circ(
      center,
      radius,
      { x: nextTokenX, y: nextTokenY },
      nextTokenRadius
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

  if (entryTangent && exitTangent) {
    if (tangents && tangents.length) {
      console.log('Tangents', tangents);
      currentLocation = {
        x: tangents[flags.tangent][2],
        y: tangents[flags.tangent][3],
      };
      tangents.forEach(tangent => {
        helpers.push(
          <Line
            color={'teal'}
            x1={tangents[0]}
            y1={tangents[1]}
            x2={tangents[2]}
            y2={tangents[3]}
          />
        );
      });
    }

    const arcString = `${
      prevToken ? '' : `M ${currentLocation.x} ${currentLocation.y}`
    }L ${entryTangent.x} ${entryTangent.y} A ${radius} ${radius} 0 ${
      flags.sweep
    } ${flags.largeArcFlag} ${exitTangent.x} ${exitTangent.y}`;
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
      <Cross x={currentLocation.x} y={currentLocation.y} color={'pink'} />,
      <Cross x={exitTangent.x} y={exitTangent.y} size={20} color={'red'} />,
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
    helpers = [
      <Cross x={exitTangent.x} y={exitTangent.y} size={20} color={'purple'} />,
    ];
    str = `M ${exitTangent.x} ${exitTangent.y} L ${end.x} ${end.y}`;
  }

  return {
    str,
    end,
    helpers,
  };
};
