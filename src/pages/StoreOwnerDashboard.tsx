import { useEffect, useState } from 'react';
import { Star, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import { Profile } from '../types';

const StoreOwnerDashboard = () => {
  const { user } = useAuthStore();
  const [store, setStore] = useState<any>(null);
  const [ratings, setRatings] = useState<Array<{ user: Profile; rating: number }>>([]);
  const [sortField, setSortField] = useState<'name' | 'rating'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!user) return;

      const { data: storeData } = await supabase
        .from('store_analytics')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (storeData) {
        setStore(storeData);

        const { data: ratingsData } = await supabase
          .from('ratings')
          .select(`
            rating,
            profiles:user_id (
              id,
              name,
              email,
              address
            )
          `)
          .eq('store_id', storeData.id);

        if (ratingsData) {
          const formattedRatings = ratingsData.map(r => ({
            user: r.profiles[0] as Profile,
            rating: r.rating
          }));
          setRatings(formattedRatings);
        }
      }
    };

    fetchStoreData();
  }, [user]);

  const handleSort = (field: 'name' | 'rating') => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRatings = [...ratings].sort((a, b) => {
    const aValue = sortField === 'name' ? a.user.name : a.rating;
    const bValue = sortField === 'name' ? b.user.name : b.rating;
    return sortDirection === 'asc'
      ? aValue > bValue ? 1 : -1
      : aValue < bValue ? 1 : -1;
  });

  if (!store) {
    return (
      <div className="text-center text-gray-600">
        No store found. Please contact an administrator.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">{store.name}</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Star className="h-6 w-6 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Average Rating</p>
                <p className="text-lg font-semibold text-gray-900">
                  {store.average_rating?.toFixed(1) || 'N/A'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Ratings</p>
                <p className="text-lg font-semibold text-gray-900">
                  {store.total_ratings || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">User Ratings</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                User {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('rating')}
              >
                Rating {sortField === 'rating' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedRatings.map((rating, index) => (
              <tr key={rating.user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{rating.user.name}</div>
                      <div className="text-sm text-gray-500">{rating.user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="ml-1 text-sm text-gray-900">{rating.rating}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StoreOwnerDashboard;