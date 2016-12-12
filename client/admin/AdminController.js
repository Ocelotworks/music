/*
 * Copyright Ocelotworks 2016
 */

app.controller("AdminController", function($scope, $rootScope, $sce, $templateRequest, $compile, $http){

    $scope.showErrorScreen = function(error){
        $scope.error = error;
        $templateRequest("error").then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, function(error){
            console.error("Well shit "+error);
        });
    };

    $scope.createAdminView = function(type){
        $templateRequest("loading").then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, $scope.showErrorScreen);

        var templateUrl = $sce.getTrustedResourceUrl("templates/admin/"+type);
        $templateRequest(templateUrl).then(function(template){
            $compile($("#tabContainer").html(template).contents())($scope);
        }, $scope.showErrorScreen);
    };


    $scope.alert = {
        url: base+"img/album.png",
        users: {},
        title: "",
        body: "",
        lifetime: 5
    };

    $scope.sendAlert = function(){
        $http.post(base+'templates/admin/alerts', $scope.alert).then(function(resp){
            $scope.error = resp.data.error;
        });
    };


    $scope.job = {
        name: "",
    };

    $scope.updateJob = function(){
        var tempName = $scope.job.name;
        $http.get(base+"api/admin/job/"+$scope.job.name).then(function(resp){
           $scope.job = resp.data;
           $scope.job.name = tempName;
           $scope.job.returnArgs = [];
        });
    };

    $scope.runJob = function(){
        console.log($scope.job);
        $http.get(base+"api/admin/job/run/"+$scope.job.name+"/"+JSON.stringify($scope.job.returnArgs)).then(function(){
           $scope.job = {
               name : "",
               err: "Job Running."
           };
        });
    }

});