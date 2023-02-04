const express = require("express");
const app = express();
const connectDB = require("./config/db");
// connection
connectDB();
// port
const PORT = 5000;
// routes
app.use("/api/user", require("./routes/apis/users"));
app.use("/api/auth", require("./routes/apis/auth"));
app.use("/api/posts", require("./routes/apis/posts"));
app.use("/api/profile", require("./routes/apis/profile"));
app.listen(PORT, () => {
  console.log(`Running Server on PORT ${PORT}`);
});
