"use strict";

require("./patch-next-localhost-env.cjs");

const nextBin = require.resolve("next/dist/bin/next");
const extraArgs = process.argv.slice(2);

process.argv = [process.argv[0], nextBin, "dev", ...extraArgs];

require(nextBin);
