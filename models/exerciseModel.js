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
        user: 'antony.lockhart',
            exercise: 'More Testing',
            details: 'More testing',
            endDate: '2021-05-12',
            started: '2021-05-06',
            achieved: false,
            weekNo: 19,
            overdue: false,
            colour: 'warning',

    });
    // terminal notification for later debugging
    console.log('db entry Peter inserted');

}
    seedDb() {
        this.db.insert({
            user: 'antony.lockhart',
            exercise: 'Testing 1',
            details: 'More testing',
            endDate: '2021-04-12',
            started: '2021-04-06',
            achieved: false,
            weekNo: 15,
            overdue: false,
            colour: 'warning',
    
        });
        // terminal notification for later debugging
        console.log('db entry Testing 1 inserted');

        this.db.insert({
            user: 'antony.lockhart',
            exercise: 'Testing 2',
            details: 'More testing',
            endDate: '2021-03-12',
            started: '2021-03-06',
            achieved: false,
            weekNo: 11,
            overdue: false,
            colour: 'warning',
    
        });
        // terminal notification for later debugging
        console.log('db entry Testing 2 inserted');

        this.db.insert({
            user: 'antony.lockhart',
            exercise: 'Testing 3',
            details: 'More testing',
            endDate: '2021-05-12',
            started: '2021-05-06',
            achieved: false,
            weekNo: 19,
            overdue: false,
            colour: 'warning',
    
        });
        // terminal notification for later debugging
        console.log('db entry Testing 3 inserted');

        this.db.insert({
            user: 'antony.lockhart',
            exercise: 'Testing 4',
            details: 'More testing',
            endDate: '2021-05-12',
            started: '2021-05-06',
            achieved: false,
            weekNo: 19,
            overdue: false,
            colour: 'warning',
    
        });
        // terminal notification for later debugging
        console.log('db entry Testing 4 inserted');


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

getCompleteGoalCount(user){
    return new Promise((resolve, reject) => {
        this.db.count({user: user, achieved:true}, function(err, goals){
            if (err){
            reject(err);
             } else {
        resolve(goals.toString());
        console.log('function getCompleteGoalCount() returns ', goals);
    }   
    });
    });
}

getIncompleteGoalCount(user){
    return new Promise((resolve, reject) => {
        this.db.count({user: user, achieved:false}, function(err, goals){
            if (err){
            reject(err);
             } else {
        resolve(goals.toString());
        console.log('function getIncompleteGoalCount(user) returns ', goals);
    }   
    });
    });
}
addGoal(user, exercise, details, endDate) {
    var dueWeek = weekNumber(endDate);
    console.log(dueWeek);
console.log('attempting to add', user, exercise, details, endDate, dueWeek);
var goal = {
    user: user,
    exercise: exercise,
    details: details,
    endDate: endDate,
    started: new Date().toISOString().split('T')[0],
    achieved: false,
    weekNo: dueWeek,
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

        overdueGoals(date) {
            console.log('attempting to mark goals as overdue as they are due before ', date);
            // console.log('goal created', goal);
            this.db.update({endDate: {$lte: date}},{$set: { overdue: true, colour: 'danger' }}, function(err, doc) {
                if (err) {
                    console.log('Error updating goals', err);
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