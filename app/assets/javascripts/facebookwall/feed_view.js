FacebookWall.FeedView = FacebookWall.BaseView.extend({

  className: 'fbw-feed',

  template: _.template(''+
    '<div class="fbw-newpost-container" style="display:none">'+
      '<form class="fbw-newpost-form">'+
        '<table><tr>'+
        '<td width="1%">'+
        '<img src="http://graph.facebook.com/<%= session().userID %>/picture?type=square" class="fbw-user-thumb">'+
        '</td>'+
        '<td width="99%">'+
        '<input class="fbw-post-input" placeholder="Write a post..."></input>'+
        '</td>'+
        '</tr></td></table>'+
      '</form>'+
    '</div>'+
    '<div class="fbw-loading" style="display:none"></div>'+
    '<div class="fbw-empty" style="display:none">No posts</div>'+
    '<ul class="fbw-post-list"></ul>'+
    '<div class="fbw-load-container">'+
      '<button class="fbw-load-segment">Load more posts</button>'+
      '<button class="fbw-loading-segment" disabled="true" style="display:none">'+
        'Loading posts'+
      '</button>'+
    '</div>'
  ),

  events: {
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
    this.updatePost();
    this.updateLoadButton();
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
    var pc = this.$el.find(".fbw-newpost-container");
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
  }

})