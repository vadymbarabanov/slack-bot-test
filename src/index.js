import http from "http";
import * as dotenv from "dotenv";
import { bodyParser } from "./utils/body-parser.js";
import SlackEventHandler from "./slack-event-handler.js";
import JiraCommentHanlder from "./jira-comment-handler.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

const jiraCommentHanlder = new JiraCommentHanlder({
  token: process.env.JIRA_TOKEN,
  user: process.env.JIRA_USER,
  host: process.env.JIRA_HOST,
});

const slackEventHandler = new SlackEventHandler({
  token: process.env.SLACK_BOT_TOKEN,
  commentHandler: jiraCommentHanlder,
});

const requestHandler = async (req, res) => {
  if (req.method !== "POST" || !req.body) {
    res.statusCode = 400;
    return res.end();
  }

  const body = req.body;
  console.log({ body });

  if (body.type === "url_verification") {
    res.setHeader("Content-Type", "text/plain");
    res.statusCode = 200;
    res.write(body.challenge);
    return res.end();
  }

  if (
    body.type === "event_callback" &&
    body.event.subtype !== "bot_message" &&
    body.event.subtype !== "message_deleted" &&
    !body.event.bot_id
  ) {
    await slackEventHandler.handleEvent(body.event);
    return res.end();
  }

  res.statusCode = 400;
  return res.end();
};

http.createServer(bodyParser(requestHandler)).listen(PORT);
