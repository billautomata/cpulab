var fs = require('fs')
var nes = require('./source/nes.js')()

// console.log(Object.keys(nes))
// console.log(nes.__prototype__)
var rom_data = fs.readFileSync('./roms/megaman.nes').toString()
console.log('loading rom')
nes.loadRom(rom_data)
console.log('running a frame')
nes.frame()
console.log('done')

function create_nes(){

}
