"use strict";

const Database = require('better-sqlite3');

const db = new Database('log.db');

const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`);
let row = stmt.get();

if (row === undefined) {
    console.log('Your database appears to be empty. I will initialize it now.');
}