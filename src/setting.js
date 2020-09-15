
const config = {
  APIToken: "88b294e38aab3ac5415a207a307e50521e86a4b1",
  server: "http://127.0.0.1:80",
  workspaceID: "1",
  dtableName: "test-1",
  lang: "zh-cn"
};

const dtablePluginConfig = Object.assign({}, config, {server: config.server.replace(/\/+$/, "")});
window.dtablePluginConfig = dtablePluginConfig; 