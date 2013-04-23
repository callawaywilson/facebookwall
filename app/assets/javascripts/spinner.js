FacebookWall.Spinner = Backbone.View.extend({

  className: '_fbw-spinner ',

  render: function() {
    this.$el.html('<div class="_fbw-bar1"></div><div class="_fbw-bar2"></div><div class="_fbw-bar3"></div><div class="_fbw-bar4"></div><div class="_fbw-bar5"></div><div class="_fbw-bar6"></div><div class="_fbw-bar7"></div><div class="_fbw-bar8"></div><div class="_fbw-bar9"></div><div class="_fbw-bar10"></div><div class="_fbw-bar11"></div><div class="_fbw-bar12"></div>')
    return this;
  }
})