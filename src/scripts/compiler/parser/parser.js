import React from "react";
import {
  CircleGrid,
  SquareGrid,
  Line,
  TriGrid,
} from "../../workspace/components";
import { Node, Cross } from "../../workspace/components/overlayHelperShapes";
import {
  COLORS,
  HALF_PI,
  PI,
  TWO_PI,
  addVector,
  getAngle,
  getDistance,
  getDocumentSize,
  polarToCartesian,
  radToDeg,
  globals,
  mapChildren,
} from "../../util";
import { pathCommands, tokenNames } from "../lexer/commands";
import transforms from "./transforms";
import parseToken from "./commands";

const {
  ADD_VECTOR,
  ARC,
  BEZIER_CURVE,
  CIRCLE,
  CIRCLE_GRID,
  CLOSE_PATH,
  CORNER,
  DOCUMENT,
  FILL,
  INTERSECT,
  PATH,
  POINT,
  REPEAT,
  ROOT,
  SQUARE,
  SQUARE_GRID,
  STYLE,
  SUB_VECTOR,
  TANGENT,
  TRI_GRID,
} = tokenNames;

const DEFAULT_DOC_ARGS = [100, 100, 0];

const { Fragment } = React;

const Helpers = ({ children, fill, stroke }) => {
  return (
    <g fill={fill || "none"} stroke={stroke || "red"} strokeWidth="1">
      {React.Children.map(children, (child, key) =>
        React.cloneElement(child, { key })
      )}
    </g>
  );
};

// TODO: generic transform element factory

