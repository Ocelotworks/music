/*
 * Copyright Ocelotworks 2016
 */

app.controller("AddPlaylistController", function($scope, $http){
    $scope.checkAll = function(){
        $(".songSelect").prop("checked", true)
    };

    $scope.uncheckAll = function(){
        $(".songSelect").prop("checked", false)
    };

    $scope.invertAll = function(){
        $(".songSelect").prop("checked",  function(_, checked) {
            return !checked;
        });
    };

    $scope.createPlaylist = function(){
        $http.post(base+"templates/add/playlist", $scope.playlist).then(function(response){
                if(!response.data.err){
                    $scope.$emit("switchTab", 4)
                }else{
                    $scope.err = response.data.err;
                }
            },
            function(err){
                $scope.err = err;
                console.log("There was an error: "+err);
            });
    }
});