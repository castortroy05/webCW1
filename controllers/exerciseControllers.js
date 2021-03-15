const { response } = require('express');
const GoalsDAO = require('../models/exerciseModel');

const db = new GoalsDAO();

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
    db.init();
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
    //db.init();
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

exports.about_page = function(req, res) {
    res.send('<h1>Not yet implemented: show an about page</h1>');
}

exports.new_goal = function(req, res) {
    res.render('newGoal', { 'title': 'Add a new goal'})
    
}

