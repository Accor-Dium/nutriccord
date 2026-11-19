#!/usr/bin/env node
/**
 * Sincroniza la versión SemVer en app.json (expo.version) y package.json.
 * Uso: node scripts/sync-app-version.js 1.2.3
 * Lo invoca semantic-release (ver .releaserc.json) en cada release.
 */
const fs = require('fs');
const path = require('path');

const version = process.argv[2];
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

if (!version || !SEMVER.test(version)) {
  console.error(`Versión inválida: "${version}". Se espera SemVer, p. ej. 1.2.3`);
  process.exit(1);
}

function updateJson(file, mutate) {
  const fullPath = path.join(__dirname, '..', file);
  const json = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  mutate(json);
  fs.writeFileSync(fullPath, JSON.stringify(json, null, 2) + '\n');
  console.log(`${file} -> ${version}`);
}

updateJson('app.json', (json) => {
  json.expo.version = version;
});
updateJson('package.json', (json) => {
  json.version = version;
});
