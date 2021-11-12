import commands, { tokenNames } from "./commands";
import {
  commentRegEx,
  emptyLineRegEx,
  pathTypesRegEx,
  circleUnitRegex,
} from "./regex";
import { circleUnit } from "./replacements";

const {
  SQUARE_GRID,
  TRI_GRID,
  CIRCLE_GRID,
  GRID_UNIT,
  CLOSE_PATH,
} = tokenNames;

const clamp = function(val, min, max) {
  return Math.min(Math.max(val, min), max);
};

const commandTypes = Object.keys(commands).reduce((a, b) => {
  a[b] = commands[b].type;
  return a;
}, {});

const { PI } = Math;
const HALF_PI = PI / 2;
const QUARTER_PI = PI / 4;
const TWO_PI = PI * 2;

const chars = "[0-9a-z*/+-.{}]";

const refRegEx = /^#(.+?)\s?$/;

const commandRegEx = /^([a-z]{1,2})[:|=]/;

const namedGridContext = {};

const preArgSplitReplacements = [
  {
    name: "Inline loop interpolation",
    regex: `([0-9]+)\\[(.*?)\\]`,
    parse(str, vars) {
      const matches = [...str.matchAll(this.regex)];
      matches.forEach((match) => {
        const [toReplace, count, loopStr] = match;
        const newStrings = [];
        for (let i = 0; i < +count; i++) {
          const newLoopStr = loopStr.replace(/[x]/g, i);
          const { cos, sin, tan, log, atan, asin, acos, random } = Math;
          newLoopStr = newLoopStr.replace(/{(.*?)}/g, (_, match) =>
            // Fix this
            eval(match)
          );
          newStrings.push(newLoopStr);
        }
        const replacement = newStrings.join(",");
        str = str.replace(toReplace, replacement);
      });
      // console.log("What", str, vars);
      // str = str.replace(/[x]/g, vars.loopContext.count);
      // str = str.replace(
      //   /\[(\d+):(.*?)\]/g,
      //   (_, match) => console.log("Loop interpolation", match) || eval(match)
      // );
      console.log("Str", str);
      return str;
    },
    replace(str, matches) {
      console.log("Inline loop", str, matches);
      // return str.replace(matches[0], loopContext.count);
    },
  },
];

const pairArgReplacements = [
  {
    name: "XY",
    regex: `(${chars}+)xy`,
    parse(str) {
      const matches = [...str.matchAll(this.regex)];
      matches.forEach((match) => {
        str = this.replace(str, match);
      });
      return str;
    },
    replace(str, matches) {
      const replacement = `${matches[1]} ${matches[1]}`;
      return str.replace(matches[0], replacement);
    },
  },
  {
    name: "Center",
    regex: /c/,
    replace(str, matches, { squareGridContext, circleGridContext }) {
      const width = squareGridContext.width || circleGridContext.width;
      const height = squareGridContext.height || circleGridContext.height;
      const center = `${+width / 2} ${+height / 2}`;
      const result = str.replace(matches[0], center);
      return result;
    },
  },
  {
    name: "Loop interpolation",
    regex: "{(.*?)}",
    parse(str, vars) {
      str = str.replace(/[x]/g, vars.loopContext.count);
      str = str.replace(
        /{(.*?)}/g,
        (_, match) => eval(match)
      );
      const matches = [...str.matchAll(this.regex)];
      matches.forEach((match) => {
        str = this.replace(str, match, vars);
      });
      return str;
    },
    replace(str, matches, { loopContext }) {
      return str.replace(matches[0], loopContext.count);
    },
  },
  {
    name: "Named grid context",
    regex: /#([a-z]+)\[(.+?)\]/,
    replace(str, matches) {
      const [_, id, gridUnit] = matches;
      return circleUnit(gridUnit, gridUnit.match(circleUnitRegex), {
        circleGridContext: namedGridContext[id],
      });
    },
  },
  {
    name: "Circle unit",
    regex: circleUnitRegex,
    replace: circleUnit,
  },
  {
    name: "Single axis",
    regex: /(-?[^ ]+?)([x|y])/,
    replace(str, matches) {
      const isY = matches[2] === "y";
      const result = `${isY ? "0 " : ""}${matches[1]}${!isY ? " 0" : ""}`;
      return str.replace(matches[0], result);
    },
  },
];

