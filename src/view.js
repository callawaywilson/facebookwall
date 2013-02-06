FacebookWall.View = Backbone.View.extend({

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
      return date.format("ddd MMM Do at h:mm:ss a")
    }
  }

})