// app/components/game/CustomerFeedback.tsx
'use client';

interface CustomerFeedbackProps {
  message: string;
}

export default function CustomerFeedback({ message }: CustomerFeedbackProps) {
  return (
    <div className="mb-6 p-4 bg-purple-100 rounded-xl border-2 border-purple-300">
      <h3 className="text-lg font-semibold text-purple-800 mb-2">💬 お客様の反応</h3>
      <div className="text-purple-700 min-h-16">
        {message && (
          <div className="whitespace-pre-line">
            {message.split('\n').map((line, index) => (
              <div key={index} className={index === 0 ? 'text-lg font-bold' : 'text-sm'}>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
