app.component('prmRequestAfter', {
         bindings: { parentCtrl: '<' },
         controller: 'prmRequestAfterController'
         });

app.controller('prmRequestAfterController', ['$scope', '$timeout', '$translate', function($scope, $timeout, $translate) {
    var vm = this; 
       
    // sort in alphabetical order the libraries listed and eventually reset the default pickup location 
    var organizeForm = function(reset) {
        if (reset) {
            // the values must be empty strings, other solutions (null, 0, delete the parameter) cause sending form stuck
            // sending a form without pickup library selected cause now an internal server error message displaying
            // the code is modified below to display a more specific error message
            vm.formdata = vm.parentCtrl.requestService._formData;
            vm.formdata.owner = "";
            vm.formdata.pickupLocation = "";
            vm.formfieldsOptions = vm.parentCtrl.requestService._formFields[42].options;
            vm.formfieldsOptions[0].label = "";
            vm.formfieldsOptions[0].value = "";
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
         }, function() {
               // index 5 - catch internal server error when the form is sent without pickup library
            try {
                return vm.parentCtrl.opacService._responseStatus.isSuccess;
             }  catch(e) {
                return null;
             }
        }], function(newvalue, oldvalue) {
               // get the page language ("en", "it",...) and parent scope form data for sort function    
               vm.lang = $translate.use();
               vm.form = vm.parentCtrl.requestService._form[0];
              
               if (newvalue[0]) {
                  // exit if not RS request
                if (vm.parentCtrl.requestService._service.type != "AlmaResourceSharing") {
                    return null;
                }
                
                // call function immediately when form is inizialized
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
         // catch the "internal server error" message when the form is sent without pickup library and display an errore message more specific
            if (newvalue[5] == oldvalue[5] && newvalue[5] == false) {
                    vm.parentCtrl.opacService._responseStatus.isSuccess = null;
                    }
             if (newvalue[5]!=oldvalue[5] && newvalue[5]===false) {
                    const errorMsg = {
                        it: "La biblioteca di riferimento non è stata scelta, si prega di selezionarla prima di inviare il modulo di richiesta di prestito interbibliotecario.", 
                        en: "The pickup library was not chosen, please select it before sending the ILL request form."
                    };
                    if (vm.parentCtrl.requestService._formData.owner == "") {
                        vm.parentCtrl.opacService._responseStatus.msg = errorMsg[vm.lang];
                        }
             }
          
        });
    }
}]);
