require 'rubygems'
require 'uglifier'

# Load order of javascript files:
js_file_root = "app/assets/javascripts/facebookwall/" 
js_files = [
  "#{js_file_root}/base.js",
  "#{js_file_root}/post.js",
  "#{js_file_root}/comment.js",
  "#{js_file_root}/like.js",
  "#{js_file_root}/feed.js",
  "#{js_file_root}/base_view.js",
  "#{js_file_root}/feed_view.js",
  "#{js_file_root}/post_view.js",
  "#{js_file_root}/comment_view.js",
  "#{js_file_root}/spinner.js"
]

# Load order of library files:
lib_file_root = "app/assets/lib"
lib_files = [
  "#{lib_file_root}/zepto.js",
  "#{lib_file_root}/underscore.js",
  "#{lib_file_root}/backbone.js",
  "#{lib_file_root}/moment.js",
]

# Load order of embed files:
embed_files = [
  "#{lib_file_root}/underscore.js",
  "#{lib_file_root}/backbone.js",
  "#{lib_file_root}/moment.js",
]

# Javascript output files:
js_file       = "fbw.js"
js_min_file   = "fbw.min.js"
js_full_file  = "fbw_full.min.js"
js_embed_file  = "fbw_embed.min.js"
js_rails_file = "app/assets/javascripts/facebookwall.js"

# Load order of css files:
css_files = [
  "app/assets/css/facebookwall/base.css",
  "app/assets/css/facebookwall/spinner.css"
]

# CSS output files:
css_file        = "fbw.css"
css_rails_file  = "app/assets/css/facebookwall.css"



#
# TASKS
#

desc "build the project, javascript, css, and html"
task :build => [:build_js, :build_js_full, :build_css, :build_rails] do
end

desc "build the files for the rails gem"
task :build_rails do 
  js = js_files.map{|f| File.read f }.join("\n\n")
  File.open(js_rails_file, 'w') {|f| f.write js }
  css = css_files.map{|f| File.read f }.join(';')
  File.open(css_rails_file, 'w') {|f| f.write css }
end

desc "build the javascript & minified javascript file"
task :build_js do
  js = js_files.map{|f| File.read f }.join("\n\n")
  File.open(js_file, 'w') {|f| f.write js }
  js_min = Uglifier.compile js
  File.open(js_min_file, 'w') {|f| f.write js_min }
end

desc "build full, minified javascript file (includes backbone components & libraries)"
task :build_js_full do
  js = lib_files.map{|f| File.read f }.join(";\n")
  js << ";\n"
  js << js_files.map{|f| File.read f }.join("\n")
  js = Uglifier.compile js
  File.open(js_full_file, 'w') {|f| f.write js }
end

desc "build embeddable version, without zepto but with backbone and moment"
task :build_embed do
  js = embed_files.map{|f| File.read f }.join(";\n")
  js << ";\n"
  js << js_files.map{|f| File.read f }.join("\n")
  js = Uglifier.compile js
  File.open(js_embed_file, 'w') {|f| f.write js }
end

desc "build css"
task :build_css do
  css = css_files.map{|f| File.read f }.join(';')
  File.open(css_file, 'w') {|f| f.write css }
end
