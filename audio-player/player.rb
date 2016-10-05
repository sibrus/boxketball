require 'bundler/setup'

Bundler.require

dir = './sounds/'
sound_files = {
  :basket1 => 'Basket 1.wav',
  :basket2 => 'Basket 2.wav',
  :basket3 => 'Basket 3.wav',
  :basket4 => 'Basket 4.wav',
  :basket5 => 'Basket 5.wav',
  :basket6 => 'Basket 6.wav',
  :basket7 => 'Basket 7.wav',
  :basket15 => 'Basket 15.wav',
  :basket_m1 => 'Basket -1.wav',
  :basket_m3 => 'Basket -3.wav',
  :multiplier => '2X Multiplier.wav',
  :hoop => 'Basketball Hoop.wav',
  :startup => 'Booting Up.wav',
  :game_over => 'Game Over.wav',
  :miss => 'Miss Button.wav',
  :steal => 'Steal Button.wav',
  :sudden_death => 'Sudden Death.wav',
  :sudden_death_turn => 'Sudden Death Turn Change.wav',
  :score_display => 'Score Attack - Score Display.wav',
  :score_low => 'Score Attack - Timer Low.wav',
  :score_out => 'Score Attack - Timer Out.wav',
  :ready_set => 'Ready Set.wav',
  :go => 'Go.wav'
}

puts 'Loading sounds...'

$sounds = {}

sound_files.each do |key, val| 
  $sounds[key] = Rubygame::Sound.load(dir + val)
end

puts 'Loading music...'

$music = {}
$music[:idle] = Rubygame::Music.load('./sounds/Idle Music.wav')
$music[:score] = Rubygame::Music.load('./sounds/Score Attack.wav')

$redis = Redis.new(:tiemeout => 0)

channels = ['box.events',
            # 'box.raw.input',
            # 'box.raw.output',
            'box.game.boxketball',
            'box.game.scoreattack'
           ]

puts 'Starting...'

def play(sound)
  puts "Playing #{sound.to_s}"
  $sounds[sound].play()
end
            
$redis.subscribe(channels) do |on|
  on.message do |channel, msg|
    data = JSON.parse(msg)
    puts msg
    if (data['event'] == 'hitBasket')
      case data['data']['basket']['points']
      when 1
        play :basket1
      when 2
        play :basket2
      when 3
        play :basket3
      when 4
        play :basket4
      when 5
        play :basket5
      when 6
        play :basket6
      when 7
        play :basket7
      when 10
        play :basket7
      when 15
        play :basket15
      when -1
        play :basket_m1
      when -3
        play :basket_m3
      else
        puts "Unknown point value: " + data['data']['basket']['points'].to_s
      end
    elsif (data['event'] == 'hitHoop')
      play :hoop    
    elsif (data['event'] == 'multiplierHit')
      play :multiplier    
    elsif (data['event'] == 'miss')
      play :miss    
    elsif (data['event'] == 'steal')
      play :steal    
    elsif (data['event'] == 'startSuddenDeath')
      play :sudden_death
    elsif (data['event'] == 'changeTurn' && data['gameState']['gameState'] == 'suddenDeath')
      play :sudden_death_turn
    elsif (data['event'] == 'preGameCountDown' && data['data']['count'] == 1)
      play :go
    elsif (data['event'] == 'preGameCountDown')
      play :ready_set
#    elsif (data['event'] == 'clockTick' && data['gameState']['players']['timeLeft'] == '11')
#      play :score_low
#    elsif (data['event'] == 'clockTick' && data['gameState']['players']['timeLeft'] == '0')
#      play :score_out      
    elsif (data['event'] == 'transition')
      case data['data']
      when 'idle'
        $music[:idle].play()
        $music[:score].stop()
      when 'boxketball'
        $music[:idle].stop()      
      end
    end
    if (channel == 'box.game.boxketball')
      if (data['event'] == 'gameOver')
        play :game_over    
      elsif (data['event'] == 'gameOn')
        play :startup    
      end
    elsif (channel == 'box.game.scoreattack')
      if (data['event'] == 'gameOver')
        play :score_display    
      elsif (data['event'] == 'gameOn')
        $music[:score].play()
      end    
    end 
  end
end

#  :sudden_death => 'Sudden Death.wav',
#  :sudden_death_turn => 'Sudden Death Turn Change.wav',
#  :score_display => 'Score Attack - Score Display.wav',
#  :score_low => 'Score Attack - Timer Low.wav',
#  :score_out => 'Score Attack - Timer Out.wav'
