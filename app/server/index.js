/**
 * Test function to verify the script is working
 * @returns {void}
 */
function testFunction() {
  Logger.log('Test function executed');
}

/**
 * Handle HTTP GET requests to the web app
 * @returns {GoogleAppsScript.HTML.HtmlOutput} HTML output for the web app
 */
function doGet() {
  return HtmlService.createHtmlOutput('<h1>Hello World</h1>');
}
