/**
 * Created by steve on 24/10/2016.
 */
import { version } from '../package.json';

export class Responder {

  constructor(callback) {
    this.callback = callback;
  }

  get cardTitle() {
    return 'Monzo';
  }

  get version() {
    return version.substring(0, version.lastIndexOf('.'));
  }

  respond(output, shouldEnd) {
    if (shouldEnd === undefined) {
      shouldEnd = true;
    }
    this.callback(null, {
      version: this.version,
      response: {
        outputSpeech: {
          type: 'PlainText',
          text: output
        },
        card: {
          type: 'Simple',
          title: this.cardTitle,
          content: output
        },
        shouldEndSession: shouldEnd
      }
    });
  }
}
