import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { MATCHES, USERS } from '@/lib/schedule';
import { DbPrediction } from '@/lib/types';

// Run on every request dynamically
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Check that the DISCORD_WEBHOOK_URL is configured
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Discord webhook URL is not configured' }, { status: 500 });
  }

  const now = new Date();
  
  // Look for any matches with a deadline in the next 60 minutes
  // Example: If this runs at 7:00 PM, the 7:25 PM deadline is 25 minutes away (which fits!)
  const sixtyMinsFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  const upcomingMatches = MATCHES.filter(m => {
    const deadline = new Date(m.deadlineISO);
    return deadline > now && deadline <= sixtyMinsFromNow;
  });

  if (upcomingMatches.length === 0) {
    return NextResponse.json({ message: 'No matches have deadlines closing in the next 30 minutes.' });
  }

  const messagesSent = [];

  for (const match of upcomingMatches) {
    // 1. Fetch predictions for this match from Supabase
    const { data: preds, error } = await supabase
      .from('predictions')
      .select('user_name')
      .eq('match_id', match.id);

    if (error) {
      console.error(`Error fetching predictions for match ${match.id}:`, error);
      continue;
    }

    // 2. Identify missing participants
    const predictedUsers = (preds as Pick<DbPrediction, 'user_name'>[]).map((p) => p.user_name);
    const missingUsers = USERS.filter((u:any) => !predictedUsers.includes(u));

    const DISCORD_IDS: Record<string, string> = {
      Sravanth: '735553288040087623',
      Nithin: '733604727056498720',
      Vikhyath: '1463047428495118377',
      Sathwik: '736222173714186261',
      Srivatsav: '755378782734385163',
    };

    // 3. Send Discord Reminder if anyone is missing
    if (missingUsers.length > 0) {
      // Calculate how many minutes left until deadline
      const deadline = new Date(match.deadlineISO);
      const minutesLeft = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60));

      const mentionTags = missingUsers.map((u) => `<@${DISCORD_IDS[u] || u}>`).join(' ');
      
      const messageText = `🚨 **IPL PREDICTION REMINDER!** 🚨\nMatch **#${match.id}** (${match.team1} vs ${match.team2}) locks in **${minutesLeft} minutes**!\n${mentionTags} — you have not submitted your predictions yet. Get them in before the deadline! 🏏⏱️\n\n`;

      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageText,
        }),
      });

      messagesSent.push(match.id);
    }
  }

  return NextResponse.json({ 
    message: 'Cron job executed successfully.',
    matchesProcessed: upcomingMatches.length,
    remindersSentForMatches: messagesSent
  });
}
