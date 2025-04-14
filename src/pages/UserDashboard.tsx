import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Store } from '../types';
import { useAuthStore } from '../store/auth';
import StoreCard from '../components/StoreCard';

const UserDashboard = () => {
  const { user } = useAuthStore();
  const [stores, setStores] = useState<Store[]>([]);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStores = async () => {
      const { data: storesData } = await supabase
        .from('store_analytics')
        .select('*');

      if (storesData) {
        setStores(storesData);
      }

      if (user) {
        const { data: ratingsData } = await supabase
          .from('ratings')
          .select('store_id, rating')
          .eq('user_id', user.id);

        if (ratingsData) {
          const ratings = ratingsData.reduce((acc, curr) => ({
            ...acc,
            [curr.store_id]: curr.rating
          }), {});
          setUserRatings(ratings);
        }
      }
    };

    fetchStores();
  }, [user]);

  const handleRatingSubmit = async (storeId: string, rating: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('ratings')
      .upsert({
        store_id: storeId,
        user_id: user.id,
        rating
      }, {
        onConflict: 'store_id,user_id'
      });

    if (!error) {
      setUserRatings(prev => ({
        ...prev,
        [storeId]: rating
      }));

      // Refresh store data to update average rating
      const { data } = await supabase
        .from('store_analytics')
        .select('*')
        .eq('id', storeId)
        .single();

      if (data) {
        setStores(prev =>
          prev.map(store =>
            store.id === storeId ? { ...store, ...data } : store
          )
        );
      }
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Stores</h1>
        <input
          type="text"
          placeholder="Search stores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md w-64"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStores.map(store => (
          <StoreCard
            key={store.id}
            store={store}
            userRating={userRatings[store.id]}
            onRatingSubmit={(rating) => handleRatingSubmit(store.id, rating)}
          />
        ))}
      </div>
    </div>
  );
}

export default UserDashboard;