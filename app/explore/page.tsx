'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

const ExplorePage = () => {
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const { data, error } = await supabase
          .from('entities')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (error) {
          setError(error.message);
          setEntities([]);
        } else {
          setEntities(data || []);
        }
      } catch (err) {
        setError('Failed to fetch entities');
        setEntities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEntities();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profiles</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Explore Public Profiles</h1>
        <p className="text-lg mb-4">Browse businesses and events that are open to the public</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entities.map((entity) => (
          <div key={entity.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">#{entity.slug}</h2>
              <p className="text-gray-600 mb-4">{entity.description}</p>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500">#{entity.type}</span>
                <span className="text-sm font-medium text-gray-500">•</span>
                <span className="text-sm font-medium text-gray-500">{new Date(entity.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="p-6 border-t">
              <Link href={`/e/${entity.slug}`} className="block text-blue-600 hover:text-blue-800 font-medium">
                View Profile
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExplorePage;