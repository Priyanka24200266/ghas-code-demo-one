
const express = require("express");
const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;
/*
Vulnerability 1
Command Injection
*/
app.get("/ping", (req, res) => {
    const host = req.query.host;
    child_process.exec(
        "ping -c 1 " + host,
        (err, stdout) => {
            res.send(stdout);
        }
    );
});
/*
Vulnerability 2
Path Traversal
*/
app.get("/read", (req, res) => {
    const fileName = req.query.file;
    const filePath = path.join(
        __dirname,
        fileName
    );
    const content =
        fs.readFileSync(filePath);
    res.send(content);
});
/*
Vulnerability 3
Reflected XSS
*/
app.get("/hello", (req, res) => {
    const name = req.query.name;
    res.send(
        "<h1>Hello " + name + "</h1>"
    );
});
app.listen(port);

