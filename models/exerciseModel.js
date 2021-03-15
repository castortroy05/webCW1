const { rejects } = require('assert');
const nedb = require('nedb');
const { resolve } = require('path');


class Goals{
constructor(dbFilePath) {
    if(dbFilePath)
    {
    this.db = new nedb({ filename: dbFilePath, autoload: true});
    console.log('DB connected to ' + dbFilePath);
    } else {
        this.db = new nedb();
        console.log('db connected in memory' + dbFilePath);
    }
}

//a function to seed the database
init() {
    this.db.insert({
        exercise: 'squats',
        details: '1000 squats',
        started: '2020-02-16',
        endDate: '2020-03-17',
        author: 'Peter'
    })
    //for later debugging
    console.log('db entry Peter inserted');




}

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

getCompleted


addGoal(author, exercise, details, endDate) {
console.log('attempting to add', author, exercise, details, endDate)
var goal = {
    author: author,
    exercise: exercise,
    details: details,
    endDate: endDate,
    started: new Date().toISOString().split('T')[0]

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

}

//make the module visible outside
module.exports = Goals;