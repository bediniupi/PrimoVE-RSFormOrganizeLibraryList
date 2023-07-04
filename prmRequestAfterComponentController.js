app.component('prmRequestAfter', {
         bindings: { parentCtrl: '<' },
         controller: 'prmRequestAfterController'
         });

app.controller('prmRequestAfterController', ['$scope', '$timeout', function($scope, $timeout) {
    var vm = this; 
    
    function getRequestData() {
        try {
            return vm.parentCtrl.requestService;
        } catch(e) {
            return null;
        }
    }
    
    // sort in alphabetical order the libraries listed and eventually reset the default pickup location 
    var organizeForm = function(reset) {
        if (reset) {
            vm.formdata.owner = "";
            vm.formdata.pickupLocation = 0;
            vm.formfieldsOptions = vm.parentCtrl.requestService._formFields[42].options;
            vm.formfieldsOptions[0].label = "";
            vm.formfieldsOptions[0].value = 0;
        }
        vm.form.options.sort((a, b) => a.label.toUpperCase().localeCompare(b.label.toUpperCase()));
       
    }
    
    vm.$onInit = function() {
       
        $scope.$watchGroup([
           function() {
               // index 0 - module inizialization
                try {
                    return vm.parentCtrl.requestService._form[0];
                } catch(e) {
                    return null;
                }
        }, function() {
                // index 1 - citation
                try {
                    return vm.parentCtrl.requestService._formData.citationType;
                } catch(e) {
                    return null;
                }
        }, function() {
                // index 2 - format
            try {
                return vm.parentCtrl.requestService._formData.format;
             }  catch(e) {
                return null;
             }
        }, function() {
                // index 3 - specific chapter
            try {
                return vm.parentCtrl.requestService._formData.specificChapterPages;
             }  catch(e) {
                return null;
             }
        }, function() {
                // index 4 - pickup location
            try {
                return vm.parentCtrl.requestService._formData.pickupLocation;
             }  catch(e) {
                return null;
             }
        }], function(newvalue, oldvalue) {
                              
            if (newvalue[0]) {
                var reqServ = getRequestData();
                // exit if not RS request
                if (reqServ._service.type != "AlmaResourceSharing") {
                    return null;
                }
           
                // get parent scope data for function
                vm.form = reqServ._form[0];
                vm.formdata = reqServ._formData;
                // call function immediately
                if (newvalue[0] != oldvalue[0]) {
                    organizeForm(true);                    
                } else {
               
                    if (newvalue[1] != oldvalue[1] || newvalue[2] != oldvalue[2] || newvalue[3] != oldvalue[3]) {
                        // function call on next  digest cycle, otherwise the parent scope is reinizialized
                        if (oldvalue[4] == 0) {
                            $timeout(organizeForm, 0, true, true);
                        } else {
                            // calling function without resetting pickup location (the pickup location is chosen  by the user)
                            $timeout(organizeForm, 0, true, false);
                        }
                    }    
                }    
            }
          
        });
          
    }
}]);
