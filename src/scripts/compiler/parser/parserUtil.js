export function getFlags(handlers, flagArgs) {
  const flags = {};
  Object.entries(handlers).forEach(([key, handler]) => {
    let flagValue = handler.defaultValue;
    if (handler.key) {
      if (flagArgs.some(arg => arg === handler.key)) {
        flagValue = handler.value;
      }
    } else if (handler.regex) {
      const arg = flagArgs.find(arg => handler.regex.test(arg));
      if (arg) {
        flagValue = handler.value(arg);
      }
    }

    flags[key] = flagValue;
  });
  return flags;
}
