'use strict';

/* App Module */

var seoApp = angular.module('seoApp', [
    'ngRoute',
    'ngResource',
    'seoControllers',
    'seoServices',
    'seoDirectives',
    'mgcrea.ngStrap.popover',
    'mgcrea.ngStrap.tooltip',
    'mgcrea.ngStrap.modal',
    'mgcrea.ngStrap.alert',
    'ui.tree',
    'ngAnimate',
    'ngSanitize',
    'nvd3ChartDirectives',
    'ngCookies'
]);

seoApp.config(['$modalProvider', '$routeProvider',
    function ($modalProvider, $routeProvider) {
        angular.extend($modalProvider.defaults, {
            html: true
        });
        $routeProvider
            .when('/sites', {
                templateUrl: 'partials/sites.html',
                controller: 'SitesCtrl',
                authenticate: true
            })
            .when('/settings', {
                templateUrl: 'partials/settings.html',
                controller: 'SettingsCtrl',
                authenticate: true
            })
            .when('/login', {
                templateUrl: 'partials/login.html',
                controller: 'AuthCtrl',
                authenticate: false
            })
            .when('/register', {
                templateUrl: 'partials/register.html',
                controller: 'AuthCtrl',
                authenticate: false
            })
            .when('/logout', {
                redirectTo: '/login',
                authenticate: false
            })
//            .when('/captcha_test', {
//                templateUrl: 'partials/captcha_test.html',
//                controller: 'CaptchaTestCtrl'
//            })
            .otherwise({
                redirectTo: '/sites'
            });
    }]);

seoApp.run(['$rootScope', '$location', 'Authenticate',
    function ($rootScope, $location, Authenticate) {
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            console.log('$routeChangeStart', next.authenticate)
            if ((typeof(next.authenticate) === "undefined" || next.authenticate)
                && !Authenticate.isAuthenticated) {
                $location.path("/login");
            }
        })
    }]);