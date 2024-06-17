// Imports global types
import "@twilio-labs/serverless-runtime-types";
// Fetches specific types
import {
  Context,
  ServerlessCallback,
  ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";

type MyContext = {
  ACCOUNT_SID: string;
  AUTH_TOKEN: string;
  WORKSPACE_SID: string;
  WORKFLOW_SID: string;
};

type MyEvent = {
  request: any;
  task_type: string;
  attributes: any;
};

export const handler: ServerlessFunctionSignature<MyContext, MyEvent> =
  async function (
    context: Context<MyContext>,
    event: MyEvent,
    callback: ServerlessCallback
  ) {
    let response = new Twilio.Response();

    console.log(">>> INCOMING Create Task Request >>>");
    console.log(event);

    // Ignore events for recordings that aren't completed
    if (!event.task_type) {
      console.log(`Ignoring incoming task creation request, no task type`);
      response.setStatusCode(400);
      response.setBody({ status: "error", message: "Missing task type" });
      return callback(null, response);
    }

    // Removing serverless properties from event object
    delete event.request;

    try {
      // Create task
      let client = context.getTwilioClient();
      let task = await client.taskrouter.v1
        .workspaces(context.WORKSPACE_SID)
        .tasks.create({
          taskChannel: event.task_type,
          attributes: JSON.stringify(event),
          workflowSid: context.WORKFLOW_SID,
        });

      console.log(`Created task ${task.sid}`);
      response.setStatusCode(200);
      response.setBody({ status: "created", taskSid: task.sid });
      return callback(null, response);
    } catch (e: any) {
      console.error(`Failed to create task ` + event.task_type);
      response.setStatusCode(500);
      console.error(e);
      return callback(null, response);
    }
  };
