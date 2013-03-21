FacebookWall.Feed = FacebookWall.Collection.extend({

  model: FacebookWall.Post,

  url: function() {return this.urlRoot + "/" + this.id + "/feed"},

  initialize: function(models, options) {
    if (!options || !options.session || !options.session.accessToken || 
        !options.session.userID) {
      throw "FacebookWall.Feed requires a session with accessToken and userID";
    }
    if (!options || !options.id) {
      throw "FacebookWall.Feed requires an id";
    }
    this.id = options.id;
    this.can_post = options.can_post;
    this.session(options.session);
    this._limit = options.limit || this._defaults.limit;
    return this;
  },

  // Returns whether or not the session's user can post to the feed.
  // Since there's no reliable way to determine, this property must be
  // passed in through the initializer.
  canPost: function() {
    return this.can_post;
  }

})