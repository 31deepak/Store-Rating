import { useEffect, useState } from 'react';
import { Users, Store as StoreIcon, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile, Store } from '../types';
import UserTable from '../components/UserTable';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total_users: 0, total_stores: 0, total_ratings: 0 });
  const [users, setUsers] = useState<Profile[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [sortField, setSortField] = useState<keyof Profile>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase.rpc('get_system_stats');
      if (!error && data) {
        setStats(data);
      }
    };

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });
      
      if (!error && data) {
        setUsers(data);
      }
    };

    const fetchStores = async () => {
      const { data, error } = await supabase
        .from('store_analytics')
        .select('*');
      
      if (!error && data) {
        setStores(data);
      }
    };

    fetchStats();
    fetchUsers();
    fetchStores();
  }, [sortField, sortDirection]);

  const handleSort = (field: keyof Profile) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total_users}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StoreIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Stores</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total_stores}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Ratings</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total_ratings}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Users</h2>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <UserTable
          users={filteredUsers}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      </div>
    </div>
  );
}

export default AdminDashboard;