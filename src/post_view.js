FacebookWall.PostView = FacebookWall.BaseView.extend({

  maxLikes: 4,

  tagName:    'li',
  className:  '_fbw-post', 

  template: _.template(''+
      '<div class="_fbw-post-header">'+
        '<img src="<%= fromPicUrl("square") %>"></img>'+
        '<div class="_fbw-post-from"><a href="<%= fromUrl() %>"><%= get("from").name %></a></div>'+
        '<div class="_fbw-post-from-details"><%= formatDateTime(get("created_time")) %></div>'+
      '</div>'+
      '<div class="_fbw-post-content">'+
        '<% if (get("message")) {%><%= linkify(get("message")) %><% } %>'+
      '</div>'+
      '<div class="_fbw-post-footer">'+
        '<div class="_fbw-post-controls">'+
          '<div class="_fbw-post-controls-commands">'+
            '<span class="_fbw-post-link">Like</span> &sdot; '+
            '<span class="_fbw-post-link">Comment</span>'+
          '</div>'+
          '<div class="_fbw-post-controls-views">'+
            '<% if (get("likesCount") > 0) { %>'+
              '<span class="_fbw-show-likes _fbw-post-link">'+
                '<%= get("likesCount") %> Like<%if (get("likesCount") != 1) { %>s<%}%>'+
              '</span>  '+
            '<% } %>'+
            '<% if (get("commentsCount") > 0) { %>'+
              '&nbsp;<span class="_fbw-show-comments _fbw-post-link">'+
                '<%= get("commentsCount") %> Comment<%if (get("commentsCount") != 1) { %>s<%}%>'+
              '</span>'+
            '<% } %>'+
          '</div>'+
          '<div style="clear:both;"></div>'+
        '</div>'+
        '<div class="_fbw-likes" style="display:none;"></div>'+
        '<ul class="_fbw-comments" style="display:none;"></ul>'+
        '<div class="_fbw-comments-comment" style="display:none;">'+
          '<table border="0" cellpadding="0" cellspacing="0"><tr><td width="100%">'+
            '<input class="_fbw-comments-comment-input"></input>'+
            '</td><td width="1%">'+
            '<button class="_fbw-comments-comment-post">Post</button>'+
          '</td></tr></table>'+
        '</div>'+
      '</div>'+
    '</div>'
  ),

  templateLink: _.template(''+
    '<div class="_fbw-post-type-link">'+
      '<a href="<%= get("link") %>" target="_blank">'+
        '<img class="_fbw-post-link-picture" src="<%= get("picture") %>"></img>'+
      '</a>'+
      '<div class="_fbw-post-link-name">'+
        '<a href="<%= get("link") %>" target="_blank"><%= get("name") %></a>'+
      '</div>'+
      '<div class="_fbw-post-link-caption"><%= get("caption") %></div>'+
      '<div class="_fbw-post-link-description"><%= get("description") %></div>'+
      '<div style="clear:both;"></div>'+
    '</div>'
  ),

  templatePhoto: _.template(''+
    '<div class="_fbw-post-photo">'+
      '<img src="<%= get("photo") %>"></img>'+
    '</div>'
  ),

  events: {
    'click ._fbw-show-comments': 'showComments',
    'click ._fbw-show-likes': 'showLikes',
    'click ._fbw-show-reply': 'showReply'
  },

  initialize: function(options) {
    this.post = options.post;
    return this;
  },

  render: function() {
    this.$el.html(this.template(this.post));
    var content = $(this.el).find("._fbw-post-content");
    if (this.post.get('type') == "link") {
      content.append(this.templateLink(this.post));
    } else if (this.post.get('type') == "photo") {
      content.append(this.templatePhoto(this.post));
    } else if (this.post.get('type') == "video") {
      content.append(this.templateLink(this.post));
    }
    return this;
  },

  showReply: function() {
    this.$el.find('.fbw-post-reply').show();
  },

  showLikes: function() {
    var count = this.post.get('likesCount');
    var likes = this.post.get('likes').models;
    var length = this.post.get('likes').length;
    var likeEl = this.$el.find('._fbw-likes');
    var html = '';
    for (var i = 0; i < length && i < this.maxLikes; i++) {
      html += '<a href="' + likes[i].userUrl() + '">' + likes[i].get('name') + '</a>';
      if (i == length - 2 && length == count) 
        html += ' and ';
      else if (i < length - 1) 
        html += ', ';
    }
    if (count > this.maxLikes) {
      var rest = count - length;
      if (rest == 1) html += ' and 1 other person likes this';
      else html += ', and ' + rest + ' other people like this';
    } else {
      if (likes.length == 1) html += ' likes this';
      else html += ' like this';
    }
    likeEl.html(html);
    likeEl.show();
  },

  showComment: function() {

  },

  showComments: function() {
    this.showReply();
    this.$el.find('._fbw-comments').empty();
    this.$el.find('._fbw-comments').show();
    console.log(this.post.get('comments'))
    this.post.get('comments').each(this.addComment, this);
  },

  addComment: function(comment) {
    var cv = new FacebookWall.CommentView({comment: comment});
    this.$el.find('._fbw-comments').append(cv.render().el);
  }

})