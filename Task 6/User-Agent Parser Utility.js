// utils/userAgentParser.js
const UAParser = require('ua-parser-js'); // npm install ua-parser-js

const parseUserAgent = (userAgent) => {
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  const browserType = browser.name?.toLowerCase();
  const chromeBrowsers = ['chrome', 'chromium'];
  const msBrowsers = ['edge'];

  return {
    browser: {
      name: browser.name,
      version: browser.version,
      type: chromeBrowsers.includes(browserType) ? 'chrome' :
            msBrowsers.includes(browserType) ? 'edge' :
            browserType || 'other'
    },
    os: {
      name: os.name,
      version: os.version,
      type: os.name?.toLowerCase()
    },
    device: {
      type: device.type || 'desktop',
      isMobile: ['mobile', 'tablet'].includes(device.type?.toLowerCase()) || false
    },
    rawUserAgent: userAgent
  };
};

module.exports = { parseUserAgent };