import express from "express";

const PORT = 8000;
const app = express();

app.use(express.static('../test'));

app.get('/socket', (req, res) => {
  res.statusCode = 426;
  res.end('Upgrade required');
})

const server = app.listen(PORT, () => console.log(`Test Server on: ${PORT}`))
