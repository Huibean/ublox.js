const SerialPort = require('serialport')

const HEADER1 = 0xb5
const HEADER2 = 0x62

// message classes
const CLASS_NAV = 0x01
const CLASS_RXM = 0x02
const CLASS_INF = 0x04
const CLASS_ACK = 0x05
const CLASS_CFG = 0x06
const CLASS_MON = 0x0A
const CLASS_AID = 0x0B
const CLASS_TIM = 0x0D
const CLASS_ESF = 0x10

// ACK messages
const MSG_ACK_NACK = 0x00
const MSG_ACK_ACK = 0x01

// NAV messages
const MSG_NAV_POSECEF   = 0x1
const MSG_NAV_POSLLH    = 0x2
const MSG_NAV_STATUS    = 0x3
const MSG_NAV_DOP       = 0x4
const MSG_NAV_SOL       = 0x6
const MSG_NAV_POSUTM    = 0x8
const MSG_NAV_VELNED    = 0x12
const MSG_NAV_VELECEF   = 0x11
const MSG_NAV_TIMEGPS   = 0x20
const MSG_NAV_TIMEUTC   = 0x21
const MSG_NAV_CLOCK     = 0x22
const MSG_NAV_SVINFO    = 0x30
const MSG_NAV_SVIN    = 0x3b
const MSG_NAV_AOPSTATUS = 0x60
const MSG_NAV_DGPS      = 0x31
const MSG_NAV_EKFSTATUS = 0x40
const MSG_NAV_SBAS      = 0x32

// RXM messages
const MSG_RXM_RAW    = 0x10
const MSG_RXM_SFRB   = 0x11
const MSG_RXM_SVSI   = 0x20
const MSG_RXM_EPH    = 0x31
const MSG_RXM_ALM    = 0x30
const MSG_RXM_PMREQ  = 0x41

// AID messages
const MSG_AID_ALM    = 0x30
const MSG_AID_EPH    = 0x31
const MSG_AID_ALPSRV = 0x32
const MSG_AID_AOP    = 0x33
const MSG_AID_DATA   = 0x10
const MSG_AID_ALP    = 0x50
const MSG_AID_HUI    = 0x02
const MSG_AID_INI    = 0x01
const MSG_AID_REQ    = 0x00

// CFG messages
const MSG_CFG_PRT = 0x00
const MSG_CFG_ANT = 0x13
const MSG_CFG_DAT = 0x06
const MSG_CFG_EKF = 0x12
const MSG_CFG_ESFGWT = 0x29
const MSG_CFG_CFG = 0x09
const MSG_CFG_USB = 0x1b
const MSG_CFG_RATE = 0x08
const MSG_CFG_SET_RATE = 0x01
const MSG_CFG_NAV5 = 0x24
const MSG_CFG_FXN = 0x0E
const MSG_CFG_INF = 0x02
const MSG_CFG_ITFM = 0x39
const MSG_CFG_MSG = 0x01
const MSG_CFG_NAVX5 = 0x23
const MSG_CFG_NMEA = 0x17
const MSG_CFG_NVS = 0x22
const MSG_CFG_PM2 = 0x3B
const MSG_CFG_PM = 0x32
const MSG_CFG_RINV = 0x34
const MSG_CFG_RST = 0x04
const MSG_CFG_RXM = 0x11
const MSG_CFG_SBAS = 0x16
const MSG_CFG_TMODE2 = 0x3D
const MSG_CFG_TMODE = 0x1D
const MSG_CFG_TPS = 0x31
const MSG_CFG_TP = 0x07
const MSG_CFG_GNSS = 0x3E

// ESF messages
const MSG_ESF_MEAS   = 0x02
const MSG_ESF_STATUS = 0x10

// INF messages
const MSG_INF_DEBUG  = 0x04
const MSG_INF_ERROR  = 0x00
const MSG_INF_NOTICE = 0x02
const MSG_INF_TEST   = 0x03
const MSG_INF_WARNING= 0x01

// MON messages
const MSG_MON_SCHD  = 0x01
const MSG_MON_HW    = 0x09
const MSG_MON_HW2   = 0x0B
const MSG_MON_IO    = 0x02
const MSG_MON_MSGPP = 0x06
const MSG_MON_RXBUF = 0x07
const MSG_MON_RXR   = 0x21
const MSG_MON_TXBUF = 0x08
const MSG_MON_VER   = 0x04

// TIM messages
const MSG_TIM_TP   = 0x01
const MSG_TIM_TM2  = 0x03
const MSG_TIM_SVIN = 0x04
const MSG_TIM_VRFY = 0x06

