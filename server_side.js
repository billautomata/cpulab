var fs = require('fs')
var nes = require('./source/nes.js')()

// console.log(Object.keys(nes))
// console.log(nes.__prototype__)
var rom_data = fs.readFileSync('./roms/mario.nes').toString('utf-8')
console.log(rom_data.slice(0,100))

console.log('loading rom')
var valid_rom = nes.loadRom(rom_data)
console.log('rom is valid', valid_rom)
console.log('running start')
nes.start()
console.log('done running start')
console.log('running a frame')

nes.frame()
console.log('done')

function create_nes(){

}
