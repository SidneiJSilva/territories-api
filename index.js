const express = require('express');
const app = express();
app.use(express.json());

const territoriesRoutes = require('./routes/territories');
// const pessoasRoutes = require('./routes/pessoas'); // futuro

app.use('/territories', territoriesRoutes);
// app.use('/pessoas', pessoasRoutes);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});

