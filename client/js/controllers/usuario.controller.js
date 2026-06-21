angular.module('miniTwitterApp')
  .controller('UsuarioController', ['$scope', '$routeParams', '$location', 'ApiService',
    function ($scope, $routeParams, $location, ApiService) {
      $scope.username = $routeParams.username;
      $scope.tuits = [];
      $scope.loading = true;
      $scope.errorMessage = '';
      $scope.myUserId = sessionStorage.getItem('user_id') || '';

      function load() {
        $scope.loading = true;
        ApiService.getUserTuits($scope.username)
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

      $scope.isOwn = function (t) {
        return String(t.usuario_id) === String($scope.myUserId);
      };

      $scope.toggleLike = function (t) {
        const wasLiked = t.liked;
        ApiService.likeToggle(t.id, !wasLiked).then(function () {
          t.liked = !wasLiked;
          t.num_likes += wasLiked ? -1 : 1;
        });
      };

      $scope.toggleRetuit = function (t) {
        const wasRT = t.retuiteado;
        ApiService.retuitToggle(t.id, !wasRT).then(function () {
          t.retuiteado = !wasRT;
          t.num_retuits += wasRT ? -1 : 1;
        });
      };

      $scope.deleteTuit = function (t) {
        if (!confirm('¿Eliminar este tuit? Esta acción no se puede deshacer.')) return;
        ApiService.deleteTuit(t.id).then(function () {
          $scope.tuits = $scope.tuits.filter(function (x) { return x.id !== t.id; });
        });
      };

      $scope.openTuit = function (t) {
        $location.path('/tuit/' + t.id);
      };

      load();
    }]);
