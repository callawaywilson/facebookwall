require 'rubygems'
require 'uglifier'

# Load order of javascript files:
js_files = [
  'src/base.js',
  'src/post.js',
  'src/comment.js',
  'src/like.js',
  'src/feed.js',
  'src/base_view.js',
  'src/feed_view.js',
  'src/post_view.js',
  'src/comment_view.js'
]

# Load order of library files:
lib_files = [
  'lib/zepto.js',
  'lib/underscore.js',
  'lib/backbone.js',
  'lib/moment.js',
]

# Javascript output files:
js_file     = 'app/facebookwall.js'
js_app_file = 'app/facebookwall_app.js'
js_lib_file = 'app/facebookwall_lib.js'

# Load order of css files:
css_files = [
  'css/base.css'
]

# CSS output files:
css_file = 'app/facebookwall.css'

# Html files
html_source_file_name = 'html/facebookwall.html'
html_file_name = 'app/facebookwall.html'

# S3 deployment locations
s3_html_file_name = 'facebookwall.html'
s3_bucket = 'hugecity-ios'


#
# TASKS
#

desc "deploy the build artifacts to S3"
task :deploy => [:build] do
end

desc "build the project, javascript, css, and html"
task :build => [:build_js, :build_css, :build_html] do
end

desc "build the embeddable html file" 
task :build_html => [:build_js, :build_css] do
  js = File.read js_file
  css = File.read css_file
  html = File.read html_source_file_name
  html.sub!("$FACEBOOKWALL_STYLE") {css}
  html.sub!("$FACEBOOKWALL_JAVASCRIPT") {js}
  File.open(html_file_name, 'w') {|f| f.write html}
end

desc "build the javascript file"
task :build_js => [:build_js_app, :build_js_lib] do
  js = [js_lib_file, js_app_file].map{|f| File.read f }.join("\n")
  File.open(js_file, 'w') {|f| f.write js }
end

desc "build application javascript file"
task :build_js_app do
  js = Uglifier.compile js_files.map{|f| File.read f }.join("\n")
  File.open(js_app_file, 'w') {|f| f.write js }
end

desc "build library javascript file"
task :build_js_lib do
  js = Uglifier.compile lib_files.map{|f| File.read f }.join(';')
  File.open(js_lib_file, 'w') {|f| f.write js }
end

desc "build css"
task :build_css do
  css = css_files.map{|f| File.read f }.join(';')
  css.gsub! "\n", ""
  File.open(css_file, 'w') {|f| f.write css }
end