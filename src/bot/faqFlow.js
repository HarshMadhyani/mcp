const { STATES, setState } = require('./states');
const { sendText, bold } = require('../whatsapp/baileys');
const { showMainMenu } = require('./mainMenu');
const faqService = require('../services/faqService');
const { config } = require('../config/env');

async function handleFAQFlow(jid, whatsappNumber, text) {
  const lowerText = text.toLowerCase().trim();

  if (lowerText === 'back' || lowerText === 'menu') {
    setState(whatsappNumber, STATES.MAIN_MENU);
    await showMainMenu(jid);
    return;
  }

  const faqs = await faqService.getFAQs(true);

  if (lowerText === 'list') {
    if (faqs.length === 0) {
      await sendText(jid, `❓ ${bold('FAQs')}\n\nNo FAQs available at the moment.\n\nType ${bold('menu')} to go back.`);
      setState(whatsappNumber, STATES.MAIN_MENU);
      return;
    }

    let msg = `❓ ${bold(`${config.university.shortName} — Frequently Asked Questions`)}\n\n`;
    faqs.forEach((faq, i) => {
      msg += `${i + 1}️⃣ ${faq.question}\n`;
    });
    msg += `\nReply with a number to see the answer.\nType ${bold('back')} to return to menu.`;

    await sendText(jid, msg);
    return;
  }

  // FAQ detail
  const num = parseInt(text, 10);
  if (!isNaN(num) && num >= 1 && num <= faqs.length) {
    const faq = faqs[num - 1];
    let msg = `❓ ${bold(faq.question)}\n\n${faq.answer}\n\n`;
    msg += `Type a number to view another FAQ.\nType ${bold('back')} to return to menu.`;
    await sendText(jid, msg);
  } else {
    await sendText(jid, `Please select a valid FAQ number.\n\nType ${bold('back')} to return to menu.`);
  }
}

module.exports = { handleFAQFlow };
