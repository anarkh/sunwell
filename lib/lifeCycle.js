/**
 * @description：生命周期方法获取
 */
const installTpl = require("../templates/install");
const activateTpl = require("../templates/activate");
const fetchTpl = require("../templates/fetch");
const syncTpl = require("../templates/sync");
const errorTpl = require("../templates/error");
module.exports = async ({ strategy, refreshSource, error }) => {
  let installContent;
  let activateContent;
  let fetchContent;
  let syncContent;
  let errorContent;

  try {
    installContent = installTpl();
  } catch (e) {
    throw new Error(`error : installContent-failure ${e.message}`);
  }
  try {
    activateContent = activateTpl();
  } catch (e) {
    throw new Error(`error : activateContent-failure ${e.message}`);
  }
  try {
    fetchContent = fetchTpl({ strategy });
  } catch (e) {
    throw new Error(`error : fetchContent-failure ${e.message}`);
  }
  try {
    syncContent = syncTpl({ refreshSource });
  } catch (e) {
    throw new Error(`error : syncContent-failure ${e.message}`);
  }
  try {
    errorContent = errorTpl({ error });
  } catch (e) {
    throw new Error(`error : errorCotent-failure ${e.message}`);
  }

  return (
    installContent + activateContent + fetchContent + syncContent + errorContent
  );
};
