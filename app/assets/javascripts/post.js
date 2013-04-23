FacebookWall.Post = FacebookWall.Model.extend({

  parse: function(resp) {
    var comments = [];
    resp.commentsCount = resp.comments ? resp.comments.count : 0;
    if (resp.comments && resp.comments.data) {
      comments = _.map(resp.comments.data, function(comment) {
        return new FacebookWall.Comment(comment);
      });
    }
    resp.comments = new FacebookWall.Collection(comments, {
      model: FacebookWall.Comment
    });
    resp.comments.session(this.session());

    var likes = [];
    resp.likesCount = resp.likes ? resp.likes.count : 0;
    if (resp.likes && resp.likes.data) {
      likes = _.map(resp.likes.data, function(like) {
        return new FacebookWall.Like(like);
      })
    }
    resp.likes = new FacebookWall.Collection(likes, {
      model: FacebookWall.Like,
    });
    resp.likes.session(this.session());

    return resp;
  },

  isLiked: function() {
    var userID = this.session().userID;
    if (!userID) return false;
    return this.get('likes').some(function(like) {
      return userID == like.get('id')
    });
  },

  comment: function(text) {
    var self = this;
    this.fbComment({
      type: 'post',
      message: text,
      success: function(data) {
        if (data.id) {
          self.get('comments').push(new FacebookWall.Comment({
            id: data.id,
            from: {name: 'You', id: self.session().userID},
            message: text,
            created_time: new Date()
          }))
          self.set('commentsCount', self.get('commentsCount') + 1);
        }
      },
      error: function() {

      }
    });
  },

  like: function() {
    var self = this;
    this.fbLike({
      type: 'like',
      success: function(data) {
        self.set('likesCount', self.get('likesCount') + 1);
        self.get('likes').unshift({name: 'You', id: self.session().userID});
      }
    });
  },

  unlike: function() {
    var self = this;
    this.fbLike({
      type: 'unlike',
      success: function(data) {
        var likes = self.get('likes');
        var myLikes = likes.filter(function(like) {
          return like.get('id') == self.session().userID;
        })
        self.set('likesCount', self.get('likesCount') - myLikes.length);
        likes.remove(myLikes);
      }
    });
  }

});