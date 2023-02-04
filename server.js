const express = require("express");
const app = express();

// port
const PORT =  5000;
app.get("/", (req, res) => res.send("Api is Running"))
app.listen(PORT,() => {
  console.log(`Running Server on PORT ${PORT}`);
});
// const express = require('express')
// const app = express()
// const port = 3000

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })