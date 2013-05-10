// Facebook Wall
// author: Adam Wilson
//  adam@hugecity.us

FacebookWall = {};

// Base Backbone Classes
(function() {

  //Shared Methods for Model & Collection
  var shared = {

    urlRoot: 'https://graph.facebook.com',

    url: function() {return this.urlRoot + "/" + this.id},
    urlLike: function() {return this.url() + "/likes"},
    urlComment: function() {return this.url() + "/comments"},


    // Override sync to ensure that the access token is a data param
    // and datatype is jsonp (always x-domain to facebook)
    sync: function(method, model, options) {
      if (!options.data) options.data = {};
      options.data = _.extend(options.data, {
        access_token: this.session().accessToken
      });

      var success = options.success;
      var error = options.error;
      options = _.extend(options, {
        success: function(data, resp, respOptions) {

          // Facebook returns HTTP 200 on error, so intercept facebook errors and
          // call error callback instead. 
          if (resp.error) {
            if (error) error(data, resp, respOptions);
            else throw "Unhandled Error: " + JSON.stringify(resp);

          } else if (success) {
            data.fetched = true;
            success(data, resp, respOptions);
          }
        }
      })

      if (this._limit && !options.data.limit) 
        options.data.limit = this._limit; 
      options.dataType = 'jsonp';
      return Backbone.sync(method, model, options);
    },

    // Detect links in the text and turn into anchor tags.
    linkify: function(text) {
      var http = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
      var noHttp = /(^|[^\/])(www\.[-A-Z0-9+&@#\/%?=~_|!:,.;]+(\b|$))/gi;
      var mailto = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gi;
      var result = text.replace(http, '<a href="$1" target="_blank">$1</a>');
      result = result.replace(noHttp, '$1<a href="http://$2" target="_blank">$2</a>');
      result = result.replace(mailto, '<a href="mailto:$1">$1</a>');
      return result;
    },

    // Format a date that shows:
    //    < 12 Hours ago show 'N hours ago' text
    //    < 1 Hour ago show 'N minutes ago' text
    //    < 1 minute ago show 'seconds ago' text
    //    Else show 
    formatDateTime: function(val) {
      var date = moment(val),
        hoursAgoLimit = 60 * 60 * 12,
        minutesAgoLimit = 60 * 60,
        secondsLimit = 60;
      var diff = moment().unix() - date.unix();
      if (diff < secondsLimit) {
        return "seconds ago";
      } else if (diff < minutesAgoLimit) {
        var num = Math.floor(diff / 60);
        return  num + (num == 1 ? " minute ago" : " minutes ago");
      } else if (diff < hoursAgoLimit) {
        var num = Math.floor(diff / 60 / 60);
        return num + (num == 1 ? " hour ago" : " hours ago");
      } else {
        return date.format("ddd MMM Do [at] h:mm a")
      }
    }

  };

  // Default Facebook Collection Methods
  FacebookWall.Collection = Backbone.Collection.extend(_.extend({}, shared, {

    // Holds next and previous (urls) from last fetch
    // Uses cursor-based pagination, see: 
    // https://developers.facebook.com/docs/reference/api/pagination/
    paging: {},

    // Default
    _defaults: {
      limit: 50
    },

    session: function(session) {
      if (session) this._session = session;
      return this._session;
    },

    // Facebook embeds results in 'data' field for collections:
    parse: function(response) {
      this.paging = response.paging || {};
      return response.data;
    },

    hasNext: function() {
      return !!this.paging.next;
    },

    // Fetch the next page and add it to the collection
    fetchNext: function() {
      if (this.paging.next) {
        Backbone.sync('read', this, {
          url: this.paging.next,
          dataType: 'jsonp',
          success: function(model, resp, options) {
            _.each(model.parse(resp), function(data){
              model.add(new model.model(data, {parse: true}));
            })
            model.trigger('fetchedNext');
          }
        });
      }
    }

  }));

  // Default Facebook Model Methods
  FacebookWall.Model = Backbone.Model.extend(_.extend({}, shared, {

    // Get the picture url for the facebook id & type
    fbPicUrl: function(id, type) {
      var t = type || "large";
      return "https://graph.facebook.com/" + id + "/picture?type=" + t;
    },

    fbUrl: function(id) {
      return "https://www.facebook.com/" + (id || this.get("id"));
    },

    session: function(session) {
      if (this.collection) {
        return this.collection.session(session);
      } else {
        if (session) this._session = session;
        return this._session;
      }
    },

    fromPicUrl: function(type) {
      return this.fbPicUrl(this.get('from').id, type);
    },

    fromUrl: function() {
      return this.fbUrl(this.get('from').id);
    },

    picUrl: function(type) {
      if (type == 'normal') {
        return this.get('picture').replace("_s.jpg", "_q.jpg");
      } else if (type == 'large') {
        return this.get('picture').replace("_s.jpg", "_n.jpg");
      } else {
        return this.get('picture');
      }
    },

    fbLike: function(options) {
      return $.ajax({
        url: this.urlLike(),
        dataType: 'jsonp',
        data: {
          method: options.type == 'unlike' ? 'delete' : 'post',
          access_token: this.session().accessToken
        },
        success: options.success,
        error: options.error
      });
    },

    fbComment: function(options) {
      return $.ajax({
        url: this.urlComment(),
        dataType: 'jsonp',
        data: {
          method: options.type == 'delete' ? 'delete' : 'post',
          access_token: this.session().accessToken,
          message: options.message
        },
        success: options.success,
        error: options.error
      });
    }

  }));

})();

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

FacebookWall.Feed = FacebookWall.Collection.extend({

  model: FacebookWall.Post,

  url: function() {return this.urlRoot + "/" + this.id + "/feed"},

  initialize: function(models, options) {
    if (!options || !options.session || !options.session.accessToken || 
        !options.session.userID) {
      throw "FacebookWall.Feed requires a session with accessToken and userID";
    }
    if (!options || !options.id) {
      throw "FacebookWall.Feed requires an id";
    }
    this.id = options.id;
    this.can_post = options.can_post;
    this.session(options.session);
    this._limit = options.limit || this._defaults.limit;
    return this;
  },

  // Returns whether or not the session's user can post to the feed.
  // Since there's no reliable way to determine, this property must be
  // passed in through the initializer.
  canPost: function() {
    return this.can_post;
  }

})

FacebookWall.BaseView = Backbone.View.extend({

  

})

FacebookWall.FeedView = FacebookWall.BaseView.extend({

  className: 'fbw-feed',

  template: _.template(''+
    '<div class="fbw-loading" style="display:none"></div>'+
    '<div class="fbw-empty" style="display:none">No posts</div>'+
    '<div class="fbw-post-container" style="display:none">'+
      '<textarea class="fbw-post-textarea" placeholder="Write a post.."></textarea>'+
      '<div class="fbw-post-feed-controls" style="display:none">'+
        '<button class="btn btn-success post-feed-button">Post</button>'+
        '<button class="btn btn-success disabled posting-feed-button" style="display:none">'+
          '<img class="fb_spinner"></img>'+
          'Posting'+
        '</button>'+
      '</div>'+
    '</div>'+
    '<ul class="fbw-post-list"></ul>'+
    '<div class="fbw-load-container">'+
      '<button class="fbw-load-segment">Load more posts</button>'+
      '<button class="fbw-loading-segment" disabled="true" style="display:none">'+
        'Loading posts'+
      '</button>'+
    '</div>'
  ),

  events: {
    "focusin .fbw-post-textarea": "showPostControls",
    'click .fbw-load-segment': 'loadNext'
  },

  initialize: function(options) {
    this.feed = options.feed;
    this.feed.on('reset', this.reset, this);
    this.feed.on('add', this.add, this);
    this.feed.on('fetchedNext', this.updateLoadButton, this);
    return this;
  },

  render: function() {
    this.$el.html(this.template(this.feed));
    this.feed.each(this.add, this);
    if (!this.fetched) {
      this.showLoading();
    } else if (this.feed.size() < 1) {
      this.showEmpty();
    }
    this.updateLoadButton();
    // this.updatePost();
    return this;
  },

  reset: function() {
    this.$el.find(".fbw-loading").hide();
    this.$el.find(".fbw-empty").hide();
    this.$el.find('.fbw-post-list').empty();
    if (this.feed.size() < 1) {
      this.showEmpty();
    } else {
      this.feed.each(this.add, this);
      this.updateLoadButton();
    }
  },

  add: function(post) {
    var li = new FacebookWall.PostView({post: post});
    this.$el.find('.fbw-post-list').append(li.render().el);
  },

  loadNext: function() {
    this.feed.fetchNext();
    this.updateLoadingButton();
  },

  updateLoadingButton: function() {
    this.$el.find('.fbw-loading-segment').show();
    this.$el.find('.fbw-load-segment').hide();
  },

  updateLoadButton: function() {
    this.$el.find('.fbw-loading-segment').hide();
    this.$el.find('.fbw-load-segment').show();
    var lc = this.$el.find(".fbw-load-container");
    if (this.feed.hasNext()) lc.show();
    else lc.hide();
  },

  updatePost: function() {
    var pc = this.$el.find(".fbw-post-container");
    if (this.feed.canPost()) pc.show();
    else pc.hide();
  },

  showLoading: function() {
    this.$el.find(".fbw-loading").show();
    this.$el.find(".fbw-loading").html("Loading Posts<br/>");
    this.$el.find(".fbw-loading").append(new FacebookWall.Spinner().render().el);
    this.$el.find(".fbw-empty").hide();
  },

  showEmpty: function() {
    this.$el.find(".fbw-loading").hide();
    this.$el.find(".fbw-empty").show();
  },

  showPostControls: function() {
    this.$el.find(".fbw-post-textarea").addClass('focused');
    this.$el.find(".fbw-post-feed-controls").show();
  }

})

FacebookWall.PostView = FacebookWall.BaseView.extend({

  maxLikes: 4,

  tagName:    'li',
  className:  'fbw-post', 

  showingLikes: false,
  showingComments: false,

  template: _.template(''+
      '<div class="fbw-post-header">'+
        '<img src="<%= fromPicUrl("square") %>"></img>'+
        '<div class="fbw-post-from"><a href="<%= fromUrl() %>"><%= get("from").name %></a></div>'+
        '<div class="fbw-post-from-details"><%= formatDateTime(get("created_time")) %></div>'+
      '</div>'+
      '<div class="fbw-post-content">'+
        '<% if (get("message")) {%><%= linkify(get("message")) %><% } %>'+
      '</div>'+
      '<div class="fbw-post-footer">'+
        '<div class="fbw-post-controls">'+
          // '<div class="fbw-post-controls-commands">'+
          //   '<span class="fbw-post-link fbw-btn-like-post"></span> &sdot; '+
          //   '<span class="fbw-post-link fbw-btn-comment-post">Comment</span>'+
          // '</div>'+
          '<div class="fbw-post-controls-views">'+
            '<% if (get("likesCount") > 0) { %>'+
              '<a href="javascript:void(0)" class="fbw-show-likes fbw-post-link">'+
                '<%= get("likesCount") %> Like<%if (get("likesCount") != 1) { %>s<%}%>'+
              '</a>  '+
            '<% } %>'+
            '<% if (get("commentsCount") > 0) { %>'+
              '&nbsp;<a href="javascript:void(0)" class="fbw-show-comments fbw-post-link">'+
                '<%= get("commentsCount") %> Comment<%if (get("commentsCount") != 1) { %>s<%}%>'+
              '</a>'+
            '<% } %>'+
          '</div>'+
          '<div style="clear:both;"></div>'+
        '</div>'+
        '<div class="fbw-likes" style="display:none;"></div>'+
        '<ul class="fbw-comments" style="display:none;"></ul>'+
        '<div class="fbw-comments-comment" style="display:none;">'+
          '<form class="fbw-comments-comment-form">'+
          '<table border="0" cellpadding="0" cellspacing="0"><tr><td width="100%">'+
            '<input class="fbw-comments-comment-input"></input>'+
            '</td><td width="1%">'+
            '<button class="fbw-comments-comment-post" type="submit">Post</button>'+
          '</td></tr></table>'+
          '</form>'+
        '</div>'+
      '</div>'+
    '</div>'
  ),

  templateLink: _.template(''+
    '<div class="fbw-post-type-link">'+
      '<a href="<%= get("link") %>" target="_blank">'+
        '<img class="fbw-post-link-picture" src="<%= get("picture") %>"></img>'+
      '</a>'+
      '<div class="fbw-post-link-name">'+
        '<a href="<%= get("link") %>" target="_blank"><%= get("name") %></a>'+
      '</div>'+
      '<div class="fbw-post-link-caption"><%= get("caption") %></div>'+
      '<div class="fbw-post-link-description"><%= get("description") %></div>'+
      '<div style="clear:both;"></div>'+
    '</div>'
  ),

  templatePhoto: _.template(''+
    '<div class="fbw-post-type-photo">'+
      '<img class="fbw-thumbnail" src="<%= picUrl("normal") %>"></img>'+
    '</div>'
  ),

  events: {
    'click .fbw-show-comments': 'toggleComments',
    'click .fbw-show-likes': 'showLikes',
    'click .fbw-post-type-photo img': 'loadLargePicture',
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
      content.append(this.templateLink(this.post));
    }
    if (this.showingLikes) this.showLikes();
    if (this.showingComments) this.showComments();
    this.renderLikeButton();
    return this;
  },

  renderLikeButton: function() {
    this.$('.fbw-btn-like-post').html(this.post.isLiked() ? 'Unlike' : 'Like');
  },

  loadLargePicture: function() {
    var url = this.post.picUrl('large');
    this.$('.fbw-post-type-photo .fbw-thumbnail').attr('src', url);
    this.$('.fbw-post-type-photo .fbw-thumbnail').removeClass('fbw-thumbnail');
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

FacebookWall.CommentView = FacebookWall.BaseView.extend({

	tagName: 'li',

	template: _.template(''+
    '<img src="<%= fromPicUrl("square") %>"></img>'+
    '<div class="fbw-comment-from">'+
      '<a href="<%= fromUrl() %>"><%= name() %></a>'+
    '</div>'+
    '<div class="fbw-comment-content"><%= get("message") %></div>'+
    ' <div class="fbw-comment-controls">'+
      '<span class="fbw-comment-time">'+
        '<%= formatDateTime(get("created_time")) %>'+
        // ' &sdot; '+
      '</span> '+
      // '<% if (get("user_likes")) { %>'+
      //   '<a class="fbw-comment-unlike" href="javascript:void(0)">Unlike</a>'+
      // '<% } else { %>'+
      //   '<a class="fbw-comment-like" href="javascript:void(0)">Like</a>'+
      // '<% } %>'+
    '</div>'
  ),

  events: {
    'click .fbw-comment-like': 'like',
    'click .fbw-comment-unlike': 'unlike'
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

FacebookWall.Spinner = Backbone.View.extend({

  className: 'fbw-spinner ',

  render: function() {
    this.$el.html('<div class="fbw-bar1"></div><div class="fbw-bar2"></div><div class="fbw-bar3"></div><div class="fbw-bar4"></div><div class="fbw-bar5"></div><div class="fbw-bar6"></div><div class="fbw-bar7"></div><div class="fbw-bar8"></div><div class="fbw-bar9"></div><div class="fbw-bar10"></div><div class="fbw-bar11"></div><div class="fbw-bar12"></div>')
    return this;
  }
})