/**
 * Created by Peter on 10/11/2016.
 */


app.controller("AddDeviceController", function($scope, $http){

    $scope.device = {
        isMobile: false,
        userAgent: navigator.userAgent,
        os: "",
        browser: "",
        name: "Magical Device"
    };

    var clientStrings = [
        {s:'Windows 10', r:/(Windows 10.0|Windows NT 10.0)/},
        {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
        {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
        {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
        {s:'Windows Vista', r:/Windows NT 6.0/},
        {s:'Windows Server 2003', r:/Windows NT 5.2/},
        {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
        {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
        {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
        {s:'Windows 98', r:/(Windows 98|Win98)/},
        {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
        {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
        {s:'Windows CE', r:/Windows CE/},
        {s:'Windows 3.11', r:/Win16/},
        {s:'Android', r:/Android/},
        {s:'Open BSD', r:/OpenBSD/},
        {s:'Sun OS', r:/SunOS/},
        {s:'Linux', r:/(Linux|X11)/},
        {s:'iOS', r:/(iPhone|iPad|iPod)/},
        {s:'Mac OS X', r:/Mac OS X/},
        {s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
        {s:'QNX', r:/QNX/},
        {s:'UNIX', r:/UNIX/},
        {s:'BeOS', r:/BeOS/},
        {s:'OS/2', r:/OS\/2/}
    ];


    if(!!window.chrome && !!window.chrome.webstore)$scope.device.browser = "Google Chrome";
    else if(/*@cc_on!@*/false || !!document.documentMode)$scope.device.browser = "Internet Explorer";
    else if(!!window.StyleMedia)$scope.device.browser = "Edge";
    else if(Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification))$scope.device.browser = "Safari";
    else if(typeof InstallTrigger !== 'undefined')$scope.device.browser = "Mozilla Firefox";
    else if((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0)$scope.device.browser = "Opera";

    $scope.device.isMobile = navigator.appVersion ? /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(navigator.appVersion) : false;

    for (var id in clientStrings) {
        var cs = clientStrings[id];
        if (cs.r.test(navigator.userAgent)) {
            $scope.device.os = cs.s;
            break;
        }
    }

    $scope.device.name = $scope.device.browser+" on "+$scope.device.os;

    $scope.goAwayForever = function(){
        console.log("Going away forever");
        localStorage.setItem("deviceID", "gtfo");
        $scope.$emit("closeModal");
    };

    $scope.addDevice = function(){
        console.log("Adding device");
        if($scope.reregistering){
			localStorage.setItem("deviceID", $scope.selectedDevice.id);
			location.reload();
		}else{
			$http.post(base+"templates/add/device", $scope.device).then(function(resp){
				if(resp.data){
					localStorage.setItem("deviceID", resp.data.id);
				}
			});
		}

        $scope.$emit("closeModal");
    };

    $scope.reregistering = false;

    $scope.selectedDevice = null;

    $scope.reregister = function(){
        $scope.reregistering = true;
        $http.get(base+"api/user/me/devices").then(function(resp){
        	console.log(resp.data);
        	$scope.devices = resp.data;
		});
    };

    $scope.unReregister = function(){
		$scope.reregistering = false;
	};

    $scope.selectDevice = function(device){
    	$scope.selectedDevice = device;
    	console.log($scope.selectedDevice);
	}
});