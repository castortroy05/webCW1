const express = require('express');

const router = express.Router();

const controller = require('../controllers/exerciseControllers.js');

router.get("/", controller.landing_page);

const { requiresAuth } = require('express-openid-connect');

router.get('/profile', requiresAuth(), (req, res) => {
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

router.get('/goals', requiresAuth(), controller.user_goals_list);

router.get('/incompletegoals', requiresAuth(), controller.user_incomplete_goals_list);

router.get('/completedgoals', requiresAuth(), controller.user_completed_goals_list);

router.get('/overduegoals', requiresAuth(), controller.user_overdue_goals_list);

router.get('/new', requiresAuth(), controller.new_goal);

router.post('/new', requiresAuth(), controller.post_new_goal);

router.get('/about', controller.about_page);

router.use('/dbseed', controller.seed);

router.get('/delete/:id', requiresAuth(), controller.delete_goal);

router.get('/view/:id', controller.view_goal);

router.get('/edit/:id', requiresAuth(), controller.edit_goal);

router.get('/completegoal/:id', requiresAuth(), controller.complete_goal);

router.post('/completegoal/:id', requiresAuth(), controller.post_complete_goal);

router.get('/sharegoal/:id', requiresAuth(), controller.share_goal);

router.post('/sharegoal/:id', requiresAuth(), controller.post_share_goal);

router.get('/posts/:user', requiresAuth(), controller.user_goals_list);

router.post('/edit/:id', requiresAuth(), controller.post_update_goal);

router.get('/share/:id', requiresAuth(), controller.share_goal);

router.post('/share/:id', requiresAuth(), controller.post_share_goal);

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
        'error': err
    });
    res.status(500);
    console.log(err);
});

module.exports = router;