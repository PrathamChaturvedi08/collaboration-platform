const express = require("express");

const app = express();

/*Middleware*/
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/api/users", (req, res) => {
  res.json([
    {
      id: 1,
      name: "Pratham",
    },
    {
      id: 2,
      name: "Rahul",
    },
  ]);
});

app.post("/api/users", (req, res) => {
  console.log(req.body);

  res.json({
    success: true,
    receivedData: req.body,
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
