var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// cors to activate fe access
const cors = require("cors");

require("dotenv").config();

var indexRouter = require("./routes/index");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// cors to activate fe access
app.use(cors());

app.use("/api", indexRouter);

module.exports = app;
