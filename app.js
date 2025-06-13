const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const surveyRoutes = require('./routes/surveyRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api', surveyRoutes);

// Error handling
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});