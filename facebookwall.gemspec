$:.push File.expand_path("../lib", __FILE__)

Gem::Specification.new do |s|
  s.name        = "facebookwall"
  s.version     = "0.0.1"
  s.authors     = ["Adam Wilson"]
  s.homepage    = "https://github.com/hugecity/facebookwall"
  s.summary     = "A Backbone.js based embeddable facebook wall."
  s.description = <<-EOF
    Facebookwall-rails provides a simple to embed Backbone.js-based facebook feed widget.
  EOF

  s.files = Dir["{lib,app}/**/*"] + ["README.md"]
  # s.test_files = Dir["test/**/*"]

  s.add_dependency "railties", ">= 3.1"
  s.add_development_dependency "rails", "~> 3.2.12"
end