const singleArgReplacements = [
  {
    name: "Silver Ratio",
    regex: /sr/,
    replace(str, matches) {
      const result = str.replace(matches[0], Math.sqrt(2));
      return result;
    },
  },
  {
    name: "Grid Units",
    regex: "([0-9.]*)u([0-9.]*)",
    parse(str, { squareGridContext: { type, gridUnit, gridDivisions } }) {
      let replaceFn = (match) => {
        str = str.replace(
          match[0],
          +match[1] * gridUnit + +match[2] * (gridUnit / gridDivisions)
        );
      };
      // if (type === TRI_GRID) {
      // replaceFn = match => {
      //   str = str.replace(match[0], +match[1] * gridUnit + +match

      // };
      // }

      const matches = [...str.matchAll(this.regex)];
      matches.forEach(replaceFn);
      return str;
    },
    replace(str, matches, { squareGridContext: { gridUnit, gridDivisions } }) {
      const result = str.replace(
        matches[0],
        +matches[1] * gridUnit + +matches[2] * (gridUnit / gridDivisions)
      );
      return result;
    },
  },
  {
    name: "Center",
    regex: /^c([x|y])$/,
    replace(str, matches, { squareGridContext: { width, height, gridUnit } }) {
      return str.replace(matches[0], { x: width, y: height }[matches[1]] / 2);
    },
  },
  {
    name: "Parts of PI",
    regex: /-?([h|q])pi/,
    replace(str, matches) {
      const result = str.replace(
        /.pi/,
        { h: HALF_PI, q: QUARTER_PI }[matches[1]]
      );
      return result;
    },
  },
  {
    name: "Width & Height",
    regex: /(-?[\d|.]*)([w|h])/,
    replace(str, matches, { squareGridContext: { width, height } }) {
      const multiplier = matches[1]
        ? matches[1] === "-"
          ? -1
          : matches[1]
        : 1;
      const replacement =
        clamp(+multiplier, -1, 1) * { w: width, h: height }[matches[2]];
      return str.replace(matches[0], replacement);
    },
  },
  {
    name: "Pi",
    regex: /(-?[\d|.]*)pi/,
    replace(str, matches) {
      const multiplier = matches[1]
        ? matches[1] === "-"
          ? -1
          : matches[1]
        : 1;
      return str.replace(matches[0], (str) => {
        return (multiplier || 1) * PI;
      });
    },
  },
  {
    name: "Arithmetic operations",
    regex: /^[()+\-*/%\d.]*$/,
    // regex: /([\d|.]+)([\*|/|\-|\+])([\d|.]+)/,
    parse(str, vars) {
      try {
        return eval(str); // Use mathjs for this at some point
      } catch (error) {
        return "";
      }
    },
    replace(str, matches) {
      const result = {
        "*": (a, b) => a * b,
        "+": (a, b) => a + b,
        "-": (a, b) => a - b,
        "/": (a, b) => a / b,
      }[matches[2]](+matches[1], +matches[3]);
      return str.replace(matches[0], result);
    },
  },
];

function argReducerFactory(vars) {
  return (a, b) => {
    const regex =
      typeof b.regex === "string" ? new RegExp(b.regex, "g") : b.regex;
    if (regex.test(a)) {
      if (b.parse) {
        return b.parse(a, vars);
      } else {
        return b.replace(a, regex.exec(a), vars);
      }
    } else {
      return a;
    }
  };
}

// TODO: Break token replacement into replace, compute
let loopTokens = [];