const NumberType = {
  'U1' : 'readUInt8',
  'U1[2]' : 'readUInt8',
  'U1[3]' : 'readUInt8',
  'I1' : 'readInt8',
  'U2' : 'readUInt16LE',
  'I2' : 'readInt16LE',
  'U4' : 'readUInt32LE',
  'I4' : 'readInt32LE',
}

let MessageParser = class {
  constructor(items) {
    this.items = items;
  }
  parse(payload) {
    let res = {}
    for (var i = 0, len = this.items.length; i < len; i++) {
      let item = this.items[i];
      res[item[2]] = payload[NumberType[item[1]]](item[0])
    }
    return res;
  }
}

const Messages = {}
Messages[CLASS_NAV] = []
Messages[CLASS_NAV][MSG_NAV_CLOCK] = new MessageParser([[0, 'U4', "iTOW"], [4, 'I4', 'clkB'], [8, 'I4', 'clkD'], [12, 'U4', 'tAcc'], [16, 'U4', 'fAcc']])
Messages[CLASS_NAV][MSG_NAV_SVIN] = new MessageParser([[0, 'U1', "version"], [1, 'U1[3]', 'reserved1'], [4, 'U4', 'iTOW'], [8, 'U4', 'dur'], [12, 'I4', 'meanX'], [16, 'I4', 'meanY'], [20, 'I4', 'meanZ'], [24, 'I1', 'meanXHP'], [25, 'I1', 'meanYHP'], [26, 'I1', 'meanZHP'], [27, 'U1', 'reserved2'], [28, 'U4', 'meanAcc'], [32, 'U4', 'obs'], [36, 'U1', 'valid'], [37, 'U1', 'active'], [38, 'U1[2]', 'reserved3']])

let ParseManager = class {
  constructor() {
    this.step = 0
    this.classId = null
    this.msgId = null
    this.msgLen = null
    this.payload = []
    this.ck = new Uint8Array(2)
  }

  continue() {
    console.log("continue", this.step)
    this.step ++;
  }

  reset() {
    console.log("reset", this.step)
    this.step = 0
    this.classId = null
    this.msgId = null
    this.msgLen = null
    this.payload = []
    this.ck = new Uint8Array(2)
  }
}

module.exports = class {
  constructor(serialName, baud) {
    const port = new SerialPort(serialName, {
      baudRate: baud
    })

    let init = false;

    port.on('open', function() {
      console.log("port is opening...")
      // open logic
    })

    port.on('data', (data) => {
      this.handleReceive(data)
    })

    port.on('error', function(err) {
      console.log('Error: ', err.message)
    })

    this.port = port;
  }

  handleMessage(classId, msgId, payload) {
    if (Messages[classId] && Messages[classId][msgId]) {
      let msg = Messages[classId][msgId].parse(payload)
      console.log(msg)
    } else {
      console.log({
        classId,
        msgId,
        payload
      })
    }
  }

  handleReceive(buffer) {
    let parseManager = new ParseManager();
    console.log("buffer.length: ", buffer.length)
    for (var i = 0, len = buffer.length; i < len; i++) {
      let data = buffer[i];
      console.log("data:", data.toString())
      console.log("parseManager.step:", parseManager.step)
      switch (parseManager.step) {
        case 0:
          if (data === HEADER1) {
            parseManager.continue()
          }
          break;
        case 1:
          if (data === HEADER2) {
            parseManager.continue()
          } else {
            parseManager.reset()
          } 
          break;
        case 2:
          parseManager.continue()
          parseManager.classId = data
          parseManager.ck[0] = data;
          parseManager.ck[1] = data;
          break;
        case 3:
          parseManager.continue()
          parseManager.ck[0] += data;
          parseManager.ck[1] += parseManager.ck[0];
          parseManager.msgId = data
          break;
        case 4:
          parseManager.continue()
          parseManager.ck[0] += data;
          parseManager.ck[1] += parseManager.ck[0];
          parseManager.msgLen = data
          break;
        case 5:
          parseManager.continue()
          parseManager.ck[0] += data;
          parseManager.ck[1] += parseManager.ck[0];
          parseManager.msgLen += data<<8
          break;
        case 6:
          parseManager.payload.push(data)
          parseManager.ck[0] += data;
          parseManager.ck[1] += parseManager.ck[0];
          if (parseManager.payload.length === parseManager.msgLen) {
            parseManager.continue()
          }
          break;
        case 7:
          parseManager.continue()
          if (parseManager.ck[0] !== data) {
            console.log("bad cka", parseManager.ck[0], data)
            parseManager.reset()
          }
          break;
        case 8:
          if (parseManager.ck[1] !== data) {
            console.log("bad ckb", parseManager.ck[1], data)
          } else {
            this.handleMessage(parseManager.classId, parseManager.msgId, Buffer.from(parseManager.payload))
          }
          parseManager.reset()
          break;
        default:
          
      }
    }
  }
}
