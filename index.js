const express = require('express');
const app = express();
app.use(express.json());

const territoriesRoutes = require('./routes/territories');
const peopleRoutes = require('./routes/people');

app.use('/territories', territoriesRoutes);
app.use('/people', peopleRoutes);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});

