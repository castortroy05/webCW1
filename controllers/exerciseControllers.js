const { response } = require('express');
const GoalsDAO = require('../models/exerciseModel');

const db = new GoalsDAO('newgoals.db');

exports.goals_list = function(req, res) {
    db.getAllGoals().then((list) => {
        res.render('goals', {
            'title': 'Exercise Goals',
            'goals': list
        });
        console.log('Promise Resolved');
    }).catch((err)=>{
        console.log('Promise Rejected ', err);
    })
}

exports.seed = function(req, res) {
    db.seedDb();
    console.log('Database seeded')
    res.redirect('/');
}

exports.post_new_goal = function(req, res) {
    if (!req.body.author) {
        response.status(400).send("Entries must have an author.");
        return;
    }  
        console.log('attempting to add in post ', req.body.author, req.body.exercise, req.body.details, req.body.endDate)
       db.addGoal(req.body.author, req.body.exercise, req.body.details, req.body.endDate);
        res.redirect('/');
    
}
exports.landing_page = function(req, res) {
     db.getAllGoals().then((list) => {
        res.render('goals', {
            'title': 'Home Page',
            'goals': list
        });
        console.log('Promise Resolved');
    }).catch((err)=>{
        console.log('Promise Rejected ', err);
    })
}

exports.incomplete_goals = function(req, res) {
    db.getAllIncompleteGoals().then((list) => {
       res.render('goals', {
           'title': 'Incomplete Goals',
           'goals': list
       });
       console.log('Promise Resolved');
   }).catch((err)=>{
       console.log('Promise Rejected ', err);
   })
}

exports.completed_goals = function(req, res) {
    db.getAllCompletedGoals().then((list) => {
       res.render('goals', {
           'title': 'Completed Goals',
           'goals': list
       });
       console.log('Promise Resolved');
   }).catch((err)=>{
       console.log('Promise Rejected ', err);
   })
}

exports.delete_goal = function(req, res){
    res.send('<h1>Not yet implemented: Delete the goal</h1>')
}

exports.view_goal = function(req, res){
    res.send('<h1>Not yet implemented: view the goal</h1>')
}

exports.edit_goal = function(req, res){
    res.send('<h1>Not yet implemented: edit the goal</h1>')
}

exports.about_page = function(req, res) {
    res.send('<h1>Not yet implemented: show an about page</h1>');
}

exports.share_goal = function(req, res){
    res.send('<h1>Not yet implemented: share the goal</h1>')
}

exports.new_goal = function(req, res) {
    res.render('newGoal', { 'title': 'Add a new goal'})
    
}



