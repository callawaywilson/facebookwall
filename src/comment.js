FacebookWall.Comment = FacebookWall.Model.extend({

  fromPicUrl: function(type) {
    return this.fbPicUrl(this.get('from').id, type);
  },

  fromUrl: function() {
    return this.fbUrl(this.get('from').id);
  }
  
})