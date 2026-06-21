angular.module('miniTwitterApp')
  .filter('initials', function () {
    return function (username) {
      return username ? username.slice(0, 2).toUpperCase() : '??';
    };
  })
  .filter('avatarColor', function () {
    const palette = ['#0d9488', '#0891b2', '#7c3aed', '#db2777', '#ea580c', '#65a30d', '#b45309'];
    return function (username) {
      if (!username) return palette[0];
      let hash = 0;
      for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
      }
      return palette[Math.abs(hash) % palette.length];
    };
  });
