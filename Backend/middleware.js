const express=require("express");
const path=require("path");
const app=express();
const port=3500;

app.use(express.static("public"));

app.get("/",(req,res)=>{
    res.sendFile(__dirname + "/index.html")
});
app.listen((port),()=>{
    console.log(`Server is running on port no ${port}`);
});