'use client';

interface AnalysisProgressProps {
  progress: {
    totalLeads: number;
    processed: number;
    successful: number;
    failed: number;
    currentBatch: number;
    totalBatches: number;
    estimatedCost?: number;
  };
}

export default function AnalysisProgress({ progress }: AnalysisProgressProps) {
  const percentage = Math.round((progress.processed / progress.totalLeads) * 100);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="font-semibold mb-4">Analysis in Progress...</h3>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Batch {progress.currentBatch} of {progress.totalBatches}</span>
          <span>{progress.processed} / {progress.totalLeads} leads ({percentage}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-gray-600">Successful</div>
          <div className="text-lg font-semibold text-green-600">{progress.successful}</div>
        </div>
        <div>
          <div className="text-gray-600">Failed</div>
          <div className="text-lg font-semibold text-red-600">{progress.failed}</div>
        </div>
        <div>
          <div className="text-gray-600">Estimated Cost</div>
          <div className="text-lg font-semibold">${(progress.estimatedCost || 0).toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
