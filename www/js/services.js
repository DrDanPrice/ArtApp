'use strict';

/* Services */
var utilServices = angular.module('utilModule', []);

utilServices.factory('tourInfo',
    function ($q, $http, $filter, $ionicSlideBoxDelegate, $ionicLoading) {
        var Connect = new Asteroid("localhost:3000");

        var tours = null;
        var artwork = null;

        var outOb = {
            loadArtwork: function () {
                var artSub = Connect.subscribe('all_tour_objects');
                // Connect is our DB connection
                // using Q.all is great if you had more than one .subscribe you were waiting on, just put the others in the array.
                var allSubscriptions = Q.all([artSub.ready]);
                allSubscriptions.then(function () {
                    var artworkCollection = Connect.getCollection("tour_objects");
                    var artworkResult = artworkCollection.reactiveQuery({});

                    // TEMPORARY UNTIL SERVER FOLDERS ARE MIGRATED
                    artworkResult.result.forEach(function (art, $index) {
                        art.artwork_id = $index + 1;
                    });

                    artwork = artworkResult.result;
                    allSubscriptions.resolve(true);
                });
                return allSubscriptions;
            },
            loadTours: function () {
                var tourSub = Connect.subscribe('publicTours');
                // Connect is our DB connection
                // using Q.all is great if you had more than one .subscribe you were waiting on, just put the others in the array.
                var tourSubscriptions = Q.all([tourSub.ready]);
                tourSubscriptions.then(function () {
                    var tourCollection = Connect.getCollection("tours");
                    var tourResult = tourCollection.reactiveQuery({});
                    tours = tourResult.result;
                    tourSubscriptions.resolve(true);
                });
                return tourSubscriptions;
            },
            loadData: function () {
                $ionicLoading.show();
                var artPromise = this.loadArtwork();
                var tourPromise = this.loadTours();
                Q.all([artPromise, tourPromise]).then(function () {
                    $ionicLoading.hide();
                })
            },
            getTourByID: function (id) {
                if (tours) {
                    var temp = tours.filter(function (element) {
                        return element._id == id;
                    });
                    return temp[0];
                }
                else {
                    return null;
                }
            }
        };
        outOb.getTours = function () {
            return tours;
        };
        outOb.getArtwork = function () {
            return artwork;
        };
        outOb.getArtworkByID = function (art_id) {
            return $filter('getByArtworkId')(artwork, art_id);
        };
        outOb.getArtworkByTourID = function (id) {
            var tour = outOb.getTourByID(id);
            if (tour) {
                var tourArt = [];
                for (var i = 0; i < tour.artwork_included.length; i++) {
                    tourArt.push(outOb.getArtworkByID(tour.artwork_included[i].$value));
                }
                return tourArt;
            }
            else return null;
        };
        return outOb;
    });

utilServices.factory('favoriteService', function () {
    return {
        setFavorite: function (id, toggle) {
            var temp = [];
            if (localStorage.getObject("favorites") != null) {
                temp = JSON.parse(localStorage.getObject("favorites"));
            }
            if (toggle) {
                temp.push(id);
            } else {
                var index = temp.indexOf(id);
                if (index > -1) {
                    temp.splice(index, 1);
                }
            }
            localStorage.setObject("favorites", JSON.stringify(temp));
        },
        isFavorite: function (id) {
            var temp = [];
            if (localStorage.getObject("favorites") != null) {
                temp = JSON.parse(localStorage.getObject("favorites"));
            }

            for (var q = 0; q < temp.length; q++) {
                if (temp[q] == id) return true;
            }
            return false;
        },
        getFavorites: function () {
            return eval(localStorage.getObject("favorites"));
        }
    }
});

utilServices.factory('appStateStore', function () {
    var toursOpen = null;
    var artworkOpen = null;
    var menuOpen = null;
    return {
        loadData: function () {
            toursOpen = JSON.parse(localStorage.getItem("toursOpen"));
            artworkOpen = JSON.parse(localStorage.getItem("artworkOpen"));
            menuOpen = JSON.parse(localStorage.getItem("menuOpen"));

            // If nothing in LS, set to default values
            if (toursOpen === null) {
                localStorage.setItem("toursOpen", true);
                toursOpen = true;
            }
            if (artworkOpen === null) {
                localStorage.setItem("artworkOpen", false);
                artworkOpen = false;
            }
            if (menuOpen === null) {
                localStorage.setItem("menuOpen", true);
                menuOpen = true;
            }
        },
        getMenuOpen: function () {
            return menuOpen;
        },
        setMenuOpen: function (input) {
            if (input != menuOpen) {
                localStorage.setItem("menuOpen", input.toString());
                menuOpen = input;
            }
        }
    }
});