// Clerkのwebhookを用いてユーザー情報をcreate,getするためのAPI

import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    console.log("Webhook POST Recieved");
    

    const evt = await verifyWebhook(req)

    console.log("Webhook verifyWebhook OK");
    console.log("Event Type:" ,evt.type);
    

    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt.data
    const eventType = evt.type
    if (eventType === 'user.created') {
      const user = evt.data;

      // DBへ送る各種情報
      const clerkUserId = user.id;
      const firstName = user.first_name ?? "";
      const lastName = user.last_name ?? "";
      const name = `${firstName} ${lastName}`;
      const email = user.email_addresses.find(
        (email) => email.id === user.primary_email_address_id
      )
      ?.email_address 
      ?? "";
      
      const InsertData = {
        clerkId : clerkUserId,
        name : name,
        email :email
      }

      console.log("Expressへ送るデータ");
      console.log(InsertData);
      
      // Expressへユーザー登録情報を連携
      const response = await fetch("http://localhost:3001/api/users",{
        body: JSON.stringify(InsertData),
        method: "POST",
        headers: {"Content-Type" : "application/json",}
      })

    }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}