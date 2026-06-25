const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const tuitsRoutes = require('./routes/tuits');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

app.use('/minitwitter', authRoutes);
app.use('/minitwitter', tuitsRoutes);

app.listen(PORT, () => {
  console.log(`MiniTwitter API escuchando en http://localhost:${PORT}/minitwitter`);
});
