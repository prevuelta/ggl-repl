// import React from 'react';
// import GridLayer from '../workspace/components/layers/grid';
import {
    HALF_PI,
    PI,
    TWO_PI,
    getAngle,
    getDistance,
    polarToCartesian,
    addVector,
} from '../util/trig';
import { modes } from '../util/constants';
import { Store } from '../data';

let state = Store.getState();

// import Grid from '../
// function Grid(props) {
//     const [xUnits, yUnits, gridUnit, divisions] = props.args;
//     const width = xUnits * gridUnit;
//     const height = yUnits * gridUnit;
//     return (
//         <GridLayer
//             width={width}
//             height={height}
//             gridUnit={gridUnit}
//             xUnits={xUnits}
//             yUnits={yUnits}
//             divisions={divisions}
//         />
//     );
// }

export function tokenToSVGArc(token, isFirst) {
    const [
        startX,
        startY,
        centerX,
        centerY,
        angle,
        largeArcFlag,
        sweep,
    ] = token.args;
    return describeArc(
        { x: startX, y: startY },
        { x: centerX, y: centerY },
        angle,
        largeArcFlag,
        sweep
    );
}

function describeArc(start, center, angle, largeArcFlag = 0, sweep = 0) {
    const originalAngle = angle;
    const startAngle = getAngle(start, center);
    console.log('Start', start, 'Center', center, 'Start angle', startAngle);
    angle += startAngle;
    angle = angle % TWO_PI;

    if (originalAngle > PI || originalAngle < -PI) {
        // sweep = 1;
    }

    if (angle >= PI) {
        // largeArcFlag = largeArcFlag ? 0 : 1;
    }

    const radius = getDistance(start, center);
    var end = polarToCartesian(center, radius, angle);

    return `${start.x} ${
        start.y
    } A ${radius} ${radius} 0 ${sweep} ${largeArcFlag} ${end.x} ${end.y}`;
}

const elements = {
//     path: tokenGroup => {
//         const pathString = [];
//         let currentLocation = {x: 0, y: 0};
//         tokenGroup.tokens.forEach((token, idx) => {
//             const { type, args } = token;
//             let string = '';
//             if (['point', 'vector'].includes(type)) {
//                 const [i, j] = args;
//                 let command;
//                 if (type === 'point') {
//                     currentLocation.x = i;
//                     currentLocation.y = j;
//                     if (!idx) {
//                         command = 'M';
//                     } else {
//                         command = 'L';
//                     }
//                 } else if (type === 'vector') {
//                     currentLocation.x += i;
//                     currentLocation.y += j;
//                     if (!idx) {
//                         command = 'm';
//                     } else {
//                         command = 'l';
//                     }
//                 }
//                 string = `${command} ${i} ${j}`;
//             } else if (type === 'arc') {
//                 string = `${idx ? 'L' : 'M'} ${tokenToSVGArc(token)}`;
//                 currentLocation.x = token.args[0];
//                 currentLocation.y = token.args[1];
//             } else if (type === 'corner') {
//                 // const nextToken = tokenGroup.tokens[idx + 1];
//                 const center = { x: args[0], y: args[1] };
//                 const dist = getDistance(currentLocation, center);
//                 const initialAngle = getAngle(currentLocation, center);
//                 console.log("Distance", dist, initialAngle);
//                 const angle = args[2] || 0;
//                 const test = { x: 0, y: 0 };
//                 const newAngle = angle + initialAngle;
//                 const newX = Math.cos(newAngle) * dist;
//                 const newY = Math.sin(newAngle) * dist;
//                 test.x += newX;
//                 test.y += newY;
//                 // const end = { x: endX, y: endY };
//                 const end = addVector(center, test);
//                 string = `L ${center.x} ${center.y} L ${end.x} ${end.y}`;
//             }
//             pathString.push(string);
//         });
//         return props => <path d={pathString.join(' ')} />;
    // },
  grid: token => 'gridEl' //tokenGroup => props => <Grid args={tokenGroup.args} />,
};

export default function(tokens) {
    let state = Store.getState();
    let tree = { children: [], token: { name: 'root' }};
    let branch = tree;
    tokens = tokens.map(t => { delete t.args; return t });
    let currentDepth = -1;
    tokens.forEach(token => {
      if (token.depth > currentDepth) {
        const newBranch = { token };
        branch.children = [...(branch.children || []), newBranch];
        newBranch.parent = branch;
        branch = newBranch;
      }
       else if (token.depth < currentDepth || ( branch.name === 'path' && token.name === 'path')) {
        const dif = currentDepth - token.depth;
        for (let i = 0; i < dif; i++) {
          branch = branch.parent;
        }
         const newBranch = { token };
        branch.parent.children.push(newBranch);
        newBranch.parent = branch.parent;
        branch = newBranch;
      } else {
        if (branch.token.name === 'path') {
          branch.tokens = [...(branch.tokens || []), token];
        } else {
          branch.children = [...(branch.children || []),{ token }];
        }
      }
      currentDepth = token.depth;
    });

    const output = { grids: [], paths: [] };

    function iterateNodes (branch) {
        (branch.children || []).forEach(c =>  {
          if path get element set children
          children = iterateNodes
          iterateNodes(c);
          if (branch.token.name === 'grid') {
            output.grids.push(elements['grid'](branch.token));
          }
        });
    }

    iterateNodes(tree);

    console.log(output);


    // return tokens.reduce(
    //     (obj, token) => {
            // if (elements.hasOwnProperty(tokenGroup.type)) {
            //     const element = elements[tokenGroup.type](tokenGroup);
                // if (tokenGroup.type === 'grid') {
                //     obj.grids.push(element);
                // } else {
                //     obj.paths.push(element);
                // }
            // } else {
                // console.warn(`Token ref ${tokenGroup.type} has no element`);
            // }
            // return obj;
        // },
        // { grids: [], paths: [] }
    // );
}
