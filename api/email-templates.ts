
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: any, res: any) {
  // Allow GET to fetch templates
  if (req.method === 'GET') {
      try {
          console.log(">>> Fetching Email Templates...");
          const { data, error } = await supabase
            .from('email_templates')
            .select('*')
            .order('id');
          
          if (error) {
              console.error(">>> DB Error fetching templates:", error);
              throw error;
          }
          
          console.log(`>>> Templates found: ${data?.length || 0}`);
          return res.status(200).json(data);
      } catch (error: any) {
          console.error(">>> API Error:", error.message);
          return res.status(500).json({ error: error.message });
      }
  } 
  
  // Allow POST to save (ADMIN only)
  else if (req.method === 'POST') {
      const { userId, template } = req.body;

      if (!userId || !template || !template.id) {
          return res.status(400).json({ error: 'Missing parameters' });
      }

      try {
          // Verify Admin
          const { data: user } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
          
          if (!user || user.role !== 'ADMIN') {
              return res.status(403).json({ error: 'Unauthorized' });
          }

          // Upsert Template
          const { error } = await supabase
            .from('email_templates')
            .upsert({
                id: template.id,
                name: template.name,
                description: template.description,
                category: template.category,
                subject: template.subject,
                body: template.body,
                variables: template.variables,
                is_enabled: template.isEnabled, // Map frontend 'isEnabled' to DB 'is_enabled'
                updated_at: new Date().toISOString()
            });
          
          if (error) throw error;

          return res.status(200).json({ success: true });
      } catch (error: any) {
          return res.status(500).json({ error: error.message });
      }
  } 
  
  else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}