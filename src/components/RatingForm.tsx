import { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingFormProps {
  initialRating?: number;
  onSubmit: (rating: number) => Promise<void>;
  onCancel: () => void;
}

const RatingForm = ({ initialRating = 0, onSubmit, onCancel }: RatingFormProps) => {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-md">
      <div className="flex items-center space-x-2 mb-4">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => setRating(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none"
          >
            <Star
              className={`h-8 w-8 ${
                (hoveredRating || rating) >= value
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onSubmit(rating)}
          disabled={!rating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Submit
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default RatingForm;