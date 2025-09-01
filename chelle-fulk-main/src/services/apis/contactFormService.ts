import API_BASE from '../../constants/apiBase';
import { ContactFormDTO } from '../../models/ContactFormDTO';

export const submitContactForm = async (form: ContactFormDTO) => {
  const response = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  });
  if (!response.ok) {
    throw new Error('Failed to submit contact form');
  }
  return response.json();
};
