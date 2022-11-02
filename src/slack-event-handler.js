import { WebClient } from "@slack/web-api";

export default class SlackEventHandler {
  _client;
  _commentHandler;

  constructor({ token, commentHandler }) {
    this._commentHandler = commentHandler;
    this._client = new WebClient(token);
  }

  handleEvent = async (event) => {
    console.log({ event });
    const issueId = this._commentHandler.scanForIssueId(event.text);

    try {
      if (!issueId) {
        return this._client.chat.postMessage({
          channel: event.channel,
          text: `You should provide issue key inside a message`,
        });
      }

      const response = await this._commentHandler.addIssueComment(
        issueId,
        event.text
      );

      if (response.errorMessages && response.errorMessages.length) {
        return this._client.chat.postMessage({
          channel: event.channel,
          text: response.errorMessages[0],
        });
      }

      await this._client.chat.postMessage({
        channel: event.channel,
        text: `Successfully added comment to the issue`,
      });
    } catch (error) {
      console.log(error);
    }
  };
}
