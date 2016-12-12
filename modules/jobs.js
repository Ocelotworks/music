/**
 * Created by Peter on 12/12/2016.
 */



module.exports = function jobs(app){


    var jobs = {
        "Test Job": {
            desc: "A test job",
            args: [],
            func: function testJob(cb){
                app.log("Just ran a delicious job!");
                if(cb)
                    cb(null);
            }
        }
    };

    return  {
        getJobs: function getJobs(){
           return jobs;
        },
        runJob: function runJob(name, args, cb){
            if(jobs[name])
                jobs[name].func.apply(null, cb ? args.concat(cb) : args);
            else
                if(cb)cb(new Error("No Such Job"));
        },
        getJobNames: function getJobNames(){
           return Object.keys(jobs);
        },
        getJob: function getJob(name){
           return jobs[name];
        },
        addJob: function addJob(name, obj){
            if(jobs[name])
                app.warn(`Warning: job ${name} was overridden.`);
            jobs[name] = obj;
        }
    };
};