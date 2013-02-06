(function() {

  //Shared Methods for Model & Collection
  var shared = {

    urlRoot: 'https://graph.facebook.com',

    url: function() {return this.urlRoot + "/" + this.id},

    // Override sync to ensure that the access token is a data param
    // and datatype is jsonp (always x-domain to facebook)
    sync: function(method, model, options) {
      if (!options.data) options.data = {};
      options.data = _.extend(options.data, {
        access_token: this.session().accessToken
      });
      if (this._limit && !options.data.limit) 
        options.data.limit = this._limit; 
      options.dataType = 'jsonp';
      return Backbone.sync(method, model, options);
    }

  };

  // Default Facebook Collection Methods
  FacebookWall.Collection = Backbone.Collection.extend(_.extend(shared, {

    // Holds next and previous (urls) from last fetch
    // Uses cursor-based pagination, see: 
    // https://developers.facebook.com/docs/reference/api/pagination/
    paging: {},

    // Default
    _defaults: {
      limit: 25
    },

    parse: function(response) {
      this.paging = response.paging || {};
      return response.data;
    },

    hasNext: function() {
      return !!this.paging.next;
    },

    // Fetch the next page and add it to the collection
    fetchNext: function() {
      if (this.paging.next) {
        Backbone.sync('read', this, {
          url: this.paging.next,
          dataType: 'jsonp',
          success: function(model, resp, options) {
            model.add(model.parse(resp));
          }
        });
      }
    }

  }));

  // Default Facebook Model Methods
  FacebookWall.Model = Backbone.Model.extend(shared);

})();