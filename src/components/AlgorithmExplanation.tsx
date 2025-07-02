import { algorithmExplanations } from '@/lib/algorithmExplanations';

interface AlgorithmExplanationProps {
  algorithmKey: string;
}

export default function AlgorithmExplanation({ algorithmKey }: AlgorithmExplanationProps) {
  const explanation = algorithmExplanations[algorithmKey];

  if (!explanation) return null;

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">How it works</h2>
      <div className="prose prose-blue max-w-none">
        {explanation.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-2 text-gray-600">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
} 