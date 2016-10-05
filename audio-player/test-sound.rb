require 'bundler/setup'

Bundler.require

file1 = './sounds/Basket 2.wav'
sound1 = Rubygame::Sound.load(file1)

music1 = Rubygame::Music.load('./sounds/Idle Music.wav')
music1.play()

sound1.play()

sleep 5

sound1.play()

sleep 10
