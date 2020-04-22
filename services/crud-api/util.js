
const logger_service = require('./logger-service')

const TAG = 'AWS QuestionsAPI'
const logger = new logger_service.Logger()

module.exports = {
    TAG,
    logger
}