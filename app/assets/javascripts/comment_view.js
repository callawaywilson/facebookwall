FacebookWall.CommentView = FacebookWall.BaseView.extend({

	tagName: 'li',

	template: _.template(''+
    '<img src="<%= fromPicUrl("square") %>"></img>'+
    '<div class="_fbw-comment-from">'+
      '<a href="<%= fromUrl() %>"><%= name() %></a>'+
    '</div>'+
    '<div class="_fbw-comment-content"><%= get("message") %></div>'+
    ' <div class="_fbw-comment-controls">'+
      '<span class="_fbw-comment-time">'+
        '<%= formatDateTime(get("created_time")) %>'+
        // ' &sdot; '+
      '</span> '+
      // '<% if (get("user_likes")) { %>'+
      //   '<a class="_fbw-comment-unlike" href="javascript:void(0)">Unlike</a>'+
      // '<% } else { %>'+
      //   '<a class="_fbw-comment-like" href="javascript:void(0)">Like</a>'+
      // '<% } %>'+
    '</div>'
  ),

  events: {
    'click ._fbw-comment-like': 'like',
    'click ._fbw-comment-unlike': 'unlike'
  },

  initialize: function(options) {
    this.comment = options.comment;
    this.comment.on('change', this.render, this);
    return this;
  },

  render: function(options) {
    this.$el.html(this.template(this.comment));
    return this;
  },

  like: function() {
    this.comment.like();
  },

  unlike: function() {
    this.comment.unlike();
  }

});