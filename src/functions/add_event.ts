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
  name: string;
  args: {
    event_name: string;
    summary: string;
    total: string;
    timestamp: string;
  };
  call: {
    metadata: {
      twilio_call_sid: string;
      to_number: string;
      from_number: string;
    };
  };
};

// If you want to use environment variables, you will need to type them like
// this and add them to the Context in the function signature as
// Context<MyContext> as you see below.
type MyContext = {
  SEGMENT_WRITE_KEY: string;
};

export type SegmentEvent = {
  event: string;
  writeKey: string;
  userId: string;
  properties: {
    [key: string]: string;
  };
};

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> =
  async function (
    context: Context<MyContext>,
    event: MyEvent,
    callback: ServerlessCallback
  ) {
    console.log(`Incoming Segment Add Event Request >> `, event);
    const response = new Twilio.Response();
    try {
      if (!event.call.metadata.from_number) {
        response.setStatusCode(400);
        response.setBody({ status: "Not found" });
        return callback(null, response);
      }

      let botEvent: SegmentEvent = {
        event: event.name,
        writeKey: context.SEGMENT_WRITE_KEY,
        userId: event.call.metadata.from_number,
        properties: {},
      };

      const startsWithClient = /^client:/i.test(
        event.call.metadata.from_number
      );
      if (startsWithClient) {
        botEvent.properties["client_id"] = event.call.metadata.from_number;
      } else {
        botEvent.properties["phone"] = event.call.metadata.from_number;
      }

      if (event.args.summary)
        botEvent.properties["summary"] = event.args.summary;
      if (event.args.total) botEvent.properties["total"] = event.args.total;
      if (event.args.timestamp)
        botEvent.properties["timestamp"] = event.args.timestamp;

      var eventRequestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(botEvent),
      };

      console.log(`Sending this track event`, botEvent);

      const trackUrl = `https://api.segment.io/v1/track`;
      const trackResponse = await fetch(trackUrl, eventRequestOptions);
      const trackResponseData = await trackResponse.json();
      console.log("Segment track response", trackResponseData);

      response.setBody({ message: "accepted", ...trackResponseData });
      return callback(null, response);
    } catch (err: any) {
      console.log(`Error sending track event`, err);
      return callback(err);
    }
  };
