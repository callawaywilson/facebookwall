FacebookWall.CommentView = FacebookWall.BaseView.extend({

	tagName: 'li',

	template: _.template(''+
    '<img src="<%= fromPicUrl("square") %>"></img>'+
    '<div class="_fbw-comment-from">'+
      '<a href="<%= fromUrl() %>"><%= get("from").name %></a>'+
    '</div>'+
    '<div class="_fbw-comment-content"><%= get("message") %></div>'+
    ' <div class="_fbw-comment-controls">'+
      '<span class="_fbw-comment-time">'+
        '<%= formatDateTime(get("created_time")) %> &sdot;'+
      '</span> '+
      '<a href="#">Like</a>'+
    '</div>'
  ),

  initialize: function(options) {
    this.comment = options.comment;
    return this;
  },

  render: function(options) {
    this.$el.html(this.template(this.comment));
    return this;
  }

});