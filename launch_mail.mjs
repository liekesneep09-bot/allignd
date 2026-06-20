import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import readline from 'readline';

// Laad de .env variabelen (zorg dat RESEND_API_KEY en SUPABASE variabelen erin staan)
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.error("❌ FOUT: RESEND_API_KEY ontbreekt in je .env bestand!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = new Resend(resendApiKey);

// ==========================================
// 📝 PAS HIER JE E-MAIL TEKST AAN
// ==========================================
const EMAIL_SUBJECT = "Allignd is live! 🎉 Jouw exclusieve toegang";
const SENDER_EMAIL = "Allignd <info@allignd.fit>";

const getEmailHtml = (email) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="text-align: center; padding: 20px 0;">
    <h1 style="color: #E29578;">We zijn live! 🚀</h1>
  </div>
  
  <p>Hoi!</p>
  
  <p>Je hebt je een tijdje geleden ingeschreven voor onze wachtlijst, en het moment is eindelijk daar: <strong>Allignd is officieel gelanceerd!</strong></p>
  
  <p>Allignd is dé app die jou gaat helpen trainen en eten op basis van jouw persoonlijke cyclus. Geen one-size-fits-all schema's meer, maar werken mét je lichaam in plaats van ertegen.</p>
  
  <div style="text-align: center; margin: 40px 0;">
    <a href="https://allignd.fit" style="background-color: #E29578; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
      Bekijk Allignd
    </a>
  </div>

  <p>Omdat je een van onze allereerste supporters was op de wachtlijst, willen we je ontzettend bedanken voor je geduld.</p>
  
  <p>Liefs,<br>Team Allignd</p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin-top: 40px;" />
  <p style="font-size: 12px; color: #999; text-align: center;">
    Je ontvangt deze e-mail omdat je bent ingeschreven met ${email}.<br>
    © 2024 Allignd
  </p>
</div>
`;
// ==========================================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log("🔍 Wachtlijst ophalen uit Supabase...");
  
  const { data: waitlist, error } = await supabase
    .from('waitlist')
    .select('email');

  if (error) {
    console.error("❌ Fout bij ophalen wachtlijst:", error.message);
    process.exit(1);
  }

  if (!waitlist || waitlist.length === 0) {
    console.log("ℹ️ Er staan nog geen e-mailadressen op je wachtlijst.");
    process.exit(0);
  }

  const emails = waitlist.map(entry => entry.email).filter(Boolean);
  
  console.log(\`\n✅ \${emails.length} e-mailadres(sen) gevonden op de wachtlijst.\`);
  console.log(\`\nHet onderwerp is: "\${EMAIL_SUBJECT}"\`);
  
  rl.question(\`\n⚠️ Weet je ZEKER dat je de lanceringsmail wilt sturen naar \${emails.length} personen? (typ 'JA' om te versturen): \`, async (answer) => {
    if (answer !== 'JA') {
      console.log("🛑 Geannuleerd. Er zijn geen e-mails verstuurd.");
      process.exit(0);
    }

    console.log("\\n🚀 Verzenden gestart...\\n");

    let successCount = 0;
    let failCount = 0;

    for (const email of emails) {
      try {
        const { data, error } = await resend.emails.send({
          from: SENDER_EMAIL,
          to: email,
          subject: EMAIL_SUBJECT,
          html: getEmailHtml(email),
        });

        if (error) {
          console.error(\`❌ Mislukt voor \${email}:\`, error.message);
          failCount++;
        } else {
          console.log(\`✅ Succesvol verstuurd naar \${email}\`);
          successCount++;
        }
      } catch (err) {
        console.error(\`❌ Error voor \${email}:\`, err.message);
        failCount++;
      }
      
      // Kleine pauze inbouwen om niet de limiet van Resend te raken (max 10 per seconde)
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log("\\n🎉 Klaar met verzenden!");
    console.log(\`Verstuurd: \${successCount}\`);
    console.log(\`Mislukt: \${failCount}\`);
    
    process.exit(0);
  });
}

main();
