/* this should remain the first import */
import 'source-map-support/register';

import assert from 'node:assert';

const cmd_map = {
  mqtt: 'mqtt',
  etc: 'etc',
} as const;
assert(Object.entries(cmd_map).every(([ key, val ]) => {
  return key === val;
}));
type JuliusCommand = keyof typeof cmd_map;
type JuliusArgs = {
  cmd: JuliusCommand;
} & {};

(async () => {
  try {
    await main();
  } catch(e) {
    console.error(e);
    throw e;
  }
})();

async function main() {
  setProcName();
  let jArgs = parseArgs();
  switch(jArgs?.cmd) {
    case cmd_map.mqtt:
      await (await import('./lib/cmd/mqttezd/mqtt-main')).mqttMain();
      break;
    case cmd_map.etc:
      console.log('etc');
      break;
    case undefined:
      printCmds();
  }
}

function printCmds() {
  let outLines: string[] = [];
  let cmdStrs: string[] = [ ...Object.keys(cmd_map) ];
  outLines.push('commands:');
  outLines.push(`  ${cmdStrs.join(', ')}`);
  process.stdout.write(`${outLines.join('\n')}\n`);
}

/*
  keep it simple for now, parse the command str
_*/
function parseArgs(): JuliusArgs | undefined {
  let args: string[];
  let firstArg: string;
  let jArgs: JuliusArgs;
  args = process.argv.slice(2);
  if(args.length < 1) {
    return;
  }
  firstArg = args[0];
  if(!checkJuliusCommand(firstArg)) {
    return;
  }
  jArgs = {
    cmd: firstArg,
  };
  return jArgs;
}
function checkJuliusCommand(cmdStr: string): cmdStr is JuliusCommand {
  return ([ ...Object.values(cmd_map) ] as readonly string[]).includes(cmdStr);
}

function setProcName() {
  process.title = 'julius-ezd-2025';
}
