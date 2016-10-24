/**
 * Created by steve on 24/10/2016.
 */
import { Responder } from './responder';

export function handler(event, context, callback) { // eslint-disable-line import/prefer-default-export
  try {
    if (event.session.application.applicationId !== 'ALEXA_SKILL_ID') {
      callback('Invalid Application ID');
    }

    const responder = new Responder(callback);

    responder.respond('Hello world', true);
  } catch (err) {
    console.log(err);
    callback(err);
  }
}
