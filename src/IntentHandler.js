/**
 * Created by steve on 24/10/2016.
 */
import { Monzo } from './Monzo';

export class IntentHandler {
  constructor(request, session, responder) {
    this.request = request;
    this.session = session;
    this.responder = responder;

    this.monzoClient = new Monzo(session.user.accessToken);
  }

  handleIntent(intentName) {
    switch (intentName) {
      case 'GetBalance':
        return this.intent_GetBalance();
      default:
        this.responder.setCard(`Unknown req ${intentName}`);
        this.responder.respond(true);
    }
  }

  intent_GetBalance() {
    const responder = this.responder;

    this.monzoClient.getBalance()
      .then((balance) => {
        responder.setCard(balance);
        responder.setResponseText(balance);
        responder.respond(false);
      })
      .catch((ex) => responder.errorHandler(ex));
  }
}
