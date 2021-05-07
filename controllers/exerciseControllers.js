const { response } = require('express');
const GoalsDAO = require('../models/exerciseModel');

const Mail = require('nodemailer/lib/mailer');


const db = new GoalsDAO('newgoals.db'); 



exports.goals_list = function(req, res) {
    
    console.log('logged in as ', req.oidc.user.nickname, cgc, icgc);
    db.getUserGoals(req.oidc.user.nickname).then((list) => {
        list = list.filter(goal => (goal.endDate)).sort(function(a, b){
            return new Date(a.endDate) - new Date(b.endDate);});
        complete = list.filter(goal => (goal.achieved));
        incomplete = list.filter(goal => (!goal.achieved));
        overdue = list.filter(goal => (goal.overdue));
        
        var completeGoalsCount = Object.keys(complete).length;
        var incompleteGoalsCount = Object.keys(incomplete).length;
        var overdueGoals = Object.keys(overdue).length;
        res.render('goalsb', {
            'title': 'Completed Goals',
            'goals': list,
            'user': req.oidc.user.nickname,
            'completedgoalscount': completeGoalsCount,
            'incompletegoalscount': incompleteGoalsCount, 
            'overduegoalscount' : overdueGoals,
        });
        console.log('Promise Resolved');
    }).catch((err)=>{
        console.log('Promise Rejected ', err);
    });
};

exports.user_goals_list = function(req, res) {

    console.log('logged in as ', req.oidc.user.nickname);
    var date = new Date().toISOString().split('T')[0];
        console.log('today is ' ,date);
        db.overdueGoals(date);
        db.getUserGoals(req.oidc.user.nickname).then((list) => {
            list = list.filter(goal => (goal.endDate)).sort(function(a, b){
                return new Date(a.endDate) - new Date(b.endDate);});
            complete = list.filter(goal => (goal.achieved));
            incomplete = list.filter(goal => (!goal.achieved));
            overdue = list.filter(goal => (goal.overdue));
            
            var completeGoalsCount = Object.keys(complete).length;
            var incompleteGoalsCount = Object.keys(incomplete).length;
            var overdueGoals = Object.keys(overdue).length;
            res.render('goalsb', {
                'title': 'Completed Goals',
                'goals': list,
                'activities': list.activities,
                'user': req.oidc.user.nickname,
                'completedgoalscount': completeGoalsCount,
                'incompletegoalscount': incompleteGoalsCount, 
                'overduegoalscount' : overdueGoals, 
        });
        console.log('Promise Resolved');
    }).catch((err)=>{
        console.log('Promise Rejected ', err);
    });
};

exports.seed = function(req, res) {
    db.seedDb(req.oidc.user.nickname);
    console.log('Database seeded');
    res.redirect('/');
};

