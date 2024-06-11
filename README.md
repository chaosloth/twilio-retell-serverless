# Twilio Serverless function Retell AI
Connect you existing Twilio account to Retell AI with a simple serverless function.

This project is simply one function that you can configure on your Twilio phone number.

**Note** This is a typescript project, the output is in the `dist/` folder

Configure the retell `agent_id` as **either** an environment variable or a query parameter. The query parameter will take precedent.

![Demo Image](/docs/demo.png)

# Setup Instructions
1. Create a Twilio account
2. Create a Retell account
3. Clone this repo with `gh repo clone chaosloth/twilio-retell-serverless` (or) `git clone https://github.com/chaosloth/twilio-retell-serverless.git`
4. Make a copy of the `.env.example` file as `.env` and populate the values
5. Navigate to the newly cloned folder, e.g. `cd twilio-retell-serverless`
6. Install dependencies with `npm i` or `yarn`
7. Build the project with `npm run build` or `yarn build`
8. Deploy the project to Twilio with `npm run deploy` or `yarn deploy`
9. You can also run locally with `twilio serverless start --functions-folder dist/functions --ngrok=""` to start a local ngrok server

## Environment file
Configure you environment file as follows, inserting the respective values for your account on Twilio and Retell.ai

```sh
#
# Twilio Account SID
#
ACCOUNT_SID=
AUTH_TOKEN=

#
# Retell.AI API key
#
RETELL_API_KEY=

#
# Retell.AI Agent ID
#
RETELL_AGENT_ID=

#
# Twilio Segment
#
SEGMENT_PROFILES_API_BASE_URL=https://profiles.segment.com/v1
SEGMENT_API_ACCESS_TOKEN=
SEGMENT_SPACE_ID=
SEGMENT_WRITE_KEY=

```

# Twilio Segment
Retell bots an take advantage of Twilio Segment CDP integration by looking up customer information, updating customer information and adding data to the customer's profile. 

We can do this by using tools defined in this project. Below are a list of tools to perform the respective action.


| Tool            | Path                        | Purpose                                                 |
| --------------- | --------------------------- | ------------------------------------------------------- |
| Customer lookup | <your domain>/lookup        | Find the customer's profile base on the incoming number |
| Update details  | <your domain>/save_customer | Store the customer information against their profile    |
| Add event       | <your domain>/add_event     | Add a tracking event for this customer                  |

# Tool: Customer lookup

The customer lookup tool doesn't require any tool body as the required data is passed in metadata (assuming that you are using the `/start` function that is also in this project).


# Tool: Update details

The update details tool has the following definition, you can adjust as required.

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Name of the customer"
    },
    "phone": {
      "type": "string",
      "description": "E.164 phone number of the customer"
    },
    "address": {
      "type": "string",
      "description": "Customer delivery or billing address"
    }
  },
  "required": [
    "name",
    "phone"
  ]
}
```

# Tool: Add Event

The add event (place order) tool has the following definition, you can adjust as required.

Note that the tool name (e.g. `place_order`) as defined in Retell is used as the event name.

Additionally, note that you can used this same tool definition again to send events with a difference event name.

```json
{
  "type": "object",
  "properties": {
    "summary": {
      "type": "string",
      "description": "Summary of the pizza order including all items"
    },
    "total": {
      "type": "string",
      "description": "Total price of the order"
    },
    "timestamp": {
      "type": "string",
      "description": "String representation of the time of this order"
    }
  },
  "required": [
    "summary",
    "total",
    "timestamp"
  ]
}
```

# Twilio Studio
## Redirect back to Twilio Studio
To redirect the call back to Twilio Studio we send the call to a Twilio App

First create the Studio flow and get the Webhook URL. 

Create the app and use this Studio Webhook URL

![Demo Image](/docs/app.png)

## Retell Tools
Create a tool in RetellAI that calls the redirect URI passing the Application SID as a parameter

The tool definition is like this:
```json
{
  "type": "object",
  "properties": {
    "Summary": {
      "type": "string",
      "description": "Summary of the conversation so far"
    }
  },
  "required": [
    "Summary"
  ]
}
```
![Demo Image](/docs/tool.png)

## Studio
The studio flow can be configured to take parameters passed into the application from Retell and then use these in Flex

![Demo Image](/docs/studio.png)

![Demo Image](/docs/studio_data.png)

## Flex
The data (in this case summary) can be shown to the Flex agent

![Demo Image](/docs/flex.png)
