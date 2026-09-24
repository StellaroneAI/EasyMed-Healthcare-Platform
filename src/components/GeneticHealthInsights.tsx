import React from 'react';

export default function GeneticHealthInsights() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Genetic Health Insights</h1>
        <p className="mt-2 text-gray-600">Genetic and pharmacogenomic insights will appear here when a validated genetic-data integration is connected to your account.</p>
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No genetic results are being fabricated or inferred locally. EasyMed will only display results supplied by a validated laboratory or clinical genetics provider.
        </div>
      </div>
    </div>
  );
}
