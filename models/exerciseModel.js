const { rejects } = require('assert');
const nedb = require('nedb');
const { resolve } = require('path');
const weekNumber = require('current-week-number');

class Goals{
constructor(dbFilePath) {
    if(dbFilePath)
    {
    this.db = new nedb({ filename: dbFilePath, autoload: true});
    console.log('Connected to database ' + dbFilePath);
    } else {
        this.db = new nedb();
        console.log('In memory database loaded');
    }
}

//a function to load some data into the database
init() {
    this.db.insert({
        exercise: 'squats',
        details: '1000 squats',
        started: '2020-02-16',
        endDate: '2020-03-17',
        user: 'Peter',
        achieved: false,
        colour: warning

    });
    // terminal notification for later debugging
    console.log('db entry Peter inserted');

}
    seedDb() {
        this.db.insert({
            exercise: 'Walking',
            details: '5 Km walk',
            started: '2020-03-16',
            endDate: '2020-03-17',
            user: 'Katrin',
            achieved: false,
            colour: 'warning'
    
        });
        // terminal notification for later debugging
        console.log('db entry Katrin inserted');

        this.db.insert({
            exercise: 'Jogging',
            details: '10 Km jog',
            started: '2020-03-16',
            endDate: '2020-03-17',
            user: 'James',
            achieved: false,
            colour: 'warning'
    
        });
        // terminal notification for later debugging
        console.log('db entry James inserted');

        this.db.insert({
            exercise: 'Running',
            details: '15 Km run',
            started: '2020-03-16',
            endDate: '2020-03-17',
            user: 'Joshua',
            achieved: false,
            colour: 'warning'
    
        });
        // terminal notification for later debugging
        console.log('db entry Joshua inserted');

        this.db.insert({
            exercise: 'Climbing',
            details: '150m Free Climb',
            started: '2020-03-16',
            endDate: '2020-03-17',
            user: 'Sam',
            achieved: true,
            colour: 'success'
    
        });
        // terminal notification for later debugging
        console.log('db entry Sam inserted');


}
//function to obtain all goals from the database
getAllGoals(){
    return new Promise((resolve, reject) => {
        this.db.find({}, function(err, goals){
            if (err){
            reject(err);
             } else {
        resolve(goals);
        console.log('function getAllGoals() returns ', goals);
    }   
    });
    });
}

getUserGoals(user){
    return new Promise((resolve, reject) => {
        this.db.find({user: user}, function(err, goals){
            if (err){
            reject(err);
             } else {
        resolve(goals);
        console.log('function getUserGoals(user) returns ',user , goals);
    }   
    });
    });
}

getAllCompletedGoals(){
    return new Promise((resolve, reject) => {
        this.db.find({achieved: true}, function(err, goals){
            if (err){
            reject(err);
             } else {
        resolve(goals);
        console.log('function all() returns ', goals);
    }   
    });
    });
}

getUserCompletedGoals(user){
    return new Promise((resolve, reject) => {
        this.db.find({user: user, achieved: true,}, function(err, goals){
            if (err){
            reject(err);
             } else {
        resolve(goals);
        console.log('function all() returns ', goals);
    }   
    });
    });
}


getAllIncompleteGoals(){
    return new Promise((resolve, reject) => {
        this.db.find({achieved: false}, function(err, goals){
            if (err){
            reject(err);
             } else {
        resolve(goals);
        console.log('function all() returns ', goals);
    }   
    });
    });
}

getUserIncompleteGoals(user){
    return new Promise((resolve, reject) => {
        this.db.find({user: user,achieved: false}, function(err, goals){
            if (err){
            reject(err);
             } else {
        resolve(goals);
        console.log('function all() returns ', goals);
    }   
    });
    });
}

getGoal(id){
    return new Promise((resolve, reject) => {
        this.db.find({_id: id}, function(err, goals){
            if (err){
            reject(err);
             } else {
        resolve(goals);
        console.log('function getGoal() returns ', goals);
    }   
    });
    });
}

addGoal(user, exercise, details, endDate) {
    dueWeek = weekNumber(endDate);
    console.log(dueWeek);
console.log('attempting to add', user, exercise, details, endDate, dueWeek);
var goal = {
    user: user,
    exercise: exercise,
    details: details,
    endDate: endDate,
    started: new Date().toISOString().split('T')[0],
    achieved: false,
    overdue: false,
    colour: 'warning'

};
console.log('goal created', goal);



this.db.insert(goal, function(err, doc) {
    if (err) {
        console.log('Error inserting goals', exercise);
    } else {
        console.log('document inserted into the database', doc);
    }
});
}

updateGoal(id, exercise, details, endDate) {
    console.log('attempting to update', exercise, details, endDate, ' to post id ', id);
    // console.log('goal created', goal);
    this.db.update({_id: id},{$set: { exercise: exercise, details: details, endDate: endDate }}, function(err, doc) {
        if (err) {
            console.log('Error inserting goals', exercise);
        } else {
            console.log('document updated in the database', doc);
        }
    });
    }


    completeGoal(id) {
        console.log('attempting to complete post id ', id);
        // console.log('goal created', goal);
        this.db.update({_id: id},{$set: { achieved: true, colour: 'success' }}, function(err, doc) {
            if (err) {
                console.log('Error inserting goals', id);
            } else {
                console.log('document updated in the database', doc);
            }
        });
        }



deleteGoal(goalId){
    this.db.remove({_id: goalId }, {}, function(err, goalRem) {
        if(err) {
            console.log('Error deleting goal ' + goalId);
        } else {
            console.log(goalRem, ' goals removed from the database ');
        }
        });
    }    

}


//export the module
module.exports = Goals;