const elements = {
  ...transforms,
  [FILL]: ({ token }, children = []) => props => {
    const [color = COLORS.BLACK] = token.args;
    return (
      <g fill={color}>
        {children.map(Child => (
          <Child />
        ))}
      </g>
    );
  },
  [STYLE]: ({ token }, children = []) => props => {
    const [
      fill = "none",
      stroke = COLORS.RED,
      strokeWidth = 1,
      strokeOpacity = 1,
    ] = token.args;
    // const strokeAlignment = { c: 'center', i: 'inner', o: 'outer' }[rawStrokeAlignment];
    return (
      <g
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
      >
        {mapChildren(children)}
      </g>
    );
  },
  $ref: ({ token }) => props => {
    return <use href={`#${token.id}`} x="0" y="0" />;
  },
  [REPEAT]: (args, children = []) => () => {
    return children.map(Child => <Child />);
  },
  [SQUARE]: ({ token }) => props => {
    const [x1, y1, x2, y2, cornerRadius = 0] = token.args;
    return (
      <rect
        id={token.id}
        x={x1}
        y={y1}
        width={Math.max(0, x2)}
        height={Math.max(0, y2)}
        rx={cornerRadius}
      />
    );
  },
  [CIRCLE]: ({ token }) => props => {
    const [x, y, r] = token.args;
    return <circle cx={x} cy={y} r={r} />;
  },
  [PATH]: ({ tokens, token: path, showHelpers }, children = []) => {
    const pathString = [];
    let currentLocation = { x: 0, y: 0 };
    let allHelpers = [];
    const points = [];

    let previousToken;

    (tokens || []).forEach((token, idx) => {
      const { name, args } = token;
      let string = "";
      if (isPointOrVector(name)) {
        let [i, j] = args;
        if (isNaN(i) || isNaN(j)) return;
        let command;
        if (name === POINT) {
          currentLocation.x = i;
          currentLocation.y = j;
          if (!idx) {
            command = "M";
          } else {
            command = "L";
          }
        } else if (name.includes("vector")) {
          if (name === SUB_VECTOR) {
            currentLocation.x -= i;
            currentLocation.y -= j;
            i = -i;
            j = -j;
          } else {
            currentLocation.x += i;
            currentLocation.y += j;
          }
          if (!idx) {
            command = "m";
          } else {
            command = "l";
          }
        }
        string = `${command} ${i} ${j}`;
        points.push({ x: currentLocation.x, y: currentLocation.y });
      } else if (name === BEZIER_CURVE) {
        let { x, y } = currentLocation;
        const [x2, y2, cx = 0, cy = 0, c2x = 0, c2y = 0] = token.args;
        if (previousToken.name === BEZIER_CURVE) {
          const prevCx = previousToken.args[4] || 0;
          const prevCy = previousToken.args[5] || 0;
          allHelpers.push(
            <circle cx={x - prevCx} cy={y - prevCy} r={4} />,
            <Line
              color={"green"}
              x1={x}
              y1={y}
              x2={x - prevCx}
              y2={y - prevCy}
            />
          );
          x = x + x2;
          y = y + y2;
          currentLocation = { x, y };
          string = `s ${cx},${cy} ${x2},${y2}`;
        } else {
          currentLocation = { x: x + x2, y: y + y2 };
          string = `M ${x} ${y} c ${cx},${cy} ${c2x + x2},${c2y +
            y2} ${x2},${y2}`;
        }
        if (cx || cy) {
          allHelpers.push(
            <circle cx={x + cx} cy={y + cy} r={4} />,
            <Line color={"green"} x1={x} y1={y} x2={x + cx} y2={y + cy} />
          );
        }
        if (c2x || c2y) {
          allHelpers.push(
            <circle cx={x + x2 + c2x} cy={y + y2 + c2y} r={4} />,
            <Line x1={x + x2} y1={y + y2} x2={x + x2 + c2x} y2={y + y2 + c2y} />
          );
        }
        points.push(currentLocation);
      } else if (name === ARC) {
        const { str, end, helpers } = parseToken(token, {
          prevToken: tokens[idx - 1] || null,
          nextToken: tokens[idx + 1] || null,
          currentLocation,
        });
        string = str;
        currentLocation = end;
        allHelpers = [...allHelpers, ...helpers];
      } else if (name === CORNER) {
        // const nextToken = tokenGroup.tokens[idx + 1];
        const center = { x: args[0], y: args[1] };
        const dist = getDistance(currentLocation, center);
        const initialAngle = getAngle(currentLocation, center);
        const angle = args[2] || 0;
        const newAngle = angle + initialAngle;
        const newX = Math.cos(newAngle) * dist;
        const newY = Math.sin(newAngle) * dist;
        const end = addVector(center, { x: newX, y: newY });
        string = `L ${center.x} ${center.y} L ${end.x} ${end.y}`;
        points.push(center, end);
      } else if (name === INTERSECT) {
        // Intersect
        // const [cx, cy, radius, endX, endY, flag = 0] = token.args;
        const [cx, cy, stroke, endX, endY, flag = 0] = token.args;
        const center = {
          x: cx,
          y: cy,
          color: "green",
        };
        const end = {
          x: endX,
          y: endY,
          color: "purple",
        };
        const angle1 = getAngle(currentLocation, center);
        const angle2 = getAngle(end, center);
        const angleDiff = angle1 - angle2;
        const miterLength = stroke / Math.sin(angleDiff / 2);

        // const miterPoint = polarToCartesian(center, miterLength, angle1);

        const p3 = polarToCartesian(center, stroke, angle1);
        const p4 = polarToCartesian(center, stroke, angle2);

        string = `L ${currentLocation.x} ${currentLocation.y} ${miterPoint.x} ${miterPoint.y} ${end.x} ${end.y}`;
        currentLocation = end;
        allHelpers.push(
          <Cross
            x={miterPoint.x}
            y={miterPoint.y}
            color={center.color}
            size={10}
          />,
          <Cross x={center.x} y={center.y} color={center.color} size={5} />,
          <Cross x={end.x} y={end.y} color={end.color} size={10} />,
          <Cross x={p3.x} y={p3.y} color="red" size={20} />,
          <Cross x={p4.x} y={p4.y} color="blue" size={20} />,
          <circle
            cx={cx}
            cy={cy}
            r={miterLength}
            fill="none"
            stroke="blue"
            strokeWidth="1"
            opacity="0.5"
          />,
          <circle
            cx={cx}
            cy={cy}
            r={stroke}
            fill="none"
            stroke="red"
            strokeWidth="1"
            opacity="0.5"
          />
        );
      } else if (name === TANGENT) {
        const { str, end, helpers } = parseToken(token, {
          prevToken: tokens[idx - 1] || null,
          nextToken: tokens[idx + 1] || null,
          currentLocation,
        });
        string = str;
        currentLocation = end;
        allHelpers = [...allHelpers, ...helpers];
      } else if (name === CLOSE_PATH) {
        string = "Z";
      }

      pathString.push(string);
      previousToken = token;
    });
    allHelpers = [
      ...points.map(({ x, y }, i) => <Node key={i} x={x} y={y} color="red" />),
      ...allHelpers,
    ];
    allHelpers.push(<path d={pathString.join(" ")} stroke="red" fill="none" />);

    return props => (
      <Fragment>
        <path
          id={path.id}
          d={pathString.join(" ") + (path.closed ? " Z" : "")}
          fillRule="evenodd"
        />
        {children.map((Child, i) => (
          <Child key={i} />
        ))}
        {showHelpers && <Helpers children={allHelpers} />}
      </Fragment>
    );
  },
  [TRI_GRID]: ({ token, showHelpers }, children = []) => props => {
    return (
      <Fragment>
        {showHelpers && <TriGrid args={token.args} />}
        {children.map((Child, i) => (
          <Child key={i} />
        ))}
      </Fragment>
    );
  },
  [SQUARE_GRID]: ({ token, showHelpers }, children = []) => props => {
    return (
      <Fragment>
        {showHelpers && <SquareGrid args={token.args} />}
        {children.map((Child, i) => (
          <Child key={i} />
        ))}
      </Fragment>
    );
  },
  [CIRCLE_GRID]: ({ token, showHelpers }, children = []) => props => {
    const [
      radius,
      rings,
      segments,
      offset = 0,
      positionX = 0,
      positionY = 0,
    ] = token.args;
    const width = radius * 2;
    const height = radius * 2;
    return (
      <Fragment>
        {children.map((Child, i) => (
          <Child key={i} />
        ))}
        {showHelpers && (
          <CircleGrid
            {...{
              offset,
              width,
              height,
              radius,
              rings,
              segments,
              positionX,
              positionY,
            }}
          />
        )}
      </Fragment>
    );
  },
  [ROOT]: ({ token }, children = []) => props => {
    return children.map(Child => <Child />);
  },
  [DOCUMENT]: ({ token, size, showHelpers }, children = []) => props => {
    let [width, height, padding] = token.args;
    if (width === "a") {
      width = size.width;
    }
    if (height === "a") {
      height = size.height;
    }

    const widthPlusPadding = width + padding * 2;
    const heightPlusPadding = height + padding * 2;
    const viewBox = `0 0 ${widthPlusPadding} ${heightPlusPadding}`;

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="renderer-svg"
        height={heightPlusPadding}
        width={widthPlusPadding}
        fill={"#000000"}
        viewBox={viewBox}
      >
        {showHelpers && (
          <>
            <rect
              stroke="#ff00ff"
              fill="none"
              x={0}
              y={0}
              width={widthPlusPadding}
              height={heightPlusPadding}
              strokeDasharray="2 2"
            />
            <rect
              stroke="none"
              fill="#000"
              x={padding}
              y={padding}
              width={width}
              height={height}
              opacity="0.05"
            />
          </>
        )}

        <g transform={`translate(${padding}, ${padding})`}>
          {children.map((Child, i) => (
            <Child key={i} />
          ))}
        </g>
      </svg>
    );
  },
};

