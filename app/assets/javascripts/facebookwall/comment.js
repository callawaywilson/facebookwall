FacebookWall.Comment = FacebookWall.Model.extend({

  name: function() {
    if (this.isMe())
      return "You";
    else
      return this.get('from').name;
  },

  isMe: function() {
    return this.session() && this.session().userID == this.get('from').id;
  },

  like: function() {
    var self = this;
    this.fbLike({
      type: 'like',
      success: function() {self.set('user_likes', true);}
    });
  },

  unlike: function() {
    var self = this;
    this.fbLike({
      type: 'unlike',
      success: function() {self.set('user_likes', false);}
    });
  }

});