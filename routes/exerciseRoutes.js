const express = require('express');

const router = express.Router();

const controller = require('../controllers/exerciseControllers.js');

router.get("/", controller.landing_page);

router.get('/goals', controller.goals_list);

router.get('/incompletegoals', controller.incomplete_goals);

router.get('/completedgoals', controller.completed_goals);

router.get('/new', controller.new_goal);

router.post('/new', controller.post_new_goal);

router.get('/about', controller.about_page);

router.use('/dbseed', controller.seed);

router.get('delete/:_id', controller.delete_goal);

router.get('view/:_id', controller.view_goal);

router.get('edit/:_id', controller.edit_goal);

router.get('share/:_id', controller.share_goal);

router.use(function(req, res) {
    res.status(404);
    res.type('html');
    res.send('404 Not Found');
})

router.use(function(err, req, res, next) {
    res.status(500);
    res.type('html');
    res.send('Internal Server Error borked');
    console.log(err)
})

module.exports = router;