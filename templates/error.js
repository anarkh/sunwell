/**
 * @description：错误监听
 */
module.exports = ({ error }) => {
  let errFun = error;
  if (typeof errFun !== "function") {
    errFun = () => {};
  }

  return `
        const swErrorFun = ${errFun};
        self.addEventListener('error', event => {
            swErrorFun(event);
            report.reportError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error.stack.toString()
            });
        });
    `;
};
