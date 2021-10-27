import { TWO_PI } from "../../util";

export const circleUnit = (str, matches, { circleGridContext }) => {
  const {
    radius,
    rings,
    segments,
    offset,
    positionX,
    positionY,
  } = circleGridContext;
  const r = +matches[1];
  const s = +matches[2];
  const sInterval = TWO_PI / segments;
  const rInterval = radius / rings;
  const theta = sInterval * s + offset;
  const newRadius = rInterval * r;
  const x = Math.cos(theta) * newRadius + radius + positionX;
  const y = Math.sin(theta) * newRadius + radius + positionY;
  const newStr = str.replace(matches[0], `${x.toFixed(4)} ${y.toFixed(4)}`);
  return newStr;
};
