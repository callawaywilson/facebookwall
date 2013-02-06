FacebookWall.Post = FacebookWall.Model.extend({

  parse: function(resp) {
    if (resp.comments) {
      var comments = _.map(resp.comments, function(comment) {
        return new FacebookWall.Comment(comment, {parse: true});
      });
      resp.comments = new Backbone.Collection(comments);
    }
  }

})