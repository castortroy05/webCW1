const { response } = require('express');
const GoalsDAO = require('../models/exerciseModel');


const db = new GoalsDAO('newgoals.db');

const completeGoalsCount = db.getCompleteGoalCount(req.oidc.user.nickname);
const incomleteGoalsCount = db.getIncompleteGoalCount(req.oidc.user.nickname);

exports.goals_list = function(req, res) {
    console.log('logged in as ', req.oidc.user.nickname);
    db.getUserGoals(req.oidc.user.nickname).then((list) => {
        res.render('goals', {
            'title': 'Exercise Goals',
            'goals': list,
            'user': req.oidc.user.nickname,
            'completedgoalscount': completeGoalsCount,
            'incompletegoalscount': incomleteGoalsCount, 
        });
        console.log('Promise Resolved');
    }).catch((err)=>{
        console.log('Promise Rejected ', err);
    });
};

exports.user_goals_list = function(req, res) {
    console.log('logged in as ', req.oidc.user.nickname);
    db.getUserGoals(req.oidc.user.nickname).then((list) => {
        res.render('goalsb', {
            'title': 'Exercise Goals',
            'goals': list,
            'user': req.oidc.user.nickname, 
        });
        console.log('Promise Resolved');
    }).catch((err)=>{
        console.log('Promise Rejected ', err);
    });
};

exports.seed = function(req, res) {
    db.seedDb();
    console.log('Database seeded');
    res.redirect('/');
};

exports.post_new_goal = function(req, res) {
    if (!req.oidc.user.nickname) {
        response.status(400).send("Entries must have an author.");
        return;
    }  
        console.log('attempting to add in post ', req.oidc.user.nickname, req.body.exercise, req.body.details, req.body.endDate);
       db.addGoal(req.oidc.user.nickname, req.body.exercise, req.body.details, req.body.endDate);
        res.redirect('/');
    
};

exports.post_update_goal = function(req, res) {
    if (!req.oidc.user.nickname) {
        response.status(400).send("Entries must have a user.");
        return;
    }  
        console.log('attempting to update goal in post ', req.oidc.user.nickname, req.body.exercise, req.body.details, req.body.endDate);
       db.updateGoal(req.params.id, req.body.exercise, req.body.details, req.body.endDate);
        res.redirect('/');
    
};
exports.post_complete_goal = function(req, res) {
    if (!req.oidc.user.nickname) {
        response.status(400).send("Entries must have a user.");
        return;
    }  
        console.log('attempting to update goal in post ', req.oidc.user.nickname, req.body.exercise, req.body.details, req.body.endDate);
       db.completeGoal(req.params.id);
        res.redirect('/');
    
};

exports.landing_page = function(req, res) {

    if(!req.oidc.user)
    {
        console.log('basic landing page after login with no user');
        res.render('goals', {
            'title': 'Exercise Goals' 
        });
    
    }
    else{
        let user = req.oidc.user;
    console.log('basic landing page after login with ', user);
    db.getUserGoals(req.oidc.user.nickname).then((list) => {
        res.render('goals', {
            'title': 'Exercise Goals',
            'goals': list,
            'user': req.oidc.user.nickname, 
        });
        console.log('Promise Resolved');
    }).catch((err)=>{
        console.log('Promise Rejected ', err);
    });}
};

exports.incomplete_goals = function(req, res) {
    db.getAllIncompleteGoals().then((list) => {
       res.render('goals', {
           'title': 'Incomplete Goals',
           'goals': list,
           'user': req.oidc.user.nickname, 
       });
       console.log('Promise Resolved');
   }).catch((err)=>{
       console.log('Promise Rejected ', err);
   });
};

exports.user_incomplete_goals_list = function(req, res) {
    console.log('logged in as ', req.oidc.user.nickname);
    db.getUserIncompleteGoals(req.oidc.user.nickname).then((list) => {
        res.render('goals', {
            'title': 'Exercise Goals',
            'goals': list,
            'user': req.oidc.user.nickname, 
        });
        console.log('Promise Resolved');
    }).catch((err)=>{
        console.log('Promise Rejected ', err);
    });
};

exports.completed_goals = function(req, res) {
    db.getAllCompletedGoals().then((list) => {
       res.render('goals', {
           'title': 'Completed Goals',
           'goals': list,
           'user': req.oidc.user.nickname, 
       });
       console.log('Promise Resolved');
   }).catch((err)=>{
       console.log('Promise Rejected ', err);
   });
};

exports.user_completed_goals_list = function(req, res) {
    console.log('logged in as ', req.oidc.user.nickname);
    db.getUserCompletedGoals(req.oidc.user.nickname).then((list) => {
        res.render('goals', {
            'title': 'Exercise Goals',
            'goals': list,
            'user': req.oidc.user.nickname, 
        });
        console.log('Promise Resolved');
    }).catch((err)=>{
        console.log('Promise Rejected ', err);
    });
};


exports.delete_goal = function(req, res){
    console.log('deleting goal with id ', req.params.id);
    db.deleteGoal(req.params.id);
    res.redirect('/');
    //res.send('<h1>Not yet implemented: Delete the goal</h1>')
};

exports.view_goal = function(req, res){
    console.log('sharing goal with id ', req.params.id);
    db.shareGoal(req.params.id);
   // res.send('<h1>Not yet implemented: view the goal</h1>')
};

exports.edit_goal = function(req, res){
    console.log('editing goal with id ', req.params.id);
    let goal = req.params.id;
    let user = req.oidc.user.nickname;
    db.getGoal(goal).then((goals) => {
        res.render('editGoal', {
            'title': 'Edit Goal',
            'goals': goals,
            'user': req.oidc.user.nickname, 
        });
    }).catch((err) => {
        console.log('error handling goal ', err);
    });
};

exports.complete_goal = function(req, res){
    console.log('editing goal with id ', req.params.id);
    let goal = req.params.id;
    let user = req.oidc.user.nickname;
    db.getGoal(goal).then((goals) => {
        res.render('completeGoal', {
            'title': 'Edit Goal',
            'goals': goals,
            'user': req.oidc.user.nickname, 
        });
    }).catch((err) => {
        console.log('error handling goal ', err);
    });
};

    exports.goals_list = function(req, res) {
    db.getAllGoals().then((list) => {
        res.render('goals', {
            'title': 'Exercise Goals',
            'goals': list,
            'user': req.user
        });
        console.log('Promise Resolved');
    }).catch((err)=>{
        console.log('Promise Rejected ', err);
    });
};


exports.about_page = function(req, res) {
    res.send('<h1>Not yet implemented: show an about page</h1>');
};

exports.share_goal = function(req, res){
    res.send('<h1>Not yet implemented: share the goal</h1>');
};

exports.new_goal = function(req, res) {
    res.render('newGoal', { 'title': 'Add a new goal',
    'user': req.oidc.user.nickname, });
    
};

// exports.edit_goal = function(req, res) {
//     res.render('editGoal', { 'title': 'Edit the goal',
// 'id': req.params.id})
    
// }



