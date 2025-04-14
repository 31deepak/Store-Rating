import { useState } from 'react';
import { Star, Store } from 'lucide-react';
import { Store as StoreType } from '../types';
import RatingForm from './RatingForm';

interface StoreCardProps {
  store: StoreType;
  userRating?: number;
  onRatingSubmit: (rating: number) => Promise<void>;
}

const StoreCard = ({ store, userRating, onRatingSubmit }: StoreCardProps) => {
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <Store className="h-8 w-8 text-blue-500 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
            <p className="text-gray-600">{store.address}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-400 mr-1" />
            <span className="font-semibold">{store.average_rating?.toFixed(1) || 'N/A'}</span>
            <span className="text-gray-500 text-sm ml-1">
              ({store.total_ratings || 0} ratings)
            </span>
          </div>
          {userRating && (
            <p className="text-sm text-gray-600 mt-1">
              Your rating: {userRating}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={() => setIsRatingOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          {userRating ? 'Update Rating' : 'Rate Store'}
        </button>
      </div>

      {isRatingOpen && (
        <RatingForm
          initialRating={userRating}
          onSubmit={async (rating) => {
            await onRatingSubmit(rating);
            setIsRatingOpen(false);
          }}
          onCancel={() => setIsRatingOpen(false)}
        />
      )}
    </div>
  );
}

export default StoreCard;