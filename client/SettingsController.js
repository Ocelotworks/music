/*
* Copyright Ocelotworks 2016
 */

app.controller('SettingsController', function($scope, $rootScope, $http){

    $http.get(base+"templates/settings/getAPIKey").then(function(data){
        $scope.settings.apiKey = data.data.id;
    });

    $scope.regenerateKey = function(){
        $http.get(base+"templates/settings/generateAPIKey").then(function(data){
            if(data.data.err){
                console.error("fuck again "+data.err);
            }else{
                $scope.settings.apiKey = data.data.key;
            }

        });
    }
});