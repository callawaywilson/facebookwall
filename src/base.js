// Facebook Wall
// author: Adam Wilson
//  adam@hugecity.us

FacebookWall = {};

// Base Backbone Classes
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

       
      var success = options.success;
      var error = options.error;
      options = _.extend(options, {
        success: function(data, resp, respOptions) {

          // Facebook returns HTTP 200 on error, so intercept facebook errors and
          // call error callback instead. 
          if (resp.error) {
            if (error) error(data, resp, respOptions);
            else throw "Unhandled Error: " + JSON.stringify(resp);

          // Facebook embeds results in 'data' field:
          } else if (success) {
            success(data, resp, respOptions);
          }
        }
      })

      if (this._limit && !options.data.limit) 
        options.data.limit = this._limit; 
      options.dataType = 'jsonp';
      return Backbone.sync(method, model, options);
    },

    // Detect links in the text and turn into anchor tags.
    linkify: function(text) {
      var http = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
      var noHttp = /(^|[^\/])(www\.[-A-Z0-9+&@#\/%?=~_|!:,.;]+(\b|$))/gi;
      var mailto = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gi;
      var result = text.replace(http, '<a href="$1" target="_blank">$1</a>');
      result = result.replace(noHttp, '$1<a href="http://$2" target="_blank">$2</a>');
      result = result.replace(mailto, '<a href="mailto:$1">$1</a>');
      return result;
    },

    // Format a date that shows:
    //    < 12 Hours ago show 'N hours ago' text
    //    < 1 Hour ago show 'N minutes ago' text
    //    < 1 minute ago show 'seconds ago' text
    //    Else show 
    formatDateTime: function(val) {
      var date = moment(val),
        hoursAgoLimit = 60 * 60 * 12,
        minutesAgoLimit = 60 * 60,
        secondsLimit = 60;
      var diff = moment().unix() - date.unix();
      if (diff < secondsLimit) {
        return "seconds ago";
      } else if (diff < minutesAgoLimit) {
        var num = Math.floor(diff / 60);
        return  num + (num == 1 ? " minute ago" : " minutes ago");
      } else if (diff < hoursAgoLimit) {
        var num = Math.floor(diff / 60 / 60);
        return num + (num == 1 ? " hour ago" : " hours ago");
      } else {
        return date.format("ddd MMM Do [at] h:mm a")
      }
    },

    // Get the picture url for the facebook id & type
    fbPicUrl: function(id, type) {
      var t = type || "large";
      return "https://graph.facebook.com/" + id + "/picture?type=" + t;
    },

    fbUrl: function(id) {
      return "https://www.facebook.com/" + (id || this.get("id"));
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
      limit: 50
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
            model.trigger('fetchedNext');
          }
        });
      }
    }

  }));

  // Default Facebook Model Methods
  FacebookWall.Model = Backbone.Model.extend(shared);

})();