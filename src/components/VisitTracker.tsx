'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function VisitTracker() {
  useEffect(() => {
    async function logVisit() {
      try {
        const hasVisited = sessionStorage.getItem('scent_visit_logged');
        if (!hasVisited) {
          // Log visit timestamp in Supabase site_visits table
          const { error } = await supabase.from('site_visits').insert({});
          if (error) {
            console.error('Error logging visit:', error.message);
          } else {
            sessionStorage.setItem('scent_visit_logged', 'true');
          }
        }
      } catch (err) {
        console.error('Visit tracker exception:', err);
      }
    }
    logVisit();
  }, []);

  return null; // Invisible utility component
}
