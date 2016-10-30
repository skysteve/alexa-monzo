/**
 * Created by steve on 24/10/2016.
 */
import { Monzo } from './Monzo';

export class IntentHandler {
  constructor(request, session, responder) {
    this.request = request;
    this.session = session;
    this.responder = responder;

    console.log('****** SESSION ATTRIBUTES');
    console.log(JSON.stringify(session.attributes, null, 4));

    this.monzoClient = new Monzo(session.user.accessToken, session.attributes);
  }

  handleIntent(intentName) {
    const intentValues = this.request.intent.slots;

    switch (intentName) {
      case 'GetBalance':
        return this.intent_GetBalance();
      case 'GetTransactions':
        return this.intent_getTransactions(intentValues.dateStart.value, intentValues.dateEnd.value, intentValues.limit.value);
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
        return this.monzoClient.getAccountId();
      })
      .then((accountId) => {
        responder.setSessionAttributes({
          monzoAccountId: accountId
        });
        responder.respond(true);
      })
      .catch((ex) => responder.errorHandler(ex));
  }

  intent_getTransactions() {
    const responder = this.responder;

    this.monzoClient.getTransactions()
      .then((transactions) => {
        responder.setCard(transactions);
        responder.setResponseText(transactions);
        responder.respond(true);
      })
      .catch((ex) => responder.errorHandler(ex));
  }
}
