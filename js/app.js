// config object needed for images
var config = {};
var myApp = angular.module("myApp", ['ui.router']);
//URL constants could have been contructed adding parameters to original url
myApp.constant('urlMovie', 'https://api.themoviedb.org/3/movie/top_rated?api_key=c745f3f7137b083547c045ad7afe0ee7&language=en-US&page=1')
    .constant('urlTvShow', 'https://api.themoviedb.org/3/tv/top_rated?api_key=c745f3f7137b083547c045ad7afe0ee7&language=en-US&page=1')
    .constant('urlConfig', 'https://api.themoviedb.org/3/configuration?api_key=c745f3f7137b083547c045ad7afe0ee7');
//configuration of states
myApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.when('', '/movies');
        $stateProvider.state('index', {
            url: '/movies'
            , abstract: true
            , template: '<ui-view/>'
        });
        $stateProvider.state("movies", {
            url: '/movies'
            , templateUrl: "Templates/movies.html"
            , controller: "movieController"
            , resolve: {
                items: ['$http', 'urlMovie', function ($http, urlMovie) {
                    return $http.get(urlMovie).then(function (response) {
                        return response.data;
                    });
                }]
            }
            , controller: ['$scope', 'items', '$state', function ($scope, items, $state) {
                $scope.title = function (movieOrTv) {
                    return movieOrTv.title;
                }
                $scope.link = function (movieOrTv) {
                    
                    return getImageUrl(movieOrTv);
                }
                $scope.itemList = items.results.slice(0, 10);
            }]
        });
        $stateProvider.state("tvShows", {
            url: '/tvShows'
            , templateUrl: "Templates/movies.html"
            , controller: "movieController"
            , resolve: {
                items: ['$http', 'urlTvShow', function ($http, urlTvShow) {
                    return $http.get(urlTvShow).then(function (response) {
                        return response.data;
                    });
            }]
            }
            , controller: ['$scope', 'items', function ($scope, items) {
                $scope.title = function (movieOrTv) {
                    return movieOrTv.name;
                }
                $scope.link = function (movieOrTv) {
                    return getImageUrl(movieOrTv);
                }
                $scope.itemList = items.results.slice(0, 10);
        }]
        });
        $stateProvider.state("details", {
            url: '/details?:id'
            , templateUrl: "Templates/details.html"
            , controller: "detailsController"
            , resolve: {
                previousState: ['$state', '$window', function ($state, $window) {
                    return $state.current.name;
           }]
            }
        });
    }])
    
    .controller("configController", ['$http', 'urlConfig', function ($http, urlConfig) {
        $http.get(urlConfig).then(function (response) {
            config = response.data;
        });
    }])
    .controller("detailsController", ['$scope', '$stateParams', 'previousState', '$http', '$window', function ($scope, $stateParams, previousState, $http, $window) {
     
        updateOverViewScopes($scope,$http,$stateParams,previousState);
        
  }])

    .controller("navigationController", ['$scope', '$location', function ($scope, $location) {
        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        }
    }])

    .controller("searchController", ['$scope', '$http', '$state', function ($scope, $http, $state) {
        $scope.changeHandler = function () {
            if ($scope.searchBox.length > 2) {
                
                $scope.$watch('itemList', ['$scope', function ($scope) {
                    $scope.itemList = $scope.$parent.itemList;
                }])
                
                $scope.$watch("imageLink", ['$scope', function ($scope) {
                    $scope.imageLink = $scope.$parent.link;
                }])
                
                if ($state.current.name == 'movies') {
                    $http.get('https://api.themoviedb.org/3/search/movie?api_key=c745f3f7137b083547c045ad7afe0ee7&language=en-US&query=' + $scope.searchBox + '&page=1&include_adult=false').then(function (response) {
                        
                        $scope.$parent.itemList = response.data.results.slice(0, 10);
                    })
                }
                else if ($state.current.name == 'tvShows') {
                    $http.get('https://api.themoviedb.org/3/search/tv?api_key=c745f3f7137b083547c045ad7afe0ee7&language=en-US&query=' + $scope.searchBox + '&page=1').then(function (response) {
                        
                        $scope.$parent.itemList = response.data.results.slice(0, 10);
                    })
                }
            }
        }
    }])

    // for back button returns to parent view 
    .run(['$window', '$rootScope'
        , function ($window, $rootScope) {
            $rootScope.goBack = function () {
                $window.history.back();
            }
    }]);

//if image null return local image
function getImageUrl(movieOrTv) {
    if (!movieOrTv.poster_path) {
        return 'images/no-image-available.png';
    }
    return config.images.base_url + config.images.poster_sizes[2] + movieOrTv.poster_path;
}

function updateOverViewScopes($scope,$http,$stateParams,previousState){
    
    if(previousState=="movies"){         
        $http.get('https://api.themoviedb.org/3/movie/' + $stateParams.id + '?api_key=c745f3f7137b083547c045ad7afe0ee7&language=en-US').then(function (response) {
                $scope.title = response.data.title;
                $scope.link= getImageUrl(response.data)                
                $scope.overview = response.data.overview;
            });
    }else if(previousState=="tvShows"){          
        $http.get('https://api.themoviedb.org/3/tv/' + $stateParams.id + '?api_key=c745f3f7137b083547c045ad7afe0ee7&language=en-US').then(function (response) {
                $scope.title = response.data.name;
                $scope.link= getImageUrl(response.data)  
                $scope.overview = response.data.overview;
            })
    }
    
}