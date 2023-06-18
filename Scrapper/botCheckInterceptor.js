const { appendToJson } = require("../utils/saveToJson");

function botCheckInterceptor(request) {
  if (request.isInterceptResolutionHandled()) return;

  if (
    request.resourceType() == "stylesheet" ||
    request.resourceType() == "font" ||
    request.resourceType() == "image"
  ) {
    request.abort();
    return;
  }

  if (request.isNavigationRequest() && request.redirectChain().length > 0) {
    const redirectChain = request.redirectChain();
    const lastRedirect = redirectChain[redirectChain.length - 1];

    if (lastRedirect.url().includes("areyouahuman")) {
      console.log("Bot Check Page Detected");
      appendToJson([{ url: lastRedirect.url(), error: "Bot check page" }], "errors.json");
    }
  }

  request.continue();
}

module.exports = botCheckInterceptor;