export default function(string) {
  let squareGridContext = {
    gridUnit: 10,
    x: 10,
    y: 10,
    gridDivisions: 1,
  };

  let circleGridContext = {};

  const lines = string
    .replace(/-\s*[\n|\r]\s*/g, ",")
    .trim()
    .split("\n");
  let tokens = [];
  let isRepeating = false;
  let loopContext;
  let exitLoopDepth;
  let loopLimit;

  const filteredLines = lines
    .filter(
      (line) => !(commentRegEx.test(line.trim()) || emptyLineRegEx.test(line))
    );
    filteredLines.map((line, index) => {
      const isLastLine = index === filteredLines.length - 1;

      const depth = (line.match(/ {2}/g) || []).length;
      line = line.trim().replace(/\r|\n/, "");

      // if (!commandRegEx.test(line)) {
      //   return;
      // }

      const lineMatches = line.match(commandRegEx);

      const command = lineMatches?.length && lineMatches[1];

      // const type = commandTypes[typeRef];
      const idMatches = /=(.+?)(?=:)/.exec(line);

      if (command === "re") {
        isRepeating = true;
        // TODO: use regex for this
        loopLimit = +line.split(":")[1].split(" ")[0];
        exitLoopDepth = depth;
        tokens.push({
          name: "repeat",
          limit: loopLimit,
          depth,
        });
        loopContext = {
          count: 0,
          increment: 1,
          limit: loopLimit,
          ref: "x",
        };
        return;
      } else {
        if ((isRepeating && depth <= exitLoopDepth) ) {
          // add loop tokens
          isRepeating = false;
          loopTokens.forEach(loopToken => {
            tokens.push(...loopToken);
          });
          loopTokens = [];
        }
      }

      if (isRepeating) {
        for (let i = 0; i < loopContext.limit; i++) {
          const lineTokens = processLine();
          if (loopTokens[i]) {
            loopTokens[i].push(...lineTokens);
          } else {
            loopTokens[i] = lineTokens;
          }
          loopContext.count += loopContext.increment;
        }
        loopContext.count = 0;
      } else {
        const lineTokens = processLine();
        tokens.push(...lineTokens);
      }


      function processLine ()  {
        const lineTokens = [];

        if (refRegEx.test(line)) {
          const matches = refRegEx.exec(line);
          lineTokens.push({
            name: "$ref",
            depth,
            id: matches[1],
          });
          return lineTokens;
        }

        let id;
        if (idMatches) {
          id = idMatches[1];
          line = line.replace(idMatches[0], "");
        }

        if (pathTypesRegEx.test(command)) {
           lineTokens.push({
            name: "path",
            depth,
            id,
            closed: false,
          });
        }

        const commandLines = line.split(
          new RegExp(`^|[, ](?=[${Object.keys(commands).join("")}]:)`)
        );

        return commandLines.reduce((commandTokens, command) => {
          let [_, ref, argStr] = command.trim().split(/^(.{1,2}):/);

          if (!commands[ref]) {
            console.warn(`Command not recognised - ${ref}`);
            return commandTokens;
          }

          const commandRef = commands[ref];
          const { name = "", argsRegEx, argCount } = commandRef;
          let tokenArgs = [],
            matches;

          const vars = {
            squareGridContext,
            circleGridContext,
            loopContext,
          };

          const argReducer = argReducerFactory(vars);

          argStr = preArgSplitReplacements.reduce(argReducer, argStr.trim());

          tokenArgs = argStr.split(",");

          tokenArgs = tokenArgs
            .map((tokenStr) => tokenStr.trim())
            .filter((tokenStr) => tokenStr)
            .map((tokenStr) => {
              tokenStr = pairArgReplacements.reduce(argReducer, tokenStr);
              const parsedStr = tokenStr.split(" ").map((str) => {
                const arg = singleArgReplacements.reduce(argReducer, str);
                return isNaN(arg) ? arg : +arg;
              });
              return parsedStr;
            });

          if (name === GRID_UNIT) {
            squareGridContext.gridUnit = +tokenArgs[0];
          }

          if (name === CIRCLE_GRID) {
            if (!tokenArgs.length) return commandTokens;

            const [
              radius,
              rings,
              segments,
              offset = 0,
              positionX = 0,
              positionY = 0,
            ] = tokenArgs[0];

            const gridContext = {
              width: radius * 2,
              height: radius * 2,
              radius,
              segments,
              rings,
              offset,
              positionX,
              positionY,
            };

            circleGridContext = gridContext;

            if (idMatches) {
              namedGridContext[idMatches[1]] = gridContext;
            }
          }
          if (name === SQUARE_GRID || name === TRI_GRID) {
            if (!tokenArgs.length) return commandTokens;
            const [
              xUnits,
              yUnits,
              gridUnit,
              gridDivisions = 1,
              offsetX = 0,
              offsetY = 0,
            ] = tokenArgs[0];

            squareGridContext = {
              type: name,
              width: xUnits * gridUnit,
              height: yUnits * gridUnit,
              xUnits,
              yUnits,
              gridUnit,
              gridDivisions,
              offsetX,
              offsetY,
            };
          }

          if (name === CLOSE_PATH) {
            commandTokens.push({name, depth, id });
            return commandTokens;
          }

          const tokes =  tokenArgs
              .filter((args) => !argCount || args.length >= argCount)
              .map((args) => ({
                name,
                data: commandRef.data,
                args,
                depth,
                id,
              }));
          commandTokens.push(...tokes);
          return commandTokens;
        }, lineTokens);

      }
    });

  if (isRepeating) {
    loopTokens.forEach(loopToken => {
      tokens.push(...loopToken);
    });
    loopTokens = [];
  }

  return tokens;
}
