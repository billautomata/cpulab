// [x] converted

var JSNES_CPU = require('./cpu.js')
var JSNES_PPU = require('./ppu.js').JSNES_PPU
var JSNES_PAPU = require('./papu.js')
var JSNES_ROM = require('./rom.js')
var JSNES_Keyboard = require('./keyboard.js')

module.exports = JSNES

function JSNES (opts) {
  var self = this
  if (!(this instanceof JSNES)) return new JSNES(opts)
  this.opts = {
    ui: JSNES.DummyUI,
    // swfPath: 'lib/',

    preferredFrameRate: 60,
    fpsInterval: 500, // Time between updating FPS in ms
    showDisplay: true,

    emulateSound: false,
    sampleRate: 44100, // Sound sample rate in hz

    CPU_FREQ_NTSC: 1789772.5, // 1789772.72727272d
    CPU_FREQ_PAL: 1773447.4
  }
  if (typeof opts != 'undefined') {
    var key
    for (key in this.opts) {
      if (typeof opts[key] != 'undefined') {
        this.opts[key] = opts[key]
      }
    }
  }

  this.frameTime = 1000 / this.opts.preferredFrameRate

  // this.ui = new this.opts.ui(this)
  this.cpu = new JSNES_CPU(this)
  this.ppu = new JSNES_PPU(this)
  this.papu = new JSNES_PAPU(this)
  this.mmap = null; // set in loadRom()
  this.keyboard = new JSNES_Keyboard()

  this.isRunning = false
  this.fpsFrameCount = 0
  this.romData = null
}

// Resets the system
JSNES.prototype.reset = function () {
  if (this.mmap !== null) {
    this.mmap.reset()
  }

  this.cpu.reset()
  this.ppu.reset()
  this.papu.reset()
}

JSNES.prototype.start = function () {
  var self = this

  if (this.rom !== null && this.rom.valid) {
    if (!this.isRunning) {
      this.isRunning = true

      this.frameInterval = setInterval(function () {
        self.frame()
      }, this.frameTime)
      this.resetFps()
      this.printFps()
      this.fpsInterval = setInterval(function () {
        self.printFps()
      }, this.opts.fpsInterval)
    }
  } else {
    this.ui.updateStatus('There is no ROM loaded, or it is invalid.')
  }
}

JSNES.prototype.frame = function frame () {
  this.ppu.startFrame()
  var cycles = 0
  var emulateSound = this.opts.emulateSound
  var cpu = this.cpu
  var ppu = this.ppu
  var papu = this.papu

  console.log('in a frame')

  // console.log(this.cpu)

  FRAMELOOP: for (;;) {
    if (cpu.cyclesToHalt === 0) {
      // Execute a CPU instruction
      cycles = cpu.emulate()

      if (emulateSound) {
        papu.clockFrameCounter(cycles)
      }
      cycles *= 3
    } else {
      if (cpu.cyclesToHalt > 8) {
        cycles = 24
        if (emulateSound) {
          papu.clockFrameCounter(8)
        }
        cpu.cyclesToHalt -= 8
      } else {
        cycles = cpu.cyclesToHalt * 3
        if (emulateSound) {
          papu.clockFrameCounter(cpu.cyclesToHalt)
        }
        cpu.cyclesToHalt = 0
      }
    }

    if (cycles > 0) {
      console.log('true')
    }
    for (; cycles > 0; cycles--) {
      if (ppu.curX === ppu.spr0HitX &&
        ppu.f_spVisibility === 1 &&
        ppu.scanline - 21 === ppu.spr0HitY) {
        // Set sprite 0 hit flag:
        ppu.setStatusFlag(ppu.STATUS_SPRITE0HIT, true)
      }

      if (ppu.requestEndFrame) {
        console.log('ppu request end frame')
        ppu.nmiCounter--
        if (ppu.nmiCounter === 0) {
          ppu.requestEndFrame = false
          ppu.startVBlank()
          break FRAMELOOP
        }
      }

      ppu.curX++
      if (ppu.curX === 341) {
        ppu.curX = 0
        ppu.endScanline()
      }
    }
  }
  this.fpsFrameCount++
}

JSNES.prototype.printFps = function () {
  var now = +new Date()
  var s = 'Running'
  if (this.lastFpsTime) {
    s += ': ' + (
      this.fpsFrameCount / ((now - this.lastFpsTime) / 1000)
        ).toFixed(2) + ' FPS'
  }
  // this.ui.updateStatus(s)
  this.fpsFrameCount = 0
  this.lastFpsTime = now
}

JSNES.prototype.stop = function () {
  clearInterval(this.frameInterval)
  clearInterval(this.fpsInterval)
  this.isRunning = false
}

JSNES.prototype.reloadRom = function () {
  if (this.romData !== null) {
    this.loadRom(this.romData)
  }
}

// Loads a ROM file into the CPU and PPU.
// The ROM file is validated first.
JSNES.prototype.loadRom = function (data) {
  if (this.isRunning) {
    this.stop()
  }

  // this.ui.updateStatus('Loading ROM...')

  // Load ROM file:
  this.rom = new JSNES_ROM(this)
  this.rom.load(data)

  if (this.rom.valid) {
    this.reset()
    this.mmap = this.rom.createMapper()
    if (!this.mmap) {
      return
    }
    this.mmap.loadROM()
    this.ppu.setMirroring(this.rom.getMirroringType())
    this.romData = data

  // this.ui.updateStatus('Successfully loaded. Ready to be started.')
  } else {
    this.ui.updateStatus('Invalid ROM!')
  }
  return this.rom.valid
}

JSNES.prototype.resetFps = function () {
  this.lastFpsTime = null
  this.fpsFrameCount = 0
}

JSNES.prototype.setFramerate = function (rate) {
  this.opts.preferredFrameRate = rate
  this.frameTime = 1000 / rate
  this.papu.setSampleRate(this.opts.sampleRate, false)
}

JSNES.prototype.toJSON = function () {
  return {
    'romData': this.romData,
    'cpu': this.cpu.toJSON(),
    'mmap': this.mmap.toJSON(),
    'ppu': this.ppu.toJSON()
  }
}

JSNES.prototype.fromJSON = function (s) {
  this.loadRom(s.romData)
  this.cpu.fromJSON(s.cpu)
  this.mmap.fromJSON(s.mmap)
  this.ppu.fromJSON(s.ppu)
}
