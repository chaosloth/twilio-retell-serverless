// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse";
import Retell from "retell-sdk";

type MyEvent = {
  AnsweredBy: string;
  From: string;
  To: string;
  CallSid: string;
  agent_id: string;
};

// If you want to use environment variables, you will need to type them like
// this and add them to the Context in the function signature as
// Context<MyContext> as you see below.
type MyContext = {
  RETELL_API_KEY: string;
  RETELL_AGENT_ID: string;
};

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> =
  async function (
    context: Context<MyContext>,
    event: MyEvent,
    callback: ServerlessCallback
  ) {
    console.log(`Incoming >> `, event);
    try {
      const retellClient: Retell = new Retell({
        apiKey: context.RETELL_API_KEY,
      });

      const phoneCallResponse = await retellClient.call.registerPhoneCall({
        agent_id: event.agent_id || context.RETELL_AGENT_ID,
        from_number: event.From,
        to_number: event.To,
        // Backwards compatibility with other functions
        metadata: {
          twilio_call_sid: event.CallSid,
          from_number: event.From,
          to_number: event.To,
        },
        // A better way to pass context that can be used in the UI too
        retell_llm_dynamic_variables: {
          twilio_call_sid: event.CallSid,
          from_number: event.From,
          to_number: event.To,
        },
      });

      if (phoneCallResponse) {
        // Start phone call websocket
        const response = new VoiceResponse();
        const dial = response.dial();
        dial.sip(
          `sip:${phoneCallResponse.call_id}@5t4n6j0wnrl.sip.livekit.cloud`
        );

        callback(null, response);
      } else {
        const response = new VoiceResponse();
        response.say("An application error occurred connecting the call");
        callback(null, response);
      }
    } catch (err) {
      console.error("Error connecting to Retell", err);
      const response = new VoiceResponse();
      response.say("An application exception occurred.");
      callback(null, response);
    }
  };
