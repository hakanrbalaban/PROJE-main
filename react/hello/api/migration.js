import { db } from "./db.js";

const q = "ALTER TABLE users ADD COLUMN city VARCHAR(45) NULL, ADD COLUMN website VARCHAR(45) NULL";

db.query(q, (err, data) => {
    if (err) {
        console.log("Error or columns may already exist:", err.sqlMessage);
    } else {
        console.log("Columns added successfully!");
    }
    process.exit();
});
