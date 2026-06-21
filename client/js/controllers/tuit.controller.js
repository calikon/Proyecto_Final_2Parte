angular.module('miniTwitterApp')
  .controller('TuitController', ['$scope', '$routeParams', '$location', '$q', 'ApiService',
    function ($scope, $routeParams, $location, $q, ApiService) {
      $scope.tuitId = $routeParams.id;
      $scope.tuit = null;
      $scope.replies = [];
      $scope.loading = true;
      $scope.errorMessage = '';
      $scope.myUserId = sessionStorage.getItem('user_id') || '';

      $scope.replyTexto = '';
      $scope.replyError = '';
      $scope.replying = false;

      function load() {
        $scope.loading = true;
        $q.all([
          ApiService.getTuit($scope.tuitId),
          ApiService.getTuitReplies($scope.tuitId),
        ])
          .then(function (results) {
            $scope.tuit = results[0];
            $scope.replies = results[1];
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

      $scope.deleteReply = function (t) {
        if (!confirm('¿Eliminar este tuit? Esta acción no se puede deshacer.')) return;
        ApiService.deleteTuit(t.id).then(function () {
          $scope.replies = $scope.replies.filter(function (r) { return r.id !== t.id; });
        });
      };

      $scope.openUsuario = function (username) {
        $location.path('/usuario/' + username);
      };

      $scope.submitReply = function () {
        const texto = ($scope.replyTexto || '').trim();
        $scope.replyError = '';

        if (!texto) {
          $scope.replyError = 'El texto no puede estar vacío.';
          return;
        }
        if (texto.length > 300) {
          $scope.replyError = 'Máximo 300 caracteres.';
          return;
        }

        $scope.replying = true;
        ApiService.replyToTuit($scope.tuitId, texto)
          .then(function (reply) {
            $scope.replies.push(reply);
            $scope.tuit.num_respuestas += 1;
            $scope.replyTexto = '';
          })
          .catch(function (err) {
            $scope.replyError = err.message;
          })
          .finally(function () {
            $scope.replying = false;
          });
      };

      load();
    }]);
