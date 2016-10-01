/*
 * Copyright Ocelotworks 2016
 */
app.controller('AddController', function($scope,  $templateRequest, $sce, $compile, $http){

    $scope.addViews = {
        playlist: "playlist",
        song: "song#"+Math.random(),
        radio: "radio"
    };

    $scope.showErrorScreen = function(error){
        $scope.error = error;
        $templateRequest("error").then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, function(error){
            console.error("Well shit "+error);
        });
    };

    $scope.addSong = function(){
        console.log($scope.song);
        $http.post(base+"templates/add/song", $scope.song)
            .then(function(response){
                if(!response.data.err){
                    console.log("Aye aye cpn");
                    var templateUrl = $sce.getTrustedResourceUrl("templates/add/song#"+Math.random());
                    $templateRequest(templateUrl).then(function(template){
                        $compile($("#tabContainer").html(template).contents())($scope);
                    }, $scope.showErrorScreen);
                }else{
                    $scope.err = response.data.err;
                }
            },
            function(err){
                $scope.err = err;
                console.log("There was an error: "+err);
            });
    };


    $scope.createAddView = function(type){
        $templateRequest("loading").then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, $scope.showErrorScreen);

        var templateUrl = $sce.getTrustedResourceUrl("templates/add/"+$scope.addViews[type]);
        $templateRequest(templateUrl).then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, $scope.showErrorScreen);
    };

});