const { response } = require('express');
const GoalsDAO = require('../models/exerciseModel');

const Mail = require('nodemailer/lib/mailer');


const db = new GoalsDAO('newgoals.db'); 




//list Goals Functions
exports.goals_list = function(req, res) {
    
    console.log('logged in as ', req.oidc.user.nickname, cgc, icgc);
    db.getUserGoals(req.oidc.user.nickname).then((list) => {
        list = list.filter(goal => (goal.endDate)).sort(function(a, b){
            return new Date(a.endDate) - new Date(b.endDate);});
        complete = list.filter(goal => (goal.achieved));
        incomplete = list.filter(goal => (!goal.achieved && !goal.overdue));
        overdue = list.filter(goal => (goal.overdue));
        
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
    });
};

exports.user_goals_list = function(req, res) {

    console.log('logged in as ', req.oidc.user.nickname);
    var date = new Date().toISOString().split('T')[0];
        console.log('today is ' ,date);
       // db.overdueGoals(date);
        db.getUserGoals(req.oidc.user.nickname).then((list) => {
            list = list.filter(goal => (goal.endDate)).sort(function(a, b){
                return new Date(a.endDate) - new Date(b.endDate);});
            complete = list.filter(goal => (goal.achieved));
            incomplete = list.filter(goal => (!goal.achieved && !goal.overdue));
            overdue = list.filter(goal => (goal.overdue));
            
            var completeGoalsCount = Object.keys(complete).length;
            var incompleteGoalsCount = Object.keys(incomplete).length;
            var overdueGoals = Object.keys(overdue).length;
            res.render('goalsb', {
                'title': 'Completed Goals',
                'plan': list,
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

exports.incomplete_goals = function(req, res) {
    db.getUserGoals(req.oidc.user.nickname).then((list) => {
        list = list.filter(goal => (goal.endDate)).sort(function(a, b){
            return new Date(a.endDate) - new Date(b.endDate);});
        complete = list.filter(goal => (goal.achieved));
        incomplete = list.filter(goal => (!goal.achieved && !goal.overdue));
        overdue = incomplete.filter(goal => (goal.overdue));
        
        var completeGoalsCount = Object.keys(complete).length;
        var incompleteGoalsCount = Object.keys(incomplete).length;
        var overdueGoals = Object.keys(overdue).length;
        res.render('goalsb', {
            'title': 'Incomplete Goals',
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
        incomplete = list.filter(goal => (!goal.achieved && !goal.overdue));
        overdue = incomplete.filter(goal => (goal.overdue));
        
        var completeGoalsCount = Object.keys(complete).length;
        var incompleteGoalsCount = Object.keys(incomplete).length;
        var overdueGoals = Object.keys(overdue).length;
        res.render('goalsb', {
            'title': 'Incomplete Goals',
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
        incomplete = list.filter(goal => (!goal.achieved && !goal.overdue));
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
        incomplete = list.filter(goal => (!goal.achieved && !goal.overdue));
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
        incomplete = list.filter(goal => (!goal.achieved && !goal.overdue));
        overdue = list.filter(goal => (goal.overdue));
        console.log('over due goals are ', overdue);
        
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


exports.view_week_goals = function(req, res){
    db.getUserGoals(req.oidc.user.nickname).then((list) => {
        list = list.filter(goal => (goal.endDate)).sort(function(a, b){
            return new Date(a.endDate) - new Date(b.endDate);});
        complete = list.filter(goal => (goal.achieved));
        incomplete = list.filter(goal => (!goal.achieved && !goal.overdue));
        overdue = incomplete.filter(goal => (goal.overdue));
        week = list.filter(goal => goal.weekNo == req.params.id );
        
        var completeGoalsCount = Object.keys(complete).length;
        var incompleteGoalsCount = Object.keys(incomplete).length;
        var overdueGoals = Object.keys(overdue).length;
        res.render('goalsb', {
            'title': 'Completed Goals',
            'plan': week,
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



//CRUD functions


exports.post_new_goal = function(req, res) {
    if (!req.oidc.user.nickname) {
        response.status(400).send("Entries must have an author.");
        return;
    }  
        console.log('attempting to add in post ', req.oidc.user.nickname, req.body);
        let endDate;
        let num1 = req.body.endDate1;
        let num2 = req.body.endDate2;
        let num3 = req.body.endDate3;

        if(num1 >= num2 && num1 >= num3)
        {endDate = num1;}
        else if (num2 >= num1 && num2 >= num3){endDate = num2;}
        else {endDate = num3;}
        db.addGoal(req.oidc.user.nickname, req.body.goalname, req.body.exercise1, num1,req.body.details1, req.body.exercise2, num2,req.body.details2, req.body.exercise3, num3,req.body.details3, endDate);
        res.redirect('/goals/allgoals');
    
};

exports.post_update_goal = function(req, res) {
    if (!req.oidc.user.nickname) {
        response.status(400).send("Entries must have a user.");
        return;
    }  
        let endDate;
        let num1 = req.body.endDate[0];
        let num2 = req.body.endDate[1];
        let num3 = req.body.endDate[2];

        if(num1 >= num2 && num1 >= num3)
        {endDate = num1;}
        else if (num2 >= num1 && num2 >= num3){endDate = num2;}
        else {endDate = num3;}
        console.log('attempting to update goal in post ', req.oidc.user.nickname, req.body.exercise, req.body.details, req.body.endDate);
        db.updateGoal(req.params.id, req.body.goalname, req.body.exercise[0], num1,req.body.details[0], req.body.exercise[1], num2,req.body.details[1], req.body.exercise[2], num3,req.body.details[2], endDate);
        res.redirect('/goals/allgoals');
    
};

exports.new_goal = function(req, res) {
    res.render('newGoal', { 'title': 'Add a new goal',
    'user': req.oidc.user.nickname, });
    
};

exports.edit_goal = function(req, res){
    console.log('editing goal with id ', req.params.id);
    let goal = req.params.id;
    db.getGoal(goal).then((goals) => {
        res.render('editGoal', {
            'title': 'Edit Goal',
            'plan': goals,
            'user': req.oidc.user.nickname, 
        });
    }).catch((err) => {
        console.log('error handling goal ', err);
    });
};

exports.complete_goal = function(req, res){
    console.log('completing goal with id ', req.params.id);
    db.completeGoal(req.params.id);
        res.redirect('/goals/allgoals');
};

exports.delete_goal = function(req, res){
    console.log('deleting goal with id ', req.params.id);
    db.deleteGoal(req.params.id);
    res.redirect('/goals/allgoals');
    //res.send('<h1>Not yet implemented: Delete the goal</h1>')
};


exports.seed = function(req, res) {
    db.seedDb(req.oidc.user.nickname);
    console.log('Database seeded');
    res.redirect('/goals/allgoals');
};




exports.landing_page = function(req, res) {

    if(!req.oidc.user)
    {
        console.log('basic landing page after login with no user');
        res.render('index', {
            'title': 'Goal Getters Home Page',
            'greeting': 'Welcome to Goal Getters, please Login to continue' 
        });
    
    }
    else{
        let user = req.oidc.user;
        var date = new Date().toISOString().split('T')[0];
        console.log('today is ' ,date);
        //db.overdueGoals(date);
    console.log('basic landing page after login with ', user);


    res.render('index', {
        'title': 'Goal Getters Home Page',
        'greeting': 'Welcome to Goal Getters',
        'user': user.nickname,
        'plan': 'no goals',
        'home': true,
        'date': date,
    });

}
};




exports.overdue_goal_check = function(req, res){
    console.log('setting goals as overdue ');
    var date= new Date().toISOString().split('T')[0];
    db.getUserGoals(req.oidc.user.nickname).then((list) => {
        incomplete = list.filter(goal => (!goal.achieved && !goal.overdue));
        console.log('checking ', date, ' against ', list.endDate);
        overdue =list.filter(goal => (goal.endDate <= date));

        console.log('the overdue goals are', overdue);
        db.setOverdue(overdue);
        res.redirect('/goals/allgoals');
        console.log('Promise Resolved');
    }).catch((err)=>{
        console.log('Promise Rejected ', err);
    });};
    




// exports.post_complete_goal = function(req, res) {
//     if (!req.oidc.user.nickname) {
//         response.status(400).send("Entries must have a user.");
//         return;
//     }  
//         console.log('attempting to update goal in post ', req.oidc.user.nickname, req.body.exercise, req.body.details, req.body.endDate);
//         db.completeGoal(req.params.id);
//         res.redirect('/');
    
// };

    exports.goals_list = function(req, res) {
    db.getAllGoals().then((list) => {
        res.render('goalsb', {
            'title': 'All Goals',
            'plan': list,
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
            'plan': goals,
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
        res.redirect('/goals/allgoals');
    
};



// exports.edit_goal = function(req, res) {
//     res.render('editGoal', { 'title': 'Edit the goal',
// 'id': req.params.id})
    
// }



