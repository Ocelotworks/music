/**
 * Created by Peter on 12/12/2016.
 */
var express = require('express');
var router = express.Router();

// BASE+/api/admin/
module.exports = function(app){


    function isLoggedInAdmin(req, res, next){
        if(req.user && req.user.userlevel >= 2)next();
        else res.header(402).json({err: "Not Authorised"});
    }

    function runJob(req, res){
        try {
            app.log("Running job "+req.params.job+" with args "+req.params.args);
            app.jobs.runJob(req.params.job, JSON.parse(req.params.args));
            res.header(204).send();
        }catch(e){
            console.log(e);
            res.header(500).json({err: e.stack});
        }
    }

    function getJobNames(req, res){
        res.json(app.jobs.getJobNames());
    }

    function getJob(req, res){
        res.json(app.jobs.getJob(req.params.name));
    }


    /**
     * /api/admin/:key/job/run/:job/:args
     */
    router.get('/:key/job/run/:job/:args', app.util.validateKeyAbove(2), runJob);
    router.get('/job/run/:job/:args', isLoggedInAdmin, runJob);

    /**
     *  /api/admin/:key/job/getNames
     */
    router.get('/:key/job/getNames', app.util.validateKeyAbove(2), getJobNames);
    router.get('/job/getNames', isLoggedInAdmin, getJobNames);

    /**
     *  /api/admin/:key/job/:name
     */
    router.get('/:key/job/:name', app.util.validateKeyAbove(2), getJob);
    router.get('/job/:name', isLoggedInAdmin, getJob);

    return router;
};