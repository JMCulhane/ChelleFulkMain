
import React, { useState, FormEvent } from "react";
import Spinner from "../errors/Spinner";
import { submitContactForm } from '../../services/apis/contactFormService';
import emailjs from 'emailjs-com';
import PaddingWrapper from "../styling/PaddingWrapper";
import { ContactFormDTO } from '../../models/ContactFormDTO';

const ContactForm: React.FC = () => {
  const [form, setForm] = useState<ContactFormDTO>({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Clear any previous status message when submit is clicked
    setStatus(null);

    if (!form.email || !form.subject || !form.message || !form.name) {
      setStatus({ success: false, message: "Please fill in all required fields." });
      return;
    }

    setLoading(true);
    const submission: ContactFormDTO = {
      ...form
    };

    // === EmailJS integration ===
    /*
    try {
      // Use your actual SERVICE_ID and TEMPLATE_ID here
      const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
      const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;

      const templateParams = {
        from_name: form.name,
        from_email: form.email,
        subject: form.subject,
        message: form.message,
      };

      const response = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams
      );

      if (response.status === 200) {
        setStatus({ success: true, message: "Your email has been successfully submitted." });
        setForm({
          name: "",
          email: "",
          subject: "",
          message: "",
          timestamp: new Date()
        });
      } else {
        setStatus({ success: false, message: "There was an error sending your message. Please try again later." });
      }
    } catch (error) {
      console.error('Error sending contact form:', error);
      setStatus({ success: false, message: "There was an error sending your message. Please try again later." });
    } finally {
      setLoading(false);
    }
    // === END EmailJS integration ===
    */

    // === Backend API submission ===
    try {
      console.log('Submitting contact form:', submission);
      const response = await submitContactForm(submission);
      // EmailJS returns an object with 'status' and 'text' properties
      if (response.status === 200) {
        setStatus({ success: true, message: "Your email has been successfully submitted." });
        setForm({
          name: "",
          email: "",
          subject: "",
          message: ""
        });
      } else {
        setStatus({ success: false, message: response.text || "There was an error sending your message. Please try again later." });
      }
    } catch (error) {
  console.error('Error sending contact form:', error);
  const errMsg = (error as any)?.message || "There was an error sending your message. Please try again later.";
  setStatus({ success: false, message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaddingWrapper basePadding="pt-32 p-4" smPadding="sm:pt-36 sm:p-6" mdPadding="md:pt-28 md:p-8">
      <div className="max-w-3xl mx-auto p-8 bg-black rounded-lg shadow-lg font-serif text-yellow-300">
        <h1 className="text-4xl font-fell mb-6 border-b border-yellow-600 pb-2 tracking-wider">
          Contact Chelle
        </h1>

        <p className="mb-5 leading-relaxed italic text-yellow-400">
          To inquire about working with Chelle on a project, please reach out via our online contact form.
          Please include as many details as possible, including dates, basic project
          outline/summary, and estimated budget.
        </p>
        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-gray-900 p-8 rounded-lg border border-yellow-700 shadow-inner"
        >
          <div>
            <label
              htmlFor="name"
              className="block mb-1 font-fell tracking-wide text-yellow-300"
            >
              Name <span className="text-yellow-600">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleInputChange}
              required
              className="w-full border border-yellow-700 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-600 bg-black text-yellow-300 placeholder-yellow-600"
              placeholder="Your name"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block mb-1 font-fell tracking-wide text-yellow-300"
            >
              Email <span className="text-yellow-600">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleInputChange}
              required
              className="w-full border border-yellow-700 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-600 bg-black text-yellow-300 placeholder-yellow-600"
              placeholder="your.email@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block mb-1 font-fell tracking-wide text-yellow-300"
            >
              Subject <span className="text-yellow-600">*</span>
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              value={form.subject}
              onChange={handleInputChange}
              required
              className="w-full border border-yellow-700 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-600 bg-black text-yellow-300 placeholder-yellow-600"
              placeholder="Subject of your inquiry"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block mb-1 font-fell tracking-wide text-yellow-300"
            >
              Message <span className="text-yellow-600">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              value={form.message}
              onChange={handleInputChange}
              required
              className="w-full border border-yellow-700 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-600 bg-black text-yellow-300 placeholder-yellow-600 resize-none"
              placeholder="Write your inquiry here"
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="text-neutral-50 bg-yellow-400 hover:bg-yellow-400/80 rounded-md px-3 py-2 text-sm font-medium font-fell text-xl transition"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Mail"}
            </button>
            {loading && (
              <Spinner size={32} />
            )}
          </div>
        </form>
        {status && (
          <div className={`mt-6 text-lg font-semibold ${status.success ? 'text-green-400' : 'text-red-400'}`}
               role="alert">
            {status.message}
          </div>
        )}
      </div>
    </PaddingWrapper>
  );
};

export default ContactForm;
