const config = {
  APIToken: "",
  server: "https://dev.seafile.com/dtable-web",
  workspaceID: "",
  dtableName: "",
  lang: "en"
}

const dtablePluginConfig = Object.assign({}, config, {server: config.server.replace(/\/+$/, "")});