'use client';

import { useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { useThemeColors } from '@/hooks/use-theme-colors';

const faqs = [
  {
    id: 'what-is-seva-eats',
    question: 'What is Seva Eats?',
    answer:
      "Seva Eats connects volunteers with communities in need by coordinating free langar meal deliveries from distribution hubs to shelters, food banks, and families. It's powered by the spirit of seva (selfless service).",
  },
  {
    id: 'how-to-request',
    question: 'How do I request a meal delivery?',
    answer:
      'Select a pickup location, choose meals, enter delivery details, and submit your request. A volunteer will be matched to fulfill your request.',
  },
  {
    id: 'delivery-time',
    question: 'How long does delivery take?',
    answer:
      "Most deliveries are completed within 30-60 minutes of matching with a volunteer. You'll receive updates on your delivery status.",
  },
  {
    id: 'dietary',
    question: 'Can I specify dietary restrictions?',
    answer:
      'Yes, add notes in the driver note field when creating a request. All langar meals are vegetarian.',
  },
  {
    id: 'cancel',
    question: 'How do I cancel a request?',
    answer:
      'Go to your active request details and tap Cancel Request. Please cancel as early as possible if your plans change.',
  },
];

export default function SupportPage() {
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <AppShell>
      <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
        <PageHeader title="Support" />
        <div className="p-4 space-y-3">
          <p className="text-sm" style={{ color: colors.mutedText }}>
            Questions? Reach us at support@sevaeats.org
          </p>
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: colors.border, backgroundColor: colors.surfaceElevated }}
            >
              <button
                type="button"
                onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                className="w-full px-4 py-3 text-left font-semibold"
                style={{ color: colors.text }}
              >
                {faq.question}
              </button>
              {expanded === faq.id && (
                <p className="px-4 pb-3 text-sm leading-5" style={{ color: colors.mutedText }}>
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
