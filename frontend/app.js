const express = require("express");
const path = require("path");

const webApiRouter = require("./routes/webApiRoutes");

const app = express();
const publicDir = path.join(__dirname, "public");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/web-api", webApiRouter);
app.use(express.static(publicDir));

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

module.exports = app;
