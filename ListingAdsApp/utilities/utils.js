module.exports = {
  searchReformat: function (word) {
    return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
  },
  adsReformat: function (ads) {
    ads.forEach(ad => {
      if (ad.content.length > 20) {
        ad.content = ad.content.substr(0, 20) + '...';
      }
    });
    return ads;
  },

  adsTitleReformat: function (ads) {
    ads.forEach(ad => {
      if (ad.title.length > 10) {
        ad.title = ad.title.substr(0, 10) + '...';
      }
    });
    return ads;
  },
};