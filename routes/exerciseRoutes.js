const express = require('express');

const router = express.Router();

const controller = require('../controllers/exerciseControllers.js');

router.get("/", controller.landing_page);

const { requiresAuth } = require('express-openid-connect');
const { json } = require('express');



router.get('/user/profile', requiresAuth(), (req, res) => {
    res.render('profile', {
        'title': 'User Profile',
        'picture': req.oidc.user.picture,
        'nickname': req.oidc.user.nickname,
        'name': req.oidc.user.name,
        'email': req.oidc.user.email,
        'updated': req.oidc.user.updated_at,
        'user': req.oidc.user.nickname, 
    });
  //res.send(JSON.stringify(req.oidc.user));
});


//CRUD Pages
router.get('/goals/new', requiresAuth(), controller.new_goal);

router.post('/goals/new', requiresAuth(), controller.post_new_goal);

router.get('/goals/delete/:id', requiresAuth(), controller.delete_goal);

router.get('/goals/completegoal/:id', requiresAuth(), controller.complete_goal);

router.get('/goals/edit/:id', requiresAuth(), controller.edit_goal);

router.post('/goals/edit/:id', requiresAuth(), controller.post_update_goal);

router.get('/goals/share/:id', requiresAuth(), controller.share_goal);

router.post('/goals/share/:id', requiresAuth(), controller.post_share_goal);




//goals pages

router.get('/goals/allgoals', requiresAuth(), controller.user_goals_list);

router.get('/goals/incomplete', requiresAuth(), controller.user_incomplete_goals_list);

router.get('/goals/complete', requiresAuth(), controller.user_completed_goals_list);

router.get('/goals/overdue', requiresAuth(), controller.user_overdue_goals_list);

router.get('/goals/week/:id',requiresAuth(), controller.view_week_goals);

router.get('/goals/:user', requiresAuth(), controller.user_goals_list);




//testing pages

router.get('/checkod', requiresAuth(), controller.overdue_goal_check);

router.use('/dbseed', requiresAuth(), controller.seed);







//router.get('/goals/sharegoal/:id', requiresAuth(), controller.share_goal);

//router.post('/goals/sharegoal/:id', requiresAuth(), controller.post_share_goal);

//router.post('/completegoal/:id', requiresAuth(), controller.post_complete_goal);








//error pages
router.use(function( req, res) {
    res.render('error', {
        'title': 'Error Page',
        'status': 404,
        'message': 'Page not found',    
    });
    res.status(404);
});

router.use(function(err, req, res, next) {
     res.render('error', {
        'title': 'Error Page',
        'status': 500,
        'message': 'Internal server error, system borked',
        'error': JSON.stringify(err)
    });
    res.status(500);
    console.log(err);
});


//export the module
module.exports = router;