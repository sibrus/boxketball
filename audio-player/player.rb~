require 'bundler/setup'

Bundler.require

$redis = Redis.new(:tiemeout => 0)

# $redis.subscribe('box.raw.input') do |on|
channels = ['box.events',
            'box.raw.input',
            'box.raw.output',
            'box.game.boxketball',
            'box.game.scoreattack'
           ]
            
$redis.subscribe(channels) do |on|
  on.message do |channel, msg|
    data = JSON.parse(msg)
    puts msg
  end
end
