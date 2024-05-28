const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors"); // Add this line

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "https://mywarehouse.vercel.app",
  })
);

const getData = () =>
  JSON.parse(fs.readFileSync(path.join(__dirname, "db.json")));
const saveData = (data) =>
  fs.writeFileSync(
    path.join(__dirname, "db.json"),
    JSON.stringify(data, null, 2)
  );

app.get("/api/:collection", (req, res) => {
  console.log("GET request received");
  const { collection } = req.params;
  const data = getData();
  res.json(data[collection] || []);
});

app.post("/api/:collection", (req, res) => {
  const { collection } = req.params;
  const newItem = req.body;
  const data = getData();
  data[collection].push(newItem);
  saveData(data);
  res.status(201).json(newItem);
});

app.put("/api/:collection/:id", (req, res) => {
  const { collection, id } = req.params;
  const updatedItem = req.body;
  const data = getData();
  const index = data[collection].findIndex((item) => item.id === id);
  if (index !== -1) {
    data[collection][index] = updatedItem;
    saveData(data);
    res.json(updatedItem);
  } else {
    res.status(404).send("Item not found");
  }
});

app.delete("/api/:collection/:id", (req, res) => {
  const { collection, id } = req.params;
  const data = getData();
  const index = data[collection].findIndex((item) => item.id === id);
  if (index !== -1) {
    const deletedItem = data[collection].splice(index, 1);
    saveData(data);
    res.json(deletedItem);
  } else {
    res.status(404).send("Item not found");
  }
});

module.exports = app;
