const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();  // Make sure to 'npm install sqlite3'

// Initialize the SQLite database
let db = new sqlite3.Database('./packages.db');
db.run('CREATE TABLE IF NOT EXISTS dependencies (package TEXT, dependency TEXT);');

// Fetch workspace packages
let packages = JSON.parse(execSync('npm workspaces list --json').toString()).workspaces;

for (let pkg in packages) {
    // Get directory of each package
    let packageDir = packages[pkg].location;
    // Fetch the dependencies from package.json file
    let dependencies = require(path.join(process.cwd(), packageDir, 'package.json')).dependencies || {};
    // Get only dependency names
    let dependencyNames = Object.keys(dependencies);
    // Write dependencies in the SQLite database
    for (let dep of dependencyNames) {
        if (packages[dep]) {
            db.run(`INSERT INTO dependencies VALUES ('${pkg}', '${dep}');`);
        }
    }
}
