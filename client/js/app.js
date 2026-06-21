angular.module('miniTwitterApp', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/login', {
        templateUrl: 'html/login.html',
        controller: 'LoginController',
      })
      .when('/home', {
        templateUrl: 'html/home.html',
        controller: 'HomeController',
      })
      .when('/tuit/:id', {
        templateUrl: 'html/tuit.html',
        controller: 'TuitController',
      })
      .when('/usuario/:username', {
        templateUrl: 'html/usuario.html',
        controller: 'UsuarioController',
      })
      .otherwise({ redirectTo: '/login' });
  }])

  .run(['$rootScope', '$location', function ($rootScope, $location) {
    $rootScope.$on('$routeChangeStart', function (event, next) {
      const isLoginRoute = next.templateUrl === 'html/login.html';
      const hasToken = !!sessionStorage.getItem('jwt_token');

      if (!isLoginRoute && !hasToken) {
        $location.path('/login');
      }
    });
  }]);
