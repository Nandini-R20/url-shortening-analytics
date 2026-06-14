const UAParser = require("ua-parser-js");

const parseDevice = (userAgent) => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    browser: result.browser.name || "Unknown",
    os: result.os.name || "Unknown",
    device: result.device.type || "Desktop",
  };
};

module.exports = parseDevice;
// Very small user-agent parser placeholder
module.exports = function parseDevice(userAgent) {
  return { raw: userAgent || '' };
};
