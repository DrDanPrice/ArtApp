'use strict';

/* App Module */
var publicArtApp = angular.module('publicArtApp', [
    'ionic',
    'controllerModule',
    'ngSanitize',
    'databaseServicesModule',
    'utilModule',
    'adaptive.googlemaps',
    'ngNotify',
    'ImgCache',
    'ngCordova'
]);

publicArtApp.config(['$stateProvider', '$urlRouterProvider', '$compileProvider', 'ImgCacheProvider',
    function ($stateProvider, $urlRouterProvider, $compileProvider, ImgCacheProvider) {
        $urlRouterProvider.otherwise("/tour/collage/");
        $stateProvider
            .state('tour', {
                url: "/tour",
                views: {
                    "menu": {
                        templateUrl: "partials/menu.html",
                        controller: "menuCtrl"
                    },
                    "content": {
                        templateUrl: "partials/main.html",
                        controller: "mainCtrl"
                    }
                }
            })
            .state('tour.collage', {
                url: "/collage/:tourID",
                views: {
                    "content@": {
                        templateUrl: "partials/collageView.html",
                        controller: "collageCtrl"
                    }
                },
                resolve: {
                    artworkIn: function (tourInfo) {
                        return tourInfo.loadArtwork();
                    },
                    toursIn: function (tourInfo) {
                        return tourInfo.loadTours();
                    }
                }
            })
            .state('tour.artDetail', {
                url: "/artDetail/:artID",
                views: {
                    "content@": {
                        templateUrl: "partials/artworkDetail.html",
                        controller: "artDetailCtrl"
                    }
                },
                resolve: {
                    artworkIn: function (tourInfo) {
                        return tourInfo.loadArtwork();
                    }
                }
            })
            .state('tour.favorites', {
                url: "/favorites",
                views: {
                    "content@": {
                        templateUrl: "partials/favorites.html",
                        controller: "favoriteCtrl"
                    }
                }
            })
            .state('tour.about', {
                url: "/about",
                views: {
                    "content@": {
                        templateUrl: "partials/about.html",
                        controller: "aboutCtrl"
                    }
                }
            })
            .state('tour.intro', {
                url: "/intro",
                views: {
                    "content@": {
                        templateUrl: "partials/intro.html",
                        controller: "introCtrl"
                    }
                }
            })
            .state('tour.error', {
                url: "/error",
                views: {
                    "content@": {
                        templateUrl: "partials/error.html",
                        controller: "errorCtrl"
                    }
                }
            });
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|geo|maps):/);
        // or more options at once
        ImgCacheProvider.setOptions({
            debug: true,
            usePersistentCache: true
        });

        // ImgCache library is initialized automatically,
        // but set this option if you are using platform like Ionic -
        // in this case we need init imgcache.js manually after device is ready
        ImgCacheProvider.manualInit = true;
    }]);

publicArtApp.run(['$rootScope', '$http', 'Auth', 'tourInfo', '$ionicSideMenuDelegate', 'appStateStore', 'ngNotify', '$ionicPlatform', 'ImgCache', '$state',
    function ($rootScope, $http, Auth, tourInfo, $ionicSideMenuDelegate, appStateStore, ngNotify, $ionicPlatform, ImgCache, $state) {
        $rootScope.curState = 'none';
        $rootScope.prevState = 'none';

        $rootScope.goToLink = function (url) {
            window.open(url, "_system");
        };

        tourInfo.loadData();

        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                // StatusBar.styleDefault();
                StatusBar.styleLightContent();
            }

            ImgCache.$init();
        });

        function onDeviceReady() {
            ImgCache.$init();
        }

        document.addEventListener("deviceready", onDeviceReady, false);

        // If resolve fails, handles error by redirecting to error state
        $rootScope.$on('$stateChangeError', function () {
            $state.go('tour.error');
        });
    }]);

publicArtApp.constant('$ionicLoadingConfig', {
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
});