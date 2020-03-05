const config = {
  APIToken: "8a4b7e15c8c7314ede234bffcb7ec28dbe327a99",
  server: "https://dev.seafile.com/dtable-web",
  workspaceID: "5",
  dtableName: "请假扩展测试",
  lang: "en"
}

const { APIToken, server, workspaceID, dtableName, lang } = config;

const dtableConfig = {
  APIToken,
  server: server.replace(/\/+$/, ""),
  workspaceID,
  dtableName,
  lang,
};

window.dtableConfig = dtableConfig;