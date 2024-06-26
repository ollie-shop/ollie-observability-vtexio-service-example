export const nodeConsole =
  typeof process !== 'undefined' &&
  process.release.name.search(/node|io.js/) !== -1
    ? console
    : {
        log: () => {},
        trace: () => {},
      }
