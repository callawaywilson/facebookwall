FacebookWall.Post = FacebookWall.Model.extend({

  parse: function(resp) {
    var comments = [];
    resp.commentsCount = resp.comments ? resp.comments.count : 0;
    if (resp.comments && resp.comments.data) {
      comments = _.map(resp.comments.data, function(comment) {
        return new FacebookWall.Comment(comment);
      });
    }
    resp.comments = new Backbone.Collection(comments, {
      model: FacebookWall.Comment
    });

    var likes = [];
    resp.likesCount = resp.likes ? resp.likes.count : 0;
    if (resp.likes && resp.likes.data) {
      likes = _.map(resp.likes.data, function(like) {
        return new FacebookWall.Like(like);
      })
    }
    resp.likes = new Backbone.Collection(likes, {
      model: FacebookWall.Like
    });

    return resp;
  },

  fromPicUrl: function(type) {
  	return this.fbPicUrl(this.get('from').id, type);
  },

  fromUrl: function() {
  	return this.fbUrl(this.get('from').id);
  },

  picUrl: function(type) {
    if (type == 'normal') {
      return this.get('picture').replace("_s.jpg", "_q.jpg");
    } else if (type == 'large') {
      return this.get('picture').replace("_s.jpg", "_n.jpg");
    } else {
      return this.get('picture');
    }
  }

});