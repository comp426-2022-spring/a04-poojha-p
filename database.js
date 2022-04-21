"use strict";

const database = require('better-sqlite3')
const logdb = new database('log.db')

//prepare --> set up a database
const stmt = logdb.prepare(`SELECT name FROM sqlite_master WHERE type='table' and 'accesslog';`)
let row = stmt.get()

if (row == undefined) {
    console.log('Log database is empty. Creating log database...')

    const dbInit = `
        CREATE TABLE access (
            id INTEGER PRIMARY KEY,
            remoteaddr VARCHAR,
            remoteuser VARCHAR,
            time VARCHAR,
            method VARCHAR,
            url VARCHAR,
            httpversion NUMERIC,
            secure VARCHAR,
            status INTEGER,
            referer VARCHAR,
            useragent VARCHAR
        )`
    
    logdb.exec(dbInit)
} else {
    console.log('Log database exists.')
}

module.exports = logdb