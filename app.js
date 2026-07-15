const express = require("express");
const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;
function validateHost(host){
   return /^[A-Za-z0-9.-]+$/
           .test(host);
}
function escapeHtml(text){
 return text
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;");
}
/*
FIX COMMAND INJECTION
*/
app.get("/ping", (req,res)=>{
 const host =
      req.query.host;
 if(!validateHost(host))
 {
   return res.status(400)
             .send("Invalid");
 }
 child_process.execFile(
    "ping",
    ["-c","1",host],
    (err,stdout)=>{
      res.send(stdout);
    }
 );
});
/*
FIX PATH TRAVERSAL
*/
app.get("/read",(req,res)=>{
 const allowed =
    ["README.md"];
 const file =
    req.query.file;
 if(
   !allowed.includes(file)
 ){
   return res.send(
      "Not Allowed"
   );
 }
 const content=
   fs.readFileSync(file);
 res.send(content);
});
/*
FIX XSS
*/
app.get("/hello",(req,res)=>{
 const safeName=
 escapeHtml(
    req.query.name
 );
 res.send(
  "<h1>Hello "
  + safeName
  +"</h1>"
 );
});
app.listen(port);
