import https from "https";

export default class JiraCommentHanlder {
  _token;
  _user;
  _host;

  constructor({ token, user, host }) {
    this._token = token;
    this._user = user;
    this._host = host;
  }

  addIssueComment = (issueId, text) => {
    const comment = this._createIssueComment(text);
    return this._postIssueComment(issueId, comment);
  };

  scanForIssueId = (text) => {
    const result = text.match(/[A-Z]+-[0-9]+/g);

    if (result) {
      return result[0];
    }

    return null;
  };

  _postIssueComment = (id, body) => {
    const data = JSON.stringify(body);

    const auth = Buffer.from(`${this._user}:${this._token}`).toString("base64");

    const options = {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(
        `${this._host}/rest/api/3/issue/${id}/comment`,
        options,
        (res) => {
          const data = [];
          res.on("data", (chunk) => {
            data.push(chunk);
          });

          res.on("end", () => {
            if (data.length) {
              return resolve(JSON.parse(Buffer.concat(data).toString()));
            }
            resolve(null);
          });
        }
      );

      req.on("error", (error) => {
        reject(error);
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request time out"));
      });

      req.write(data);
      req.end();
    });
  };

  _createIssueComment = (text) => ({
    body: {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text,
            },
          ],
        },
      ],
    },
  });
}
