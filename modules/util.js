/**
 * Created by Peter on 11/12/2016.
 */
module.exports = function(app){
    return {
        validateKeyAbove: function validateKeyAbove(minUserLevel){
            return function validateKey(req, res, next){
                if(!req.params.key){
                    res.headers(401).json({err: "You must supply an API key."})
                }else {
                    app.database.getUserFromApiKey(req.params.key, function (err, result) {
                        if (err) {
                            res.headers(500).json({err: err});
                        } else {
                            var user = result[0];
                            if (user.userlevel < minUserLevel) {
                                res.headers(403).json({err: "Invalid access level"});
                            } else {
                               next();
                            }
                        }
                    });
                }
            };
        }
    };
};