export default function(tokens, showHelpers = true) {
  let $refs = {};
  let parseTree = { children: [], token: { name: "root" } };
  if (!tokens.length || tokens[0].name !== DOCUMENT) {
    tokens.unshift({ name: "document", args: DEFAULT_DOC_ARGS, depth: 0 });
  }
  let node = parseTree;
  let currentDepth = -1;

  const size = getDocumentSize(tokens);

  tokens.forEach((token, i) => {
    if (i && token.name === DOCUMENT) {
      throw new Error("Document must be at root level");
    }
    if (token.depth > currentDepth) {
      const newBranch = { token };
      node.children = [...(node.children || []), newBranch];
      newBranch.parent = node;
      node = newBranch;
    } else if (
      token.depth < currentDepth ||
      (node.token.name === PATH && token.name === PATH) ||
      !isDrawCommand(token.name)
    ) {
      const dif = currentDepth - token.depth;
      for (let i = 0; i < dif; i++) {
        node = node.parent;
      }
      const newBranch = { token };
      node.parent.children.push(newBranch);
      newBranch.parent = node.parent;
      node = newBranch;
    } else {
      if (node.token.name === PATH) {
        node.tokens = [...(node.tokens || []), token];
        if (node.token.id) {
          $refs[node.token.id] = node;
        }
      } else {
        node.children = [...(node.children || []), { token }];
      }
    }
    currentDepth = token.depth;
  });

  const output = { grids: [], paths: null };

  function iterateNodes(node) {
    const opt = { ...node, showHelpers, size };
    const elFn = elements[node.token.name];
    if (!elFn) return props => null;
    if (node.children) {
      return elFn(opt, node.children.map(child => iterateNodes(child)));
    }
    return elFn(opt);
  }

  // console.log('TREE', parseTree);
  output.paths = iterateNodes(parseTree);
  // console.log('OUTPUT', output);
  return output;
}

function isDrawCommand(name) {
  return Object.values(pathCommands)
    .map(v => v.name)
    .includes(name);
}
function isPointOrVector(name) {
  return [SUB_VECTOR, ADD_VECTOR, POINT].includes(name);
}
