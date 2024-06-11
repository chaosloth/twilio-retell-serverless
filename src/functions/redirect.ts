// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

// This is the meta data coming from RetellAI
// Adjust as needed, for example "Summary" can be passed through
type MyEvent = {
  args: {
    Summary?: string;
  };
  applicationSid?: string;
  call: {
    to_number: string;
    from_number: string;
    metadata: {
      twilio_call_sid: string;
    };
  };
};

// If you want to use environment variables, you will need to type them like
// this and add them to the Context in the function signature as
// Context<MyContext> as you see below.
type MyContext = {
  ACCOUNT_SID: string;
  TWILIO_APPLICATION_SID: string;
};

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> =
  async function (
    context: Context<MyContext>,
    event: MyEvent,
    callback: ServerlessCallback
  ) {
    console.log(`Incoming >> `, event);
    const response = new Twilio.Response();
    const client = context.getTwilioClient();
    try {
      let targetApplication =
        event.applicationSid || context.TWILIO_APPLICATION_SID;

      const callSid = event.call.metadata.twilio_call_sid;
      await client
        .calls(callSid)
        .update({
          twiml: `<Response>
              <Dial>
                <Application copyParentTo="true">
                  <ApplicationSid>${targetApplication}</ApplicationSid>
                  <Parameter name="SUMMARY" value="${event.args.Summary}"/>
                </Application>
              </Dial>
            </Response>`,
        })
        .catch((err) => console.log("Error updating call", err));

      callback(null, response);
    } catch (err) {
      console.error("Error redirecting call from retell", err);
      response.setBody({ status: "Error" });
      response.setStatusCode(500);
      callback(null, response);
    }
  };
