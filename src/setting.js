const config = {
  APIToken: "",
  server: "https://dev.seafile.com/dtable-web",
  workspaceID: "",
  dtableName: "",
  lang: ""
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