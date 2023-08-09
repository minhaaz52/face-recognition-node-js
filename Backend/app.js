const express=require("express");
const path=require("path");
const app=express();
const port=3500;
const cors = require('cors');
const bodyParser = require('body-parser');
app.use(cors({ origin: 'http://localhost:5173' }));

// app.use(bodyParser.json());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static("public"));


require("./routes")(app);

app.set("view engine","ejs");

app.listen((port),()=>{
    console.log(`Server is running on port no ${port}`);
});