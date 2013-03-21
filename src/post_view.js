FacebookWall.PostView = FacebookWall.BaseView.extend({

  maxLikes: 4,

  tagName:    'li',
  className:  '_fbw-post', 

  showingLikes: false,
  showingComments: false,

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
            '<span class="_fbw-post-link _fbw-btn-like-post"></span> &sdot; '+
            '<span class="_fbw-post-link _fbw-btn-comment-post">Comment</span>'+
          '</div>'+
          '<div class="_fbw-post-controls-views">'+
            '<% if (get("likesCount") > 0) { %>'+
              '<a href="javascript:void(0)" class="_fbw-show-likes _fbw-post-link">'+
                '<%= get("likesCount") %> Like<%if (get("likesCount") != 1) { %>s<%}%>'+
              '</a>  '+
            '<% } %>'+
            '<% if (get("commentsCount") > 0) { %>'+
              '&nbsp;<a href="javascript:void(0)" class="_fbw-show-comments _fbw-post-link">'+
                '<%= get("commentsCount") %> Comment<%if (get("commentsCount") != 1) { %>s<%}%>'+
              '</a>'+
            '<% } %>'+
          '</div>'+
          '<div style="clear:both;"></div>'+
        '</div>'+
        '<div class="_fbw-likes" style="display:none;"></div>'+
        '<ul class="_fbw-comments" style="display:none;"></ul>'+
        '<div class="_fbw-comments-comment" style="display:none;">'+
          '<form class="_fbw-comments-comment-form">'+
          '<table border="0" cellpadding="0" cellspacing="0"><tr><td width="100%">'+
            '<input class="_fbw-comments-comment-input"></input>'+
            '</td><td width="1%">'+
            '<button class="_fbw-comments-comment-post" type="submit">Post</button>'+
          '</td></tr></table>'+
          '</form>'+
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
    '<div class="_fbw-post-type-photo">'+
      '<img class="_fbw-thumbnail" src="<%= picUrl("normal") %>"></img>'+
    '</div>'
  ),

  events: {
    'click ._fbw-show-comments': 'toggleComments',
    'click ._fbw-show-likes': 'showLikes',
    'click ._fbw-post-type-photo img': 'loadLargePicture',
    'click ._fbw-btn-like-post': 'like',
    'click ._fbw-btn-comment-post': 'showComment',
    'submit ._fbw-comments-comment-form': 'comment'
  },

  initialize: function(options) {
    this.post = options.post;
    this.post.get('likes').on('all', this.render, this);
    this.post.get('comments').on('all', this.render, this);
    return this;
  },

  render: function() {
    this.$el.html(this.template(this.post));
    var content = this.$("._fbw-post-content");
    if (this.post.get('type') == "link") {
      content.append(this.templateLink(this.post));
    } else if (this.post.get('type') == "photo") {
      content.append(this.templatePhoto(this.post));
    } else if (this.post.get('type') == "video") {
      content.append(this.templateLink(this.post));
    }
    if (this.showingLikes) this.showLikes();
    if (this.showingComments) this.showComments();
    this.renderLikeButton();
    return this;
  },

  renderLikeButton: function() {
    this.$('._fbw-btn-like-post').html(this.post.isLiked() ? 'Unlike' : 'Like');
  },

  loadLargePicture: function() {
    var url = this.post.picUrl('large');
    this.$('._fbw-post-type-photo ._fbw-thumbnail').attr('src', url);
    this.$('._fbw-post-type-photo ._fbw-thumbnail').removeClass('_fbw-thumbnail');
  },

  like: function() {
    if (this.post.isLiked()) 
      this.post.unlike();
    else 
      this.post.like();
  },

  showLikes: function() {
    if (this.showingLikes) {
      this.showingLikes = false;
      this.$('._fbw-likes').hide();
    } else {
      this.showingLikes = true;
      var count = this.post.get('likesCount');
      var likes = this.post.get('likes').models;
      var length = this.post.get('likes').length;
      if (length < 1) return; // Don't show if no likes.
      var likeEl = this.$('._fbw-likes');
      var html = '';
      for (var i = 0; i < length && i < this.maxLikes; i++) {
        html += '<a href="' + likes[i].fbUrl() + '">' + likes[i].name() + '</a>';
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
        if (likes.length == 1 && !likes[0].isMe()) html += ' likes this';
        else html += ' like this';
      }
      likeEl.html(html);
      likeEl.show();
    }
  },

  showComment: function() {
    if (!this.showingComments) this.showComments();
    this.$('._fbw-comments-comment-input').focus();
  },

  toggleComments: function() {
    if (this.showingComments) {
      this.hideComments();
    } else {
      this.showComments();
    }
  },

  showComments: function() {
    this.showingComments = true;
    this.$('._fbw-comments').empty();
    this.$('._fbw-comments').show();
    this.post.get('comments').each(this.addComment, this);
    this.$('._fbw-comments-comment').show();
    this.$('._fbw-comments-comment-post').removeAttr('disabled');
  },

  hideComments: function() {
    this.showingComments = false;
    this.$('._fbw-comments').hide();
    this.$('._fbw-comments-comment').hide();
  },

  addComment: function(comment) {
    var cv = new FacebookWall.CommentView({comment: comment});
    this.$('._fbw-comments').append(cv.render().el);
  },

  comment: function(e) {
    e.preventDefault();
    try {
      var text = this.$('._fbw-comments-comment-input').val();
      if (text && !/^\s*$/.test(text)) {
        this.$('._fbw-comments-comment-post').attr('disabled', true);
        this.post.comment(text);
      }
    } catch (err) {
      console.log(err);
    }
    return false;
  }

})