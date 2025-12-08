import mysql from "mysql2"

export const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // CHANGE THIS !
    database: "social"    // CHANGE THIS !
})
