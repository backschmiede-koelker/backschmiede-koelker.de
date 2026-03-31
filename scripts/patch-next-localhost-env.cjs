"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { fileURLToPath } = require("node:url");

const blockedNames = new Set([
  ".env",
  ".env.local",
  ".env.development",
  ".env.development.local",
  ".env.production",
  ".env.production.local",
  ".env.test",
  ".env.test.local",
]);

const rootDir = path.resolve(process.cwd());
const blockedPaths = new Set(
  Array.from(blockedNames, (name) => path.resolve(rootDir, name)),
);

function toPath(input) {
  if (typeof input === "string") return path.resolve(input);
  if (input instanceof URL) return path.resolve(fileURLToPath(input));
  return null;
}

function isBlocked(input) {
  const resolved = toPath(input);
  return resolved ? blockedPaths.has(resolved) : false;
}

function enoent(input) {
  const target = typeof input === "string" ? input : String(input);
  const err = new Error(`ENOENT: no such file or directory, open '${target}'`);
  err.code = "ENOENT";
  err.errno = -2;
  err.syscall = "open";
  err.path = target;
  return err;
}

const originalStatSync = fs.statSync.bind(fs);
const originalReadFileSync = fs.readFileSync.bind(fs);
const originalExistsSync = fs.existsSync.bind(fs);
const originalPromisesStat = fs.promises.stat.bind(fs.promises);
const originalPromisesReadFile = fs.promises.readFile.bind(fs.promises);
const originalPromisesAccess = fs.promises.access.bind(fs.promises);

fs.statSync = function patchedStatSync(target, ...args) {
  if (isBlocked(target)) throw enoent(target);
  return originalStatSync(target, ...args);
};

fs.readFileSync = function patchedReadFileSync(target, ...args) {
  if (isBlocked(target)) throw enoent(target);
  return originalReadFileSync(target, ...args);
};

fs.existsSync = function patchedExistsSync(target) {
  if (isBlocked(target)) return false;
  return originalExistsSync(target);
};

fs.promises.stat = async function patchedPromisesStat(target, ...args) {
  if (isBlocked(target)) throw enoent(target);
  return originalPromisesStat(target, ...args);
};

fs.promises.readFile = async function patchedPromisesReadFile(target, ...args) {
  if (isBlocked(target)) throw enoent(target);
  return originalPromisesReadFile(target, ...args);
};

fs.promises.access = async function patchedPromisesAccess(target, ...args) {
  if (isBlocked(target)) throw enoent(target);
  return originalPromisesAccess(target, ...args);
};
