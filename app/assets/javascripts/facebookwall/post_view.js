FacebookWall.PostView = FacebookWall.BaseView.extend({

  maxLikes: 4,

  tagName:    'li',
  className:  'fbw-post', 

  showingLikes: false,
  showingComments: true,

  template: _.template(''+
      '<div class="fbw-post-header">'+
        '<img src="<%= fromPicUrl("square") %>"></img>'+
        '<div class="fbw-post-from"><a href="<%= fromUrl() %>"><%= get("from").name %></a></div>'+
        '<div class="fbw-post-from-details"><%= formatDateTime(get("created_time")) %></div>'+
      '</div>'+
      '<div class="fbw-post-content">'+
        '<% if (get("message")) {%><%= linkify(get("message")) %><% } %>'+
      '</div>'+
      '<div class="fbw-post-controls">'+
        '<div class="fbw-post-controls-commands">'+
          '<span class="fbw-btn-like-post"></span> &sdot; '+
          '<span class="fbw-btn-comment-post">Comment</span>'+
        '</div>'+
        '<% if (get("likesCount") > 0) { %>'+
          '<div class="fbw-likes">'+
            '<a href="#"><%= get("likesCount") %>'+
            '<%= get("likesCount") > 1 ? " people</a> like this" : " person</a> likes this" %>'+
          '</div>'+
        '<% } %>'+
        '<div style="clear:both;"></div>'+
      '</div>'+
      '<div class="fbw-post-footer">'+
        '<ul class="fbw-comments" style="display:none;"></ul>'+
        '<div class="fbw-comments-comment" style="display:none;">'+
          '<form class="fbw-comments-comment-form">'+
            '<table><tr>'+
            '<td width="1%">'+
            '<img src="http://graph.facebook.com/<%= session().userID %>/picture?type=square" class="fbw-user-thumb">'+
            '</td>'+
            '<td width="99%">'+
            '<input class="fbw-comments-comment-input" placeholder="Write a comment"></input>'+
            '</td>'+
            '</tr></td></table>'+
          '</form>'+
        '</div>'+
      '</div>'+
    '</div>'
  ),

  templateLink: _.template(''+
    '<div class="fbw-post-type-link">'+
      '<a href="<%= linkAttributes().url %>" target="_blank">'+
        '<img class="fbw-post-link-picture" src="<%= linkAttributes().picture %>"></img>'+
      '</a>'+
      '<div class="fbw-post-link-title">'+
        '<a href="<%= linkAttributes().url %>" target="_blank"><%= linkAttributes().title %></a>'+
      '</div>'+
      '<div class="fbw-post-link-description"><%= linkAttributes().description %></div>'+
      '<div class="fbw-post-link-caption">'+
        '<a href="<%= linkAttributes().url %>" target="_blank">'+
          '<%= linkAttributes().caption %>'+
        '</a>'+
      '</div>'+
      '<div style="clear:both;"></div>'+
    '</div>'
  ),

  templatePhoto: _.template(''+
    '<div class="fbw-post-type-photo">'+
      '<img class="fbw-thumbnail" src="<%= picUrl("normal") %>"></img>'+
    '</div>'
  ),

  templateVideo: _.template(''+
    '<div class="fbw-post-type-video">'+
      '<a href="<%= get("link") %>" target="_blank">'+
        '<img class="fbw-thumbnail fbw-open-video" src="<%= picUrl("normal") %>"></img>'+
      '</a>'+
    '</div>'
  ),

  // templateVideoPayer: _.template(''+
  //   '<iframe src="https://www.facebook.com/video/embed?video_id=<%= linkedId() %>"'+
  //   ' frameborder="0"></iframe>'
  // ),

  events: {
    'click .fbw-show-comments': 'toggleComments',
    'click .fbw-show-likes': 'showLikes',
    'click .fbw-post-type-video .fbw-open-video': 'openVideo',
    'click .fbw-post-type-photo img': 'togglePicture',
    'click .fbw-btn-like-post': 'like',
    'click .fbw-btn-comment-post': 'showComment',
    'submit .fbw-comments-comment-form': 'comment'
  },

  initialize: function(options) {
    this.post = options.post;
    this.post.get('likes').on('all', this.render, this);
    this.post.get('comments').on('all', this.render, this);
    return this;
  },

  render: function() {
    this.$el.html(this.template(this.post));
    var content = this.$(".fbw-post-content");
    if (this.post.get('type') == "link") {
      content.append(this.templateLink(this.post));
    } else if (this.post.get('type') == "photo") {
      content.append(this.templatePhoto(this.post));
    } else if (this.post.get('type') == "video") {
      content.append(this.templateVideo(this.post));
    }
    if (this.showingLikes) this.showLikes();
    if (this.showingComments) this.showComments();
    this.renderLikeButton();
    return this;
  },

  renderLikeButton: function() {
    this.$('.fbw-btn-like-post').html(this.post.isLiked() ? 'Unlike' : 'Like');
  },

  togglePicture: function() {
    if (this.isShowingLargePicture) {
      var url = this.post.picUrl('normal');
      this.$('.fbw-post-type-photo img').attr('src', url);
      this.$('.fbw-post-type-photo img').addClass('fbw-thumbnail');
      this.isShowingLargePicture = false;
    } else {
      var url = this.post.picUrl('large');
      this.$('.fbw-post-type-photo img').attr('src', url);
      this.$('.fbw-post-type-photo img').removeClass('fbw-thumbnail');
      this.isShowingLargePicture = true;
    }
  },

  openVideo: function() {
    this.$(".fbw-post-type-video").html(this.templateVideoPayer(this.post));
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
      this.$('.fbw-likes').hide();
    } else {
      this.showingLikes = true;
      var count = this.post.get('likesCount');
      var likes = this.post.get('likes').models;
      var length = this.post.get('likes').length;
      if (length < 1) return; // Don't show if no likes.
      var likeEl = this.$('.fbw-likes');
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
    this.$('.fbw-comments-comment-input').focus();
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
    this.$('.fbw-comments').empty();
    this.$('.fbw-comments').show();
    this.post.get('comments').each(this.addComment, this);
    this.$('.fbw-comments-comment').show();
    this.$('.fbw-comments-comment-post').removeAttr('disabled');
  },

  hideComments: function() {
    this.showingComments = false;
    this.$('.fbw-comments').hide();
    this.$('.fbw-comments-comment').hide();
  },

  addComment: function(comment) {
    var cv = new FacebookWall.CommentView({comment: comment});
    this.$('.fbw-comments').append(cv.render().el);
  },

  comment: function(e) {
    e.preventDefault();
    try {
      var text = this.$('.fbw-comments-comment-input').val();
      if (text && !/^\s*$/.test(text)) {
        this.$('.fbw-comments-comment-post').attr('disabled', true);
        this.post.comment(text);
      }
    } catch (err) {
      console.log(err);
    }
    return false;
  }

})