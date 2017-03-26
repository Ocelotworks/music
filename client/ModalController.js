/*
 * Copyright Ocelotworks 2016
 */

app.controller("ModalController", function($scope, $rootScope, $sce, $templateRequest, $compile){
    $templateRequest("loading").then(function(template){
        $compile($("#modalBox").html(template).contents())($scope);
    }, $scope.showErrorScreen);


    $scope.showErrorScreen = function(error){
        $scope.error = error;
        $templateRequest("error").then(function(template){
            $compile($("#modalBox").html(template).contents())($scope);
        }, function(error){
            console.error("Well shit "+error);
        });
    };

    $scope.openModal = function(path, nocache){
        console.log("Opening modal");
        $("#modalShadow").addClass("modal-visible");
        $templateRequest("loading").then(function(template){
            $compile($("#modalBox").html(template).contents())($scope);
        }, $scope.showErrorScreen);

        var templateUrl = $sce.getTrustedResourceUrl("templates/"+path+(nocache ? "#"+Math.random() : ""));
        $templateRequest(templateUrl).then(function(template){
            $compile($("#modalBox").html(template).contents())($scope);
        }, $scope.showErrorScreen);
    };

    $scope.closeModal = function(){
        $("#modalShadow").removeClass("modal-visible");
    };

    $rootScope.$on("openModal", function(evt, path, nocache){
        console.log("Received openmodal event");
        $scope.openModal(path, nocache)
    });

    $rootScope.$on("closeModal", $scope.closeModal);

    $("#modalShadow").click(function(e){
        if(e.target != this) return;
        $rootScope.$emit("closeModal", true);
    });

    $rootScope.$emit("modalControllerReady");


});