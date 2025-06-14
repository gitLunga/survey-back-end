const db = require('../config/db');

exports.createSurvey = (req, res) => {
    const {
        fullName,
        email,
        birthDate,
        contactNumber,
        favoriteFood,
        eatOutRating,
        watchMoviesRating,
        listenToRadioRating,
        watchTvRating
    } = req.body;

    // Validate all required ratings are provided
    if (!eatOutRating || !watchMoviesRating || !listenToRadioRating || !watchTvRating) {
        return res.status(400).json({ 
            message: 'All rating questions must be answered',
            details: {
                missingRatings: {
                    eatOut: !eatOutRating,
                    movies: !watchMoviesRating,
                    radio: !listenToRadioRating,
                    tv: !watchTvRating
                }
            }
        });
    }

    const favoriteFoodValue = Array.isArray(favoriteFood) ? favoriteFood.join(',') : favoriteFood;

    const sql = `INSERT INTO surveys 
        (full_name, email, birth_date, contact_number, favorite_food, 
         eat_out_rating, watch_movies_rating, listen_to_radio_rating, watch_tv_rating) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [
        fullName, 
        email, 
        birthDate, 
        contactNumber || null,
        favoriteFoodValue, 
        eatOutRating, 
        watchMoviesRating, 
        listenToRadioRating, 
        watchTvRating
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
        
        // Calculate food preferences
        const pizzaLovers = surveys.filter(s => s.favorite_food.includes('Pizza')).length;
        const pastaLovers = surveys.filter(s => s.favorite_food.includes('Pasta')).length;
        const papWorsLovers = surveys.filter(s => s.favorite_food.includes('Pap and Wors')).length;
        
        // Calculate average ratings
        const avgEatOut = surveys.reduce((sum, s) => sum + s.eat_out_rating, 0) / totalSurveys;
        const avgMovies = surveys.reduce((sum, s) => sum + s.watch_movies_rating, 0) / totalSurveys;
        const avgRadio = surveys.reduce((sum, s) => sum + s.listen_to_radio_rating, 0) / totalSurveys;
        const avgTv = surveys.reduce((sum, s) => sum + s.watch_tv_rating, 0) / totalSurveys;

        res.json({
            totalSurveys,
            pizzaPercentage: ((pizzaLovers / totalSurveys) * 100).toFixed(1),
            pastaPercentage: ((pastaLovers / totalSurveys) * 100).toFixed(1),
            papWorsPercentage: ((papWorsLovers / totalSurveys) * 100).toFixed(1),
            avgEatOut: avgEatOut.toFixed(1),
            avgMovies: avgMovies.toFixed(1),
            avgRadio: avgRadio.toFixed(1),
            avgTv: avgTv.toFixed(1)
        });
    });
};