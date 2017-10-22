var express = require('express');
var router = express.Router();

// BASE+/api/playlist/
module.exports = function(app){

	router.petifyInfo = {
		name: "User API",
		route: "/api/user"
	};

	router.get('/me/devices', function(req, res){
		if(req.user){
			app.database.getDevicesByUser(req.user.id, function(err, result){
				if(err){
					res.json(err);
				}else{
					res.json(result);
				}
			});
		}else{
			res.json({err: "Not Logged In."})
		}
	});

	return router;
};