exports.post_new_goal = function(req, res) {
    if (!req.oidc.user.nickname) {
        response.status(400).send("Entries must have an author.");
        return;
    }  
        console.log('attempting to add in post ', req.oidc.user.nickname, req.body.exercise, req.body.details, req.body.endDate);
        let endDate;
        let num1 = req.body.endDate1;
        let num2 = req.body.endDate2;
        let num3 = req.body.endDate3;

        if(num1 >= num2 && num1 >= num3)
        {endDate = num1;}
        else if (num2 >= num1 && num2 >= num3){endDate = num2;}
        else {endDate = num3;}
        db.addGoal(req.oidc.user.nickname, req.body.goalname, req.body.exercise1, num1,req.body.details1, req.body.exercise2, num2,req.body.details2, req.body.exercise3, num3,req.body.details3, endDate);
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




exports.landing_page = function(req, res) {

    if(!req.oidc.user)
    {
        console.log('basic landing page after login with no user');
        res.render('goals', {
            'title': 'Exercise Goals',
            'greeting': 'Welcome to Goal Getters, please Login to continue' 
        });
    
    }
    else{
        let user = req.oidc.user;
        var date = new Date().toISOString().split('T')[0];
        console.log('today is ' ,date);
        db.overdueGoals(date);
    console.log('basic landing page after login with ', user);
    db.getUserGoals(req.oidc.user.nickname).then((list) => {
        list = list.filter(goal => (goal.endDate)).sort(function(a, b){
            return new Date(a.endDate) - new Date(b.endDate);});
        complete = list.filter(goal => (goal.achieved));
        incomplete = list.filter(goal => (!goal.achieved));
        overdue = incomplete.filter(goal => (goal.overdue));
        
        var completeGoalsCount = Object.keys(complete).length;
        var incompleteGoalsCount = Object.keys(incomplete).length;
        var overdueGoals = Object.keys(overdue).length;
        res.render('goalsb', {
            'title': 'Completed Goals',
            'plan': list,
            'user': req.oidc.user.nickname,
            'completedgoalscount': completeGoalsCount,
            'incompletegoalscount': incompleteGoalsCount, 
            'overduegoalscount' : overdueGoals, 
        });
        console.log('Promise Resolved');
    }).catch((err)=>{
        console.log('Promise Rejected ', err);
    });}
};

exports.incomplete_goals = function(req, res) {
    db.getUserGoals(req.oidc.user.nickname).then((list) => {
        list = list.filter(goal => (goal.endDate)).sort(function(a, b){
            return new Date(a.endDate) - new Date(b.endDate);});
        complete = list.filter(goal => (goal.achieved));
        incomplete = list.filter(goal => (!goal.achieved));
        overdue = incomplete.filter(goal => (goal.overdue));
        
        var completeGoalsCount = Object.keys(complete).length;
        var incompleteGoalsCount = Object.keys(incomplete).length;
        var overdueGoals = Object.keys(overdue).length;
        res.render('goalsb', {
            'title': 'Completed Goals',
            'plan': incomplete,
            'user': req.oidc.user.nickname,
            'completedgoalscount': completeGoalsCount,
            'incompletegoalscount': incompleteGoalsCount, 
            'overduegoalscount' : overdueGoals, 
       });
       console.log('Promise Resolved');
   }).catch((err)=>{
       console.log('Promise Rejected ', err);
   });
};

exports.user_incomplete_goals_list = function(req, res) {
    
    console.log('logged in as ', req.oidc.user.nickname);
    db.getUserGoals(req.oidc.user.nickname).then((list) => {
        list = list.filter(goal => (goal.endDate)).sort(function(a, b){
            return new Date(a.endDate) - new Date(b.endDate);});
        complete = list.filter(goal => (goal.achieved));
        incomplete = list.filter(goal => (!goal.achieved));
        overdue = incomplete.filter(goal => (goal.overdue));
        
        var completeGoalsCount = Object.keys(complete).length;
        var incompleteGoalsCount = Object.keys(incomplete).length;
        var overdueGoals = Object.keys(overdue).length;
        res.render('goalsb', {
            'title': 'Completed Goals',
            'plan': incomplete,
            'user': req.oidc.user.nickname,
            'completedgoalscount': completeGoalsCount,
            'incompletegoalscount': incompleteGoalsCount, 
            'overduegoalscount' : overdueGoals,
        });
        console.log('Promise Resolved');
    }).catch((err)=>{
        console.log('Promise Rejected ', err);
    });
};

exports.completed_goals = function(req, res) {
    
    db.getUserGoals(req.oidc.user.nickname).then((list) => {
        list = list.filter(goal => (goal.endDate)).sort(function(a, b){
            return new Date(a.endDate) - new Date(b.endDate);});
        complete = list.filter(goal => (goal.achieved));
        incomplete = list.filter(goal => (!goal.achieved));
        overdue = incomplete.filter(goal => (goal.overdue));
        
        var completeGoalsCount = Object.keys(complete).length;
        var incompleteGoalsCount = Object.keys(incomplete).length;
        var overdueGoals = Object.keys(overdue).length;
        res.render('goalsb', {
            'title': 'Completed Goals',
            'plan': complete,
            'user': req.oidc.user.nickname,
            'completedgoalscount': completeGoalsCount,
            'incompletegoalscount': incompleteGoalsCount, 
            'overduegoalscount' : overdueGoals,
       });
       console.log('Promise Resolved');
   }).catch((err)=>{
       console.log('Promise Rejected ', err);
   });
};

exports.user_completed_goals_list = function(req, res) {
    console.log('logged in as ', req.oidc.user.nickname);
    db.getUserGoals(req.oidc.user.nickname).then((list) => {
        list = list.filter(goal => (goal.endDate)).sort(function(a, b){
            return new Date(a.endDate) - new Date(b.endDate);});
        complete = list.filter(goal => (goal.achieved));
        incomplete = list.filter(goal => (!goal.achieved));
        overdue = incomplete.filter(goal => (goal.overdue));
        
        var completeGoalsCount = Object.keys(complete).length;
        var incompleteGoalsCount = Object.keys(incomplete).length;
        var overdueGoals = Object.keys(overdue).length;
        res.render('goalsb', {
            'title': 'Completed Goals',
            'plan': complete,
            'user': req.oidc.user.nickname,
            'completedgoalscount': completeGoalsCount,
            'incompletegoalscount': incompleteGoalsCount, 
            'overduegoalscount' : overdueGoals, 
        });
        console.log('Promise Resolved');
    }).catch((err)=>{
        console.log('Promise Rejected ', err);
    });
};

exports.user_completed_goals_list = function(req, res) {
    console.log('logged in as ', req.oidc.user.nickname);
    db.getUserGoals(req.oidc.user.nickname).then((list) => {
        list = list.filter(goal => (goal.endDate)).sort(function(a, b){
            return new Date(a.endDate) - new Date(b.endDate);});
        complete = list.filter(goal => (goal.achieved));
        incomplete = list.filter(goal => (!goal.achieved));
        overdue = incomplete.filter(goal => (goal.overdue));
        
        var completeGoalsCount = Object.keys(complete).length;
        var incompleteGoalsCount = Object.keys(incomplete).length;
        var overdueGoals = Object.keys(overdue).length;
        res.render('goalsb', {
            'title': 'Completed Goals',
            'plan': complete,
            'user': req.oidc.user.nickname,
            'completedgoalscount': completeGoalsCount,
            'incompletegoalscount': incompleteGoalsCount, 
            'overduegoalscount' : overdueGoals,
        });
        console.log('Promise Resolved');
    }).catch((err)=>{
        console.log('Promise Rejected ', err);
    });
};

exports.user_overdue_goals_list = function(req, res) {
    console.log('logged in as ', req.oidc.user.nickname);
    db.getUserGoals(req.oidc.user.nickname).then((list) => {
        list = list.filter(goal => (goal.endDate)).sort(function(a, b){
            return new Date(a.endDate) - new Date(b.endDate);});
        complete = list.filter(goal => (goal.achieved));
        incomplete = list.filter(goal => (!goal.achieved));
        overdue = incomplete.filter(goal => (goal.overdue));
        
        var completeGoalsCount = Object.keys(complete).length;
        var incompleteGoalsCount = Object.keys(incomplete).length;
        var overdueGoals = Object.keys(overdue).length;
        res.render('goalsb', {
            'title': 'Completed Goals',
            'plan': overdue,
            'user': req.oidc.user.nickname,
            'completedgoalscount': completeGoalsCount,
            'incompletegoalscount': incompleteGoalsCount, 
            'overduegoalscount' : overdueGoals,
        });
        console.log('Promise Resolved');
    }).catch((err)=>{
        console.log('Promise Rejected ', err);
    });
};

exports.overdue_goal = function(req, res){
    console.log('setting goals as overdue ');
    db.overdueGoals();
    res.redirect('/');
    //res.send('<h1>Not yet implemented: Delete the goal</h1>')
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
            'title': 'Complete Goal',
            'goals': goals,
            'user': req.oidc.user.nickname, 
        });
    }).catch((err) => {
        console.log('error handling goal ', err);
    });
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

    exports.goals_list = function(req, res) {
    db.getAllGoals().then((list) => {
        res.render('goalsb', {
            'title': 'All Goals',
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
    console.log('sharing goal with id ', req.params.id);
    let goal = req.params.id;
    let user = req.oidc.user;
    db.getGoal(goal).then((goals) => {
        res.render('shareGoal', {
            'title': 'Share Goal',
            'goals': goals,
            'user': user.nickname, 
            'from': user.email,
        });
    }).catch((err) => {
        console.log('error handling goal ', err);
    });
};

exports.post_share_goal = function(req, res) {
    if (!req.oidc.user.nickname) {
        response.status(400).send("Entries must have a user.");
        return;
    }  
        let message = {
          exercise: req.body.exercise,
          details: req.body.details,
          recipient: req.body.recipient,
          from: req.oidc.user.email,

        };
        console.log('attempting to email goal in post ',req.oidc.user.nickname, req.body.exercise, req.body.details, message);
       
        db.shareGoal(message);
        res.redirect('/');
    
};

exports.new_goal = function(req, res) {
    res.render('newGoal', { 'title': 'Add a new goal',
    'user': req.oidc.user.nickname, });
    
};

// exports.edit_goal = function(req, res) {
//     res.render('editGoal', { 'title': 'Edit the goal',
// 'id': req.params.id})
    
// }



