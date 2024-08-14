// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

// Use Node Fetch
const fetch = require("node-fetch");

type MyEvent = {
  args: {
    name?: string;
    phone?: string;
    address?: string;
  };
  call: {
    retell_llm_dynamic_variables: {
      from_number: string;
    };
    metadata: {
      twilio_call_sid: string;
      to_number: string;
    };
  };
};

// If you want to use environment variables, you will need to type them like
// this and add them to the Context in the function signature as
// Context<MyContext> as you see below.
type MyContext = {
  SEGMENT_WRITE_KEY: string;
};

export type IdentifyEvent = {
  type: "identify";
  userId: string;
  traits: {
    name?: string;
    phone?: string;
    address?: string;
    client_id?: string;
  };
};

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> =
  async function (
    context: Context<MyContext>,
    event: MyEvent,
    callback: ServerlessCallback
  ) {
    console.log(`Incoming Segment Lookup Request >> `, event);
    const response = new Twilio.Response();
    try {
      if (!event.call.retell_llm_dynamic_variables.from_number) {
        response.setStatusCode(404);
        response.setBody({ status: "Not found" });
        return callback(null, response);
      }

      let token = Buffer.from(`${context.SEGMENT_WRITE_KEY}:`, "utf8").toString(
        "base64"
      );

      const userId = event.call.retell_llm_dynamic_variables.from_number;

      let identifyEvent: IdentifyEvent = {
        type: "identify",
        userId: userId,
        traits: {},
      };

      const startsWithClient = /^client:/i.test(
        event.call.retell_llm_dynamic_variables.from_number
      );
      if (startsWithClient) {
        identifyEvent.traits["client_id"] =
          event.call.retell_llm_dynamic_variables.from_number;
      }

      if (event.args.name) identifyEvent.traits["name"] = event.args.name;
      if (event.args.phone) identifyEvent.traits["phone"] = event.args.phone;
      if (event.args.address)
        identifyEvent.traits["address"] = event.args.address;

      var identifyRequestOptions = {
        method: "POST",
        headers: {
          Authorization: `Basic ${token}`,
        },
        body: JSON.stringify(identifyEvent),
      };

      const identifyUrl = `https://api.segment.io/v1/identify`;
      const identifyResponse = await fetch(identifyUrl, identifyRequestOptions);
      const identifyResponseData = await identifyResponse.json();
      console.log("Segment Identify response", identifyResponseData);

      response.setBody({ message: "accepted", ...identifyResponseData });
      return callback(null, response);
    } catch (err: any) {
      console.log(`Error fetching profile`, err);
      return callback(err);
    }
  };
