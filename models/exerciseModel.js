const { rejects } = require('assert');
const nedb = require('nedb');
const { resolve } = require('path');
const weekNumber = require('current-week-number');
const nodemailer = require('nodemailer');

var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "86a0901ab78049",
      pass: "139022643682b6"
    }
  });


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
    seedDb(user) {
        //var dueWeek = weekNumber(endDate);

        this.db.insert({
            user: user,
            exercise: 'Testing 1',
            goals: [
                {
                exercise:'Running',
                activity: '10Km Run',
                endDate: '2021-04-12'
                },
                {
                exercise:'Swimming',
                activity: '100 Laps',
                endDate: '2021-04-12'
                }, 
                {
                exercise:'Climbing',
                activity: '200m Climb',
                endDate: '2021-04-12'
                },
                ],
            endDate: '2021-04-12',
            started: '2021-04-06',
            achieved: false,
            weekNo: weekNumber('2021-04-12'),
            overdue: false,
            colour: 'warning',
    
        });
        // terminal notification for later debugging
        console.log('db entry Testing 1 inserted');

        this.db.insert({
            user: user,
            exercise: 'Testing 2',
            goals: [
                {
                exercise:'Boxing',
                activity: '30 Mins',
                endDate: '2021-03-12'
                },
                {
                exercise:'Dance Workout',
                activity: '1 Hour',
                endDate: '2021-03-12'
                }, 
                {
                exercise:'Squats',
                activity: '3 sets 15 reps',
                endDate: '2021-03-12'
                },
                ],
            endDate: '2021-03-12',
            started: '2021-03-06',
            achieved: false,
            weekNo: weekNumber('2021-03-12'),
            overdue: false,
            colour: 'warning',
    
        });
        // terminal notification for later debugging
        console.log('db entry Testing 2 inserted');

        this.db.insert({
            user: user,
            exercise: 'Testing 3',
            goals: [
                {
                exercise:'Walking',
                activity: '5Km walk',
                endDate: '2021-05-12'
                },
                {
                exercise: 'Cycling',
                activity: '10km Ride',
                endDate: '2021-05-12'
                }, 
                {
                exercise:'Cardio',
                activity: '30 minutes',
                endDate: '2021-05-12'
                },
                ],
            endDate: '2021-05-12',
            started: '2021-05-06',
            achieved: false,
            weekNo: weekNumber('2021-05-12'),
            overdue: false,
            colour: 'warning',
    
        });
        // terminal notification for later debugging
        console.log('db entry Testing 3 inserted');

        this.db.insert({
            user: user,
            exercise: 'Testing 4',
            goals: [
                {
                exercise: 'Weights Training',
                activity: '3 sets, 10 reps',
                endDate: '2021-05-04'
                },
                {
                exercise: 'Yoga',
                activity: '1 Hour',
                endDate: '2021-05-12'
                }, 
                {
                exercise: 'Running',
                activity: '10km Run',
                endDate: '2021-05-17'
                },
                ],
            endDate: '2021-05-17',
            started: '2021-05-06',
            achieved: false,
            weekNo: weekNumber('2021-05-17'),
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
addGoal(user, exercise, exercise1, endDate1 ,details1, exercise2, endDate2, details2, exercise3, endDate3, details3, endDate) {
    
    var dueWeek = weekNumber(endDate);
    console.log(dueWeek);
console.log('attempting to add', user, exercise, details1, details2, details3, endDate1, endDate2, endDate3, dueWeek);
var goal = {
    user: user,
    exercise: exercise,
    goals: [
        {
        exercise: exercise1,
        activity: details1,
        endDate: endDate1
        },
        {
        exercise: exercise2,    
        activity: details2,
        endDate: endDate2
        }, 
        {
        exercise: exercise3,
        activity: details3,
        endDate: endDate3
        },
        ],
    endDate: endDate,
    started: new Date().toISOString().split('T')[0],
    achieved: false,
    overdue: false,
    colour: 'warning',
    weekNo: dueWeek,

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




updateGoal(id, exercise, exercise1, endDate1 ,details1, exercise2, endDate2, details2, exercise3, endDate3, details3, endDate) {
    var dueWeek = weekNumber(endDate);
    var goals = {
        
        exercise: exercise,
        goals: [
            {
            exercise: exercise1,
            activity: details1,
            endDate: endDate1
            },
            {
            exercise: exercise2,    
            activity: details2,
            endDate: endDate2
            }, 
            {
            exercise: exercise3,
            activity: details3,
            endDate: endDate3
            },
            ],
        endDate: endDate,
        weekNo: dueWeek,
    
    };
    console.log('attempting to update', goals, ' to post id ', id);

    // console.log('goal created', goal);
    this.db.update({_id: id},{$set: { exercise:exercise ,goals: [
                                                {
                                                    exercise: exercise1,
                                                    activity: details1,
                                                    endDate: endDate1
                                                 },
                                                 {
                                                    exercise: exercise2,    
                                                    activity: details2,
                                                    endDate: endDate2
                                                }, 
                                                {
                                                    exercise: exercise3,
                                                    activity: details3,
                                                    endDate: endDate3
                                                },
                                             ],
    endDate: endDate,
    weekNo: dueWeek, }}, function(err, doc) {
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
    return new Promise((resolve, reject) => {
        this.db.find({achieved: false}, function(err, goals){
            if (err){
            reject(err);
             } else {
        resolve(goals);

        for(let i = 0; i < goals.length; i++){ 
            console.log('checking ', goals[i]._id);
            var id = goals[i]._id;
            if(goals[i].endDate < date)
            {
                
                console.log('checking id and date', goals[i]._id, date);
                id = goals[i].id;
            }
            console.log('attempting to run function with id: ' , id);
            this.setOverdue(id);

            }

         // console.log('goal created', goal);
    


    }   
    });
    });

    
           
            }
setOverdue(goals){
console.log('passed to check for overdue status', goals._id);
for(let i = 0; i < goals.length; i++){ 
    console.log('setting as overdue ', goals[i]._id);
    this.db.update({_id: goals[i]._id},{$set: { overdue: true, colour: 'danger' }});
}
    
    

}

shareGoal(message){

                console.log('attempting to send email with ', message);
            
                var details = message.details;
                var exercise = message.exercise;
                var recipient = message.recipient;
                var from = message.from;
                let textMail = ('Hey there, I wanted to share this goal with you. I completed my '+ exercise + ' goal, which was '+ details);
                let htmlMessage = ('<div class=""><h1>Hey there! </h1><br><br> I wanted to share this goal with you<br></br> I completed my '+ exercise+ ' goal, which was '+ details+'</div>');
                console.log(textMail, htmlMessage);
                var mailOptions = {
                    from: from,
                    to: recipient,
                    subject: 'Check out my goal',
                    text:textMail,
                    html: htmlMessage
                };
            console.log('sending ', mailOptions);
                transport.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: %s', info.messageId);
            });}

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