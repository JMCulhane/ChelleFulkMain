
import React, { useState, FormEvent } from "react";
import PaddingWrapper from "../styling/PaddingWrapper";
import { ContactFormDTO } from '../../models/ContactFormDTO';

const ContactForm: React.FC = () => {
  const [form, setForm] = useState<ContactFormDTO>({
    fullName: "",
    email: "",
    subject: "",
    message: "",
    timestamp: new Date()
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.subject || !form.message || !form.fullName) {
      alert("Please fill in all required fields.");
      return;
    }

    const submission: ContactFormDTO = {
      ...form,
      timestamp: new Date()
    };

    console.log("Form submitted:", submission);
    alert("Thank you for your message!");
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
                htmlFor="fullName"
                className="block mb-1 font-fell tracking-wide text-yellow-300"
              >
                Full Name <span className="text-yellow-600">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleInputChange}
                required
                className="w-full border border-yellow-700 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-600 bg-black text-yellow-300 placeholder-yellow-600"
                placeholder="Your full name"
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
              />
            </div>

            <button
              type="submit"
              className="text-neutral-50 bg-yellow-400 hover:bg-yellow-400/80 rounded-md px-3 py-2 text-sm font-medium font-fell text-xl transition"
            >
              Send Mail
            </button>
          </form>
        </div>
      </PaddingWrapper>
  );
};

export default ContactForm;
