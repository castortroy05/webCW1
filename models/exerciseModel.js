const { rejects } = require('assert');
const nedb = require('nedb');
const { resolve } = require('path');

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
        author: 'Peter',
        achieved: false,
        colour: warning

    })
    // terminal notification for later debugging
    console.log('db entry Peter inserted');

}
    seedDb() {
        this.db.insert({
            exercise: 'Walking',
            details: '5 Km walk',
            started: '2020-03-16',
            endDate: '2020-03-17',
            author: 'Katrin',
            achieved: false,
            colour: 'warning'
    
        })
        // terminal notification for later debugging
        console.log('db entry Katrin inserted');

        this.db.insert({
            exercise: 'Jogging',
            details: '10 Km jog',
            started: '2020-03-16',
            endDate: '2020-03-17',
            author: 'James',
            achieved: false,
            colour: 'warning'
    
        })
        // terminal notification for later debugging
        console.log('db entry James inserted');

        this.db.insert({
            exercise: 'Running',
            details: '15 Km run',
            started: '2020-03-16',
            endDate: '2020-03-17',
            author: 'Joshua',
            achieved: false,
            colour: 'warning'
    
        })
        // terminal notification for later debugging
        console.log('db entry Joshua inserted');

        this.db.insert({
            exercise: 'Climbing',
            details: '150m Free Climb',
            started: '2020-03-16',
            endDate: '2020-03-17',
            author: 'Sam',
            achieved: true,
            colour: 'success'
    
        })
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
        console.log('function all() returns ', goals);
    }   
    })
    })
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
    })
    })
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
    })
    })
}

addGoal(author, exercise, details, endDate) {
console.log('attempting to add', author, exercise, details, endDate)
var goal = {
    author: author,
    exercise: exercise,
    details: details,
    endDate: endDate,
    started: new Date().toISOString().split('T')[0],
    achieved: false,
    colour: 'warning'

}
console.log('goal created', goal);

this.db.insert(goal, function(err, doc) {
    if (err) {
        console.log('Error inserting goals', exercise);
    } else {
        console.log('document inserted into the database', doc);
    }
})
}




deleteGoal(goalId){
    this.db.remove({_id: goalId }, {}, function(err, goalRem) {
        if(err) {
            console.log('Error deleting goal ' + goalId);
        } else {
            console.log(goalRem, ' goals removed from the database ');
        }
        })
    }    

}


//export the module
module.exports = Goals;