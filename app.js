const express = require("express");
const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");
const app = express();
const port = 3000;
function validateHost(host) {
   return typeof host === "string" && /^[A-Za-z0-9.-]+$/.test(host);
}

const readLimiter = rateLimit({
   windowMs: 60 * 1000,
   max: 10,
   standardHeaders: true,
   legacyHeaders: false,
});
/*
FIX COMMAND INJECTION
*/
app.get("/unsafe-demo", (req, res) => {
   const input = req.query.input;
   if (!validateHost(input)) {
      return res.status(400).send("Invalid host");
   }

   const pingArgs = process.platform === "win32" ? ["-n", "1", input] : ["-c", "1", input];
   child_process.execFile("ping", pingArgs, (err, stdout) => {
      if (err) {
         return res.status(500).send("Ping failed");
      }
      return res.type("text/plain").send(stdout);
   });
});
/*
FIX PATH TRAVERSAL
*/
app.get("/read", readLimiter, (req, res) => {
      const allowed = ["README.md"];
      const file = req.query.file;
      if (typeof file !== "string" || !allowed.includes(file)) {
            return res.status(403).send("Not Allowed");
      }

      const filePath = path.join(__dirname, file);
      const content = fs.readFileSync(filePath, "utf8");
      return res.type("text/plain").send(content);
});
/*
FIX XSS
*/
app.get("/hello", (req, res) => {
   const name = typeof req.query.name === "string" ? req.query.name : "World";
   return res.type("text/plain").send(`Hello ${name}`);
});
app.listen(port);
