angular.module('miniTwitterApp')
  .controller('HomeController', ['$scope', '$location', 'ApiService', function ($scope, $location, ApiService) {
    $scope.tuits = [];
    $scope.loading = true;
    $scope.errorMessage = '';
    $scope.myUsername = sessionStorage.getItem('username') || '';
    $scope.myUserId = sessionStorage.getItem('user_id') || '';

    $scope.newTexto = '';
    $scope.newError = '';
    $scope.posting = false;

    function loadTuits() {
      $scope.loading = true;
      ApiService.getTuits()
        .then(function (tuits) {
          $scope.tuits = tuits;
        })
        .catch(function (err) {
          $scope.errorMessage = err.message;
        })
        .finally(function () {
          $scope.loading = false;
        });
    }

    $scope.isOwn = function (tuit) {
      return String(tuit.usuario_id) === String($scope.myUserId);
    };

    $scope.toggleLike = function (tuit) {
      const wasLiked = tuit.liked;
      ApiService.likeToggle(tuit.id, !wasLiked)
        .then(function () {
          tuit.liked = !wasLiked;
          tuit.num_likes += wasLiked ? -1 : 1;
        })
        .catch(function (err) {
          $scope.errorMessage = err.message;
        });
    };

    $scope.toggleRetuit = function (tuit) {
      const wasRT = tuit.retuiteado;
      ApiService.retuitToggle(tuit.id, !wasRT)
        .then(function () {
          tuit.retuiteado = !wasRT;
          tuit.num_retuits += wasRT ? -1 : 1;
        })
        .catch(function (err) {
          $scope.errorMessage = err.message;
        });
    };

    $scope.deleteTuit = function (tuit) {
      if (!confirm('¿Eliminar este tuit? Esta acción no se puede deshacer.')) return;
      ApiService.deleteTuit(tuit.id)
        .then(function () {
          $scope.tuits = $scope.tuits.filter(function (t) { return t.id !== tuit.id; });
        })
        .catch(function (err) {
          $scope.errorMessage = err.message;
        });
    };

    $scope.openTuit = function (tuit) {
      $location.path('/tuit/' + tuit.id);
    };

    $scope.openUsuario = function (username) {
      $location.path('/usuario/' + username);
    };

    $scope.submitNewTuit = function () {
      const texto = ($scope.newTexto || '').trim();
      $scope.newError = '';

      if (!texto) {
        $scope.newError = 'El texto no puede estar vacío.';
        return;
      }
      if (texto.length > 300) {
        $scope.newError = 'Máximo 300 caracteres.';
        return;
      }

      $scope.posting = true;
      ApiService.postTuit(texto)
        .then(function (tuit) {
          $scope.tuits.unshift(tuit);
          $scope.newTexto = '';
        })
        .catch(function (err) {
          $scope.newError = err.message;
        })
        .finally(function () {
          $scope.posting = false;
        });
    };

    $scope.logout = function () {
      sessionStorage.clear();
      $location.path('/login');
    };

    loadTuits();
  }]);
