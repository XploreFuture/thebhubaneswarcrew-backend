const { v4: uuidv4 } = require('uuid');

module.exports = function generateTicketId() {
  return `TICKET-${uuidv4().slice(0, 8).toUpperCase()}`;
};
