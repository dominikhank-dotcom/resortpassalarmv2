import { Resend } from 'resend';
import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, phone, sendEmail, sendSms } = req.body;
  const results = { email: null, sms: null, errors: [] };