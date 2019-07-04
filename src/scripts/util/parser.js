import React from 'react';
import GridLayer from '../workspace/components/layers/grid';

// import Grid from '../
function Grid(props) {
    const [xUnits, yUnits, gridUnit, divisions] = props.args;
    const width = xUnits * gridUnit;
    const height = yUnits * gridUnit;
    return (
        <GridLayer
            width={width}
            height={height}
            gridUnit={gridUnit}
            xUnits={xUnits}
            yUnits={yUnits}
            divisions={divisions}
        />
    );
}


function polarToCartesian(centerX, centerY, radius, angleInRadians) {
    // var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

    return {
          x: centerX + (radius * Math.cos(angleInRadians)),
          y: centerY + (radius * Math.sin(angleInRadians))
        };
}

function describeArc(startX, startY, centerX, centerY, angle, direction){
  
      // var start = polarToCartesian(x, y, radius, endAngle % (Math.PI * 2));

      // var largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
      const a = startX + centerX;
      const b = startY + centerY;
      const radius = Math.sqrt(a*a + b*b);

      var end = polarToCartesian(centerX, centerY, radius, angle);

      var d = [
                "L", start.x, start.y, 
                "A", radius, radius, 0, direction, 0, end.x, end.y
            ].join(" ");

      return d;       
}

const commandArgMapping = {
};


const elements = {
    path: tokenGroup => {
        const pathString = [];
        tokenGroup.tokens.forEach((token, idx) => {
            const { type } = token;
            let command, string;
            if (['point', 'vector'].includes(token.type)) {
              const [i, j] = token.args;
              string = `${i} ${j}`;
              if (token.type === 'point') {
                  if (!idx) {
                      command = 'M';
                  } else {
                      command = 'L';
                  }
              } else if (token.type === 'vector') {
                  if (!idx) {
                      command = 'm';
                  } else {
                      command = 'l';
                  }
              }
            } else if (token.type === 'arc') {
               command = '';
               const [startX, startY, centerX, centerY, angle, direction] = token.args;
               string = describeArc(startX, startY, centerX, centerY, angle, direction);
            }

            pathString.push(`${command} ${string}`);
        });
        return props => (
            <path stroke="black" fill="none" d={pathString.join(' ')} />
        );
    },
    grid: tokenGroup => props => <Grid args={tokenGroup.args} />,
};

export default function(tokenGroups) {
    return tokenGroups
        .map(tokenGroup => {
            if (elements.hasOwnProperty(tokenGroup.type)) {
                return elements[tokenGroup.type](tokenGroup);
            } else {
                console.warn(`Token ref ${tokenGroup.type} has no element`);
                return null;
            }
        })
        .filter(el => el !== null);
}
