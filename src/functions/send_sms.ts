// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

type MyContext = {
  SMS_FROM_NUMBER: string;
};

type MyEvent = {
  args: {
    message: string;
  };
  call: {
    retell_llm_dynamic_variables: {
      from_number: string;
    };
    metadata: {
      twilio_call_sid: string;
      to_number: string;
      from_number: string;
    };
  };
};

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> =
  async function (
    context: Context<MyContext>,
    event: MyEvent,
    callback: ServerlessCallback
  ) {
    console.log(`Incoming SMS Send Request >> `, event);

    try {
      let client = context.getTwilioClient();
      const message = await client.messages.create({
        body: event.args.message,
        from: context.SMS_FROM_NUMBER,
        to: event.call.retell_llm_dynamic_variables.from_number,
      });

      console.log(`SMS sent with SID: ${message.sid}`);
      callback(null, "SMS sent successfully");
    } catch (error: any) {
      console.error("Error sending SMS:", error);
      callback(error);
    }
  };
