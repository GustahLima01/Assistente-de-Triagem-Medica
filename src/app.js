const express = require("express");
const router = require("./routes");
const { errorMiddleware } = require("./middlewares/errorMiddleware");
const { notFoundMiddleware } = require("./middlewares/notFoundMiddleware");
const testRoutes = require("./routes/testRoutes");

const app = express();

app.use(express.json());
app.use("/api/test", testRoutes);
app.use("/api", router);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
