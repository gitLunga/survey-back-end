const db = require('../config/db');

exports.createSurvey = (req, res) => {
    const {
        fullName,
        email,
        age,
        birthDate,
        favoriteFood,
        eatOutRating,
        watchMoviesRating,
        watchTvRating,
        listenToRadioRating
    } = req.body;

    // Handle favoriteFood (convert to string if it's an array)
    const favoriteFoodValue = Array.isArray(favoriteFood) 
        ? favoriteFood.join(',') 
        : favoriteFood;

    const sql = `INSERT INTO surveys 
        (full_name, email, age, birth_date, favorite_food, eat_out_rating, 
         watch_movies_rating, watch_tv_rating, listen_to_radio_rating) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [
        fullName, 
        email, 
        age, 
        birthDate, 
        favoriteFoodValue, 
        eatOutRating, 
        watchMoviesRating, 
        watchTvRating, 
        listenToRadioRating
    ], (error, results) => {
        if (error) {
            console.error('Survey submission error:', error);
            return res.status(500).json({ message: 'Error submitting survey' });
        }
        
        res.status(201).json({ 
            message: 'Survey submitted successfully', 
            id: results.insertId 
        });
    });
};

exports.getSurveyResults = (req, res) => {
    db.query('SELECT * FROM surveys', (error, surveys) => {
        if (error) {
            console.error('Survey results error:', error);
            return res.status(500).json({ message: 'Error fetching survey results' });
        }
        
        if (surveys.length === 0) {
            return res.json({ message: 'No surveys available' });
        }

        const totalSurveys = surveys.length;
        const ages = surveys.map(s => s.age);
        const avgAge = (ages.reduce((a, b) => a + b, 0) / totalSurveys);
        const oldest = Math.max(...ages);
        const youngest = Math.min(...ages);
        
        // Calculate food preferences
        const pizzaLovers = surveys.filter(s => s.favorite_food.includes('Pizza')).length;
        const pastaLovers = surveys.filter(s => s.favorite_food.includes('Pasta')).length;
        const papWorsLovers = surveys.filter(s => s.favorite_food.includes('Pap and Wors')).length;
        
        // Calculate average ratings
        const avgRatings = {};
        ['eat_out', 'watch_movies', 'listen_to_radio', 'watch_tv'].forEach(prefix => {
            const sum = surveys.reduce((total, s) => total + s[`${prefix}_rating`], 0);
            avgRatings[`${prefix}Rating`] = (sum / totalSurveys).toFixed(1);
        });

        res.json({
            totalSurveys,
            avgAge: avgAge.toFixed(1),
            oldest,
            youngest,
            pizzaPercentage: ((pizzaLovers / totalSurveys) * 100).toFixed(1),
            pastaPercentage: ((pastaLovers / totalSurveys) * 100).toFixed(1),
            papWorsPercentage: ((papWorsLovers / totalSurveys) * 100).toFixed(1),
            ...avgRatings
        });
    });
};