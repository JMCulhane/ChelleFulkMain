// import API_BASE from '../../constants/apiBase';
import { ContactFormDTO } from '../../models/ContactFormDTO';
import emailjs from 'emailjs-com';

// Backend API submission (commented out until backend can be implemented).
// import API_BASE from '../../constants/apiBase';
// export const submitContactForm = async (form: ContactFormDTO) => {
//   const response = await fetch(`${API_BASE}/contact`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(form),
//   });
//   if (!response.ok) {
//     throw new Error('Failed to submit contact form');
//   }
//   return response.json();
// };

// EmailJS implementation
export const submitContactForm = async (form: ContactFormDTO) => {
  // Replace these with your actual EmailJS service/template/user IDs
  const SERVICE_ID = 'service_8qcyh84';
  const TEMPLATE_ID = 'template_qi8yqpb';
  const USER_ID = 'ZwhyTekB83Pe5dfJd';

  // Only send required fields to EmailJS
  const templateParams = {
    from_name: form.name,
    from_email: form.email,
    subject: form.subject,
    message: `Hi, my name is ${form.name}\n\n${form.message}`
  };
  console.log('[EmailJS] Sending templateParams:', templateParams);

  try {
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      USER_ID
    );
    return response;
  } catch (error) {
    throw new Error('Failed to send contact form email via EmailJS');
  }
};
