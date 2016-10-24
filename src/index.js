/**
 * Created by steve on 24/10/2016.
 */
import { Monzo } from './Monzo';
import { Responder } from './responder';

export function handler(event, context, callback) {
  // helper fn to save duplication
  function errorHandler(err) {
    console.log(err);
    callback(err);
  }

  try {
    if (event.session.application.applicationId !== 'ALEXA_SKILL_ID') {
      callback('Invalid Application ID');
    }

    const monzoClient = new Monzo(event.session.user.accessToken);
    const responder = new Responder(callback);

    monzoClient.getBalance()
    .then((balance) => responder.respond(balance, true))
    .catch((ex) => errorHandler(ex));
  } catch (err) {
    errorHandler(err);
  }
}
