
const util = require('./util')

class Logger {

    #logger
    #tag = 'AWS Question API'

    constructor() {
      let log4js = require('log4js');
      log4js.configure({
        appenders: { 'out': { type: 'stdout', layout: { type: 'basic' } } },
        categories: { default: { appenders: ['out'], level: 'info' } }
      });
      this.#logger= log4js.getLogger(this.#tag);
    }

    info(message){
        this.#logger.level = 'info'
        this.#logger.info(message)
    }

    debug(message){
        this.#logger.level = 'debug'
        this.#logger.debug(message)
    }

    error(message){
        this.#logger.level = 'error'
        this.#logger.error(message)
    }

    warn(message){
        this.#logger.level = 'warn'
        this.#logger.warn(message)
    }

  };

  module.exports = { 
      Logger
  };