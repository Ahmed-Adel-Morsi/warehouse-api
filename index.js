const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

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

app.get("/:collection", (req, res) => {
  const { collection } = req.params;
  const data = getData();
  res.json(data[collection] || []);
});

const generateId = () => {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const getDateNow = () => {
  return new Date();
};

app.post("/:collection", (req, res) => {
  try {
    const { collection } = req.params;
    const date = getDateNow();
    const newItem = {
      id: generateId(),
      ...req.body,
      createdAt: date,
      updatedAt: date,
    };
    const data = getData();
    if (!data[collection]) {
      data[collection] = [];
    }
    data[collection].push(newItem);
    saveData(data);
    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/:collection/:id", (req, res) => {
  const { collection, id } = req.params;
  const updatedItem = req.body;
  updatedItem.updatedAt = getDateNow();
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

app.delete("/:collection/:id", (req, res) => {
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

const port = 8080 || process.env.PORT;

app.listen(port, () => {
  console.log("Server is Running...");
});

module.exports = app;
