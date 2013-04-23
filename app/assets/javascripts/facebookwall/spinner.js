FacebookWall.Spinner = Backbone.View.extend({

  className: 'fbw-spinner ',

  render: function() {
    this.$el.html('<div class="fbw-bar1"></div><div class="fbw-bar2"></div><div class="fbw-bar3"></div><div class="fbw-bar4"></div><div class="fbw-bar5"></div><div class="fbw-bar6"></div><div class="fbw-bar7"></div><div class="fbw-bar8"></div><div class="fbw-bar9"></div><div class="fbw-bar10"></div><div class="fbw-bar11"></div><div class="fbw-bar12"></div>')
    return this;
  }
})