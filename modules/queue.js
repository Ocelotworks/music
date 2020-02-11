var weighted = require('weighted');
module.exports = function(app){
  console.log("Doing the qwuue");
  var obj = {};
  obj.generateSongQueue = function generateSongQueue(user){
    console.log("Generating song queue for "+user);
    app.database.getShuffleQueueWeights(user, function(err, res){
      if(err){
        console.error(err);
      }else{
        var weights = {};
        for(var i = 0; i < res.length; i++){
          const row = res[i];
          console.log(row);
        }
      }
    });
  };
 // obj.generateSongQueue("90e4c1e2-363a-40bc-8161-b1c8822f3a7d");

  return obj;
};