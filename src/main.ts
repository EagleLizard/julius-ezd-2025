
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
}

function parseArgs() {
  let args: string[];
}

function setProcName() {
  process.title = 'julius-ezd-2025';
}
