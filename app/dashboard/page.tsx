'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

const DashboardPage = () => {
  const router = useRouter();
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const { data, error } = await supabase
          .from('entities')
          .select('*')
          .eq('owner_id', router.query.userId)
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
          <p className="text-gray-600">Loading your profiles...</p>
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">My Profiles</h1>
            <div className="flex items-center space-x-4">
              <Link href="/explore" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Explore Public Profiles
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Profiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entities.map((entity) => (
                <div key={entity.id} className="bg-gray-50 rounded-lg p-4 shadow-md">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{entity.slug}</h2>
                      <p className="text-gray-600 mb-2">{entity.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">#{entity.type}</span>
                        <span className="text-sm font-medium text-gray-500">•</span>
                        <span className="text-sm font-medium text-gray-500">{new Date(entity.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t">
                    <div className="flex items-center space-x-2">
                      {entity.is_public ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          Public
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                          Private
                        </span>
                      )}
                      <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition" onClick={() => {
                        // Toggle visibility logic
                        const updatedEntity = { ...entity, is_public: !entity.is_public };
                        supabase
                          .from('entities')
                          .update(updatedEntity)
                          .eq('id', entity.id)
                          .single()
                          .then(() => {
                            setEntities(prev => prev.map(e => e.id === entity.id ? updatedEntity : e));
                          });
                      }}>
                        Toggle Visibility
                      </button>
                      <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition" onClick={() => router.push(`/e/${entity.slug}`)}>
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;