const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/health", function (req, res) {
  res.json({ status: "ok" });
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, function () {
  console.log("Budget Buddy is running at http://localhost:" + PORT);
});
