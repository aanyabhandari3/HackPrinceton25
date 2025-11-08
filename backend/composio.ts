import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import { generateText } from "ai";
import { xai } from '@ai-sdk/xai';
import * as dotenv from 'dotenv';


dotenv.config();

const composio = new Composio({
  apiKey: process.env.GROK_API_KEY,
  provider: new VercelProvider(),
});

// Id of the user in your system
const externalUserId = "pg-test-9b0fc583-14c5-4ffd-a5e1-80b5712d3707";

const connectionRequest = await composio.connectedAccounts.link(
  externalUserId,
  "ac_W6fC5Olryy0I"
);

// redirect the user to the OAuth flow
const redirectUrl = connectionRequest.redirectUrl;
console.log(`Please authorize the app by visiting this URL: ${redirectUrl}`);

// wait for connection to be established
const connectedAccount = await connectionRequest.waitForConnection();

const tools = await composio.tools.get(externalUserId, "GMAIL_SEND_EMAIL");

// env: OPENAI_API_KEY
const { text } = await generateText({
  model: xai("grok-4-fast-reasoning"),
  messages: [
    {
      role: "user",
      content: `Send an email to sarvgad@gmail.com with the subject 'Hello from composio 👋🏻' and the body 'Congratulations on sending your first email using AI Agents and Composio!'`,
    },
  ],
  tools,
  maxSteps: 5,
});

console.log("Email sent successfully!", { text });

// Create a trigger
const trigger = await composio.triggers.create(
  externalUserId,
  "GMAIL_NEW_GMAIL_MESSAGE",
  {
    connectedAccountId: connectedAccount.id,
    triggerConfig: {
      labelIds: "INBOX",
      userId: "me",
      interval: 1,
    },
  }
);
console.log(
  `✅ Trigger created successfully. Trigger Id: ${trigger.triggerId}`
);

/**
 * subscribe to trigger events
 * Note: For production usecases, use webhooks. Read more here -> https://docs.composio.dev/docs/using-triggers
 *
 * You can send an email to yourself and see the events being captured in the console.
 */
composio.triggers.subscribe(
  (data) => {
    // Handle email data here
    console.log(
      `⚡️ Trigger event recieved for ${data.triggerSlug}`,
      JSON.stringify(data, null, 2)
    );
  },
  { triggerId: trigger.triggerId }
);
