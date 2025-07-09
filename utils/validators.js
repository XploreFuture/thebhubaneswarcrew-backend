module.exports.validateTicketData = (data) => {
    const errors = [];
    if (!data.email) errors.push("Email is required");
    if (!data.eventId) errors.push("Event ID is required");
    return errors;
  };
  