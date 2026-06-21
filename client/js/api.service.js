angular.module('miniTwitterApp')
  .factory('ApiService', ['$http', '$q', '$location', function ($http, $q, $location) {

    const API_BASE = 'http://localhost:8080/minitwitter';

    function request(method, endpoint, data) {
      const token = sessionStorage.getItem('jwt_token');
      const headers = {};
      if (token) headers.Authorization = 'Bearer ' + token;

      return $http({ method, url: API_BASE + endpoint, data, headers })
        .then((response) => response.data)
        .catch((response) => {
          if (response.status === 401) {
            sessionStorage.clear();
            $location.path('/login');
          }
          const message = (response.data && response.data.message) || 'Error de red';
          return $q.reject(new Error(message));
        });
    }

    return {
      login(username, password) {
        return request('POST', '/login', { username, password });
      },

      getTuit(id) {
        return request('GET', `/tuit/${id}`);
      },

      getTuits(limit = 50, offset = 0) {
        return request('GET', `/tuits?limit=${limit}&offset=${offset}`);
      },

      getUserTuits(username, limit = 50, offset = 0) {
        return request('GET', `/usuario/${encodeURIComponent(username)}/tuits?limit=${limit}&offset=${offset}`);
      },

      getTuitReplies(id) {
        return request('GET', `/tuit/${id}/respuestas`);
      },

      postTuit(texto, media_type, media_url) {
        const body = { texto };
        if (media_type && media_type !== 'none') {
          body.media_type = media_type;
          body.media_url = media_url;
        }
        return request('POST', '/tuit', body);
      },

      deleteTuit(id) {
        return request('DELETE', `/tuit/${id}`);
      },

      likeToggle(id, isLike) {
        return request(isLike ? 'PUT' : 'DELETE', `/tuit/${id}/like`);
      },

      retuitToggle(id, isRT) {
        return request(isRT ? 'PUT' : 'DELETE', `/tuit/${id}/retuit`);
      },

      replyToTuit(id, texto, media_type, media_url) {
        const body = { texto };
        if (media_type && media_type !== 'none') {
          body.media_type = media_type;
          body.media_url = media_url;
        }
        return request('POST', `/tuit/${id}/responder`, body);
      },
    };
  }]);
