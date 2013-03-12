FacebookWall.Like = FacebookWall.Model.extend({

  userUrl: function() {
    return this.fbUrl(this.get('id'));
  }

})