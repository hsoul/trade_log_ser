// app/middleware/logger.js
module.exports = options => {
  return async function logger(ctx, next) {
    const now = new Date();
    console.log("[" + now.toISOString() + "] " + `received request: ${ctx.request.method} ${ctx.request.url}`);
    await next();
  };
};