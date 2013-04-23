FacebookWall.Like = FacebookWall.Model.extend({

  userUrl: function() {
    return this.fbUrl(this.get('id'));
  },

  name: function() {
    if (this.isMe())
      return "You";
    else
      return this.get('name');
  },

  isMe: function() {
    return this.session() && this.session().userID == this.get('id');
  }

})