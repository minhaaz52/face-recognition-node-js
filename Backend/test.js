const http=require("http");

http.createServer((req,res)=>{
    res.write("hello minhaaz");
    res.end();
}).listen(3500)
console.log("Running");