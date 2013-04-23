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