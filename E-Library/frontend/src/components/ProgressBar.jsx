import React from 'react';

const ProgressBar = ({ current, total }) => {
  const percentage = (current / total) * 100;
  const isComplete = percentage >= 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="text-sm font-bold text-gray-900">Overall Progress</span>
          <p className="text-xs text-gray-600 mt-1">
            {current.toLocaleString()} of {total.toLocaleString()} pages completed
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-indigo-600">{percentage.toFixed(0)}%</div>
          {isComplete && <span className="text-xs text-green-600 font-medium">✓ Completed</span>}
        </div>
      </div>
      
      {/* Background with gradient */}
      <div className="relative h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full overflow-hidden shadow-inner">
        {/* Progress fill with gradient */}
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isComplete 
              ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-lg' 
              : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg'
          }`}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
        </div>
      </div>

      {/* Status labels */}
      <div className="flex justify-between mt-3">
        <span className="text-xs font-medium text-gray-600">
          {percentage < 25 && '🚀 Just Started'}
          {percentage >= 25 && percentage < 50 && '📖 Making Progress'}
          {percentage >= 50 && percentage < 75 && '⚡ More than Halfway'}
          {percentage >= 75 && percentage < 100 && '🏁 Almost Done'}
          {isComplete && '🎉 Finished'}
        </span>
        <span className="text-xs text-gray-600">
          {(total - current).toLocaleString()} pages remaining
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
