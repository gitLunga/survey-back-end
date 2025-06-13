const express = require('express');
const surveyController = require('../controllers/surveyController');

const router = express.Router();

router.post('/surveys', surveyController.createSurvey);
router.get('/survey-results', surveyController.getSurveyResults);

module.exports = router;