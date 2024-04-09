# Twilio Serverless function Retell AI
Connect you existing Twilio account to Retell AI with a simple serverless function.

This project is simply one function that you can configure on your Twilio phone number.

Configure the retell `agent_id` as **either** an environment variable or a query parameter. The query parameter will take precedent.

![Demo Image](/docs/demo.png)

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

```