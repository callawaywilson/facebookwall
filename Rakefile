require 'rubygems'
require 'uglifier'
require 'fog'
require 'yaml'

# Load order of javascript files:
js_files = [
  'app/assets/javascripts/base.js',
  'app/assets/javascripts/post.js',
  'app/assets/javascripts/comment.js',
  'app/assets/javascripts/like.js',
  'app/assets/javascripts/feed.js',
  'app/assets/javascripts/base_view.js',
  'app/assets/javascripts/feed_view.js',
  'app/assets/javascripts/post_view.js',
  'app/assets/javascripts/comment_view.js',
  'app/assets/javascripts/spinner.js'
]

# Load order of library files:
lib_files = [
  'app/assets/lib/zepto.js',
  'app/assets/lib/underscore.js',
  'app/assets/lib/backbone.js',
  'app/assets/lib/moment.js',
]

# Javascript output files:
js_file     = 'facebookwall.js'
js_app_file = 'facebookwall_app.js'
js_lib_file = 'facebookwall_lib.js'

# Load order of css files:
css_files = [
  'app/assets/css/base.css',
  'app/assets/css/spinner.css'
]

# CSS output files:
css_file = 'facebookwall.css'

# Html files
html_source_file_name = 'app/assets/html/facebookwall.html'
html_file_name = 'facebookwall.html'

# S3 deployment locations
s3_html_file_name = 'ios/facebookwall.html'
s3_bucket = 'cdn.hugecity.us'


#
# TASKS
#

desc "deploy the build artifacts to S3"
task :deploy => [:build] do
  upload_s3 html_file_name, s3_html_file_name, s3_bucket
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

#
# Helpers
#
def upload_s3(filename, target_filename, bucketname)
  config = YAML.load_file('amazon.yml')
  connection = Fog::Storage.new({
    :provider                 => 'AWS',
    :aws_secret_access_key    => config['aws_secret_access_key'],
    :aws_access_key_id        => config['aws_access_key_id']
  })
  directory = connection.directories.get(bucketname)
  directory.files.create({
    :key => target_filename,
    :public => true, 
    :body => File.open(filename), 
    :cache_control => "max-age=360"
  })
  puts "Uploaded #{filename} to S3:#{bucketname}/#{target_filename}"
end
