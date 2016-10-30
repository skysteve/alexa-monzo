/**
 * Created by steve on 24/10/2016.
 */
import { version } from '../package.json';

export class Responder {

  constructor(callback) {
    this.callback = callback;
  }

  errorHandler(err) {
    console.log(err);
    this.callback(err);
  }

  get cardTitle() {
    return 'Monzo';
  }

  get version() {
    return version.substring(0, version.lastIndexOf('.'));
  }

  setCard(content) {
    this.card = {
      type: 'Simple',
      title: this.cardTitle,
      content: content
    };
  }

  setReprompt(text) {
    this.reprompt = {
      outputSpeech: {
        type: 'PlainText',
        text: text
      }
    };
  }

  setResponseText(text) {
    this.responseText = text;
  }

  setSessionAttributes(objAttrs) {
    this.sessionAttrs = objAttrs;
  }

  respond(shouldEnd) {
    if (shouldEnd === undefined) {
      shouldEnd = true;
    }
    this.callback(null, {
      version: this.version,
      sessionAttributes: this.sessionAttrs,
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: this.responseText
        },
        card: this.card,
        reprompt: this.reprompt,
        shouldEndSession: shouldEnd
      }
    });
  }
}
