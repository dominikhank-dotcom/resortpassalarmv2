
export default async function handler(req: any, res: any) {
  // Gemäß Anweisung erhalten Kunden ohne aktives Abo keine E-Mails oder SMS mehr.
  // Da dieser Cronjob explizit Nutzer ohne Abo kontaktiert, wird er deaktiviert.
  return res.status(200).json({ success: true, message: 'Abandoned Cart Notifications are disabled as per strict subscription policy.' });
}
