angular.module('miniTwitterApp')
  .controller('LoginController', ['$scope', '$location', 'ApiService', function ($scope, $location, ApiService) {
    $scope.username = '';
    $scope.password = '';
    $scope.errorMessage = '';
    $scope.loading = false;

    $scope.submit = function () {
      if (!$scope.username || !$scope.password) {
        $scope.errorMessage = 'Por favor, rellena todos los campos.';
        return;
      }

      $scope.errorMessage = '';
      $scope.loading = true;

      ApiService.login($scope.username, $scope.password)
        .then(function (data) {
          sessionStorage.setItem('jwt_token', data.jwt_token);
          sessionStorage.setItem('user_id', String(data.user_id));
          sessionStorage.setItem('username', $scope.username);
          $location.path('/home');
        })
        .catch(function (err) {
          $scope.errorMessage = err.message || 'Credenciales incorrectas.';
        })
        .finally(function () {
          $scope.loading = false;
        });
    };
  }]);
