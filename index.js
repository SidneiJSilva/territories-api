const cors = require('cors');
const express = require('express');
const app = express();

app.use((req, res, next) => {
  console.log('REQUEST:', req.method, req.url, req.headers.origin);
  next();
});
app.use(cors({
  // origin: "https://territories-container.vercel.app",
  origin: "http://localhost:5174"
}));
app.use(express.json());

const territoriesRoutes = require('./routes/territories');
const peopleRoutes = require('./routes/people');

app.use('/territories', territoriesRoutes);
app.use('/people', peopleRoutes);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
