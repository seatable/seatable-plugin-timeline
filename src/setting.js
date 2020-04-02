const config = {
  APIToken: "8a4b7e15c8c7314ede234bffcb7ec28dbe327a99",
  server: "https://dev.seafile.com/dtable-web",
  workspaceID: "5",
  dtableName: "请假扩展测试",
  lang: "en"
}

const dtablePluginConfig = Object.assign({}, config, {server: config.server.replace(/\/+$/, "")});
window.dtablePluginConfig = dtablePluginConfig;