import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { MATCHES, USERS } from '@/lib/schedule';
import { DbPrediction } from '@/lib/types';

// Run on every request dynamically
export const dynamic = 'force-dynamic';

// WhatsApp phone numbers mapped to usernames
const WHATSAPP_NUMBERS: Record<string, string> = {
  Sravanth: process.env.WHATSAPP_SRAVANTH || '',
  Nithin: process.env.WHATSAPP_NITHIN || '',
  Vikhyath: process.env.WHATSAPP_VIKHYATH || '',
  Sathwik: process.env.WHATSAPP_SATHWIK || '',
  Srivatsav: process.env.WHATSAPP_SRIVATSAV || '',
};

// Discord IDs mapped to usernames
const DISCORD_IDS: Record<string, string> = {
  Sravanth: '735553288040087623',
  Nithin: '733604727056498720',
  Vikhyath: '1463047428495118377',
  Sathwik: '736222173714186261',
  Srivatsav: '755378782734385163',
};

async function sendWhatsAppReminder(phoneNumber: string, matchId: string, team1: string, team2: string, minutesLeft: number) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER; // format: 'whatsapp:+1234567890'

  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.error('Twilio credentials not configured');
    return false;
  }

  const messageText = `🚨 IPL PREDICTION REMINDER!\nMatch #${matchId} (${team1} vs ${team2}) locks in ${minutesLeft} minutes!\n\nYou haven't submitted your prediction yet. Get it in before the deadline! 🏏⏱️`;

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'From': twilioPhoneNumber,
        'To': `whatsapp:${phoneNumber}`,
        'Body': messageText,
      }).toString(),
    });

    if (!response.ok) {
      console.error(`Failed to send WhatsApp to ${phoneNumber}:`, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error sending WhatsApp to ${phoneNumber}:`, error);
    return false;
  }
}

async function sendDiscordReminder(missingUsers: string[], matchId: string, team1: string, team2: string, minutesLeft: number) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('Discord webhook URL not configured, skipping Discord notification');
    return false;
  }

  const mentionTags = missingUsers.map((u) => `<@${DISCORD_IDS[u] || u}>`).join(' ');
  const messageText = `🚨 **IPL PREDICTION REMINDER!** 🚨\nMatch **#${matchId}** (${team1} vs ${team2}) locks in **${minutesLeft} minutes**!\n${mentionTags} — you have not submitted your predictions yet. Get them in before the deadline! 🏏⏱️`;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: messageText,
      }),
    });

    if (!response.ok) {
      console.error(`Failed to send Discord message:`, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error sending Discord reminder:`, error);
    return false;
  }
}

export async function GET(request: Request) {
  const now = new Date();
  
  // Look for any matches with a deadline in the next 60 minutes
  const sixtyMinsFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  const upcomingMatches = MATCHES.filter(m => {
    const deadline = new Date(m.deadlineISO);
    return deadline > now && deadline <= sixtyMinsFromNow;
  });

  const messagesSent: any[] = [];

  for (const match of upcomingMatches) {
    // 1. Fetch predictions for this match
    const { data: preds, error } = await supabase
      .from('predictions')
      .select('user_name')
      .eq('match_id', match.id);

    if (error) {
      console.error(`Error fetching predictions for match ${match.id}:`, error);
      continue;
    }

    // 2. Identify missing participants
    const predictedUsers = (preds as { user_name: string }[]).map((p) => p.user_name);
    const missingUsers = USERS.filter((u) => !predictedUsers.includes(u));

    console.log(`\n=== MATCH ${match.id} (${match.team1} vs ${match.team2}) ===`);
    console.log(`Missing Users: ${JSON.stringify(missingUsers)}`);

    // 3. Send Reminders if anyone is missing
    if (missingUsers.length > 0) {
      const deadline = new Date(match.deadlineISO);
      const minutesLeft = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60));

      // Send Discord notification (to all missing users at once)
      await sendDiscordReminder(missingUsers, match.id.toString(), match.team1, match.team2, minutesLeft);

      // Send WhatsApp individual notifications
      const sentUsers: string[] = [];

      for (const user of missingUsers) {
        const phoneNumber = WHATSAPP_NUMBERS[user];
        if (!phoneNumber) {
          console.warn(`No WhatsApp number configured for user: ${user}`);
          continue;
        }

        const sent = await sendWhatsAppReminder(phoneNumber, match.id.toString(), match.team1, match.team2, minutesLeft);
        if (sent) {
          sentUsers.push(user);
        }
      }

      if (sentUsers.length > 0) {
        messagesSent.push({ matchId: match.id.toString(), users: sentUsers });
      }
    }
  }

  return NextResponse.json({ 
    message: 'Cron job executed successfully.',
    matchesProcessed: upcomingMatches.length,
    remindersSent: messagesSent
  });
}

