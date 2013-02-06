FacebookWall.Feed = FacebookWall.Collection.extend({

  model: FacebookWall.Post,

  url: function() {return this.urlRoot + "/" + this.id + "/feed"},

  initialize: function(models, options) {
    if (!options || !options.session || !options.session.accessToken) {
      throw "FacebookWall.Feed requires a session with accessToken";
    }
    if (!options || !options.id) {
      throw "FacebookWall.Feed requires an id";
    }
    this.id = options.id;
    this.session(options.session);
    this._limit = options.limit || this._defaults.limit;
  },

  session: function(session) {
    if (session) this._session = session;
    return this._session;
  }

})