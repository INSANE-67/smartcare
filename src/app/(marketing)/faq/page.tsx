import { Metadata } from "next";
import { FaqAccordion } from "@/components/marketing/faq-accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently Asked Questions about SmartCare.",
};

const FAQS = [
  {
    question: "How do I book an appointment?",
    answer: "You can book an appointment by creating a patient account, navigating to the Doctors Directory, and selecting an available time slot for your preferred doctor."
  },
  {
    question: "Is my medical data secure?",
    answer: "Yes. SmartCare uses enterprise-grade encryption and strict access control policies to ensure your medical records are only visible to you and your authorized doctors."
  },
  {
    question: "How do doctors get verified on the platform?",
    answer: "Every doctor must submit their medical license and credentials during registration. Our administrative team manually verifies these credentials before the doctor's profile becomes public."
  },
  {
    question: "Can I access my digital prescriptions?",
    answer: "Absolutely. Any prescription issued by your doctor through the platform is instantly available in your digital records."
  }
];

export default function FaqPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600">Find answers to common questions about using SmartCare.</p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, i) => (
          <FaqAccordion key={i} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
}
