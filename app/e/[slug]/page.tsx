'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

const EntityProfilePage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [entity, setEntity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntity = async () => {
      try {
        const { data, error } = await supabase
          .from('entities')
          .select('*')
          .eq('slug', slug as string)
          .single();

        if (error) {
          setError(error.message);
          setEntity(null);
        } else {
          setEntity(data);
        }
      } catch (err) {
        setError('Failed to fetch entity');
        setEntity(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchEntity();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">The profile you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">#{entity.slug}</h1>
            <div className="flex items-center space-x-4">
              {entity.is_public ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Public
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                  Private
                </span>
              )}
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                Generate QR
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{entity.name}</h2>
                <p className="text-gray-600 mb-4">{entity.description}</p>
                
                {/* Social Links */}
                {entity.social_links && Object.keys(entity.social_links).length > 0 && (
                  <div className="flex items-center space-x-4 mb-4">
                    {Object.entries(entity.social_links).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                        </svg>
                      </a>
                    ))}
                  </div>
                )}
                
                {/* Payment Info */}
                {entity.payment_info && Object.keys(entity.payment_info).length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Payment Methods</h3>
                    <div className="flex items-center space-x-4">
                      {Object.entries(entity.payment_info).map(([method, info]) => (
                        <div key={method} className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">{method}:</span>
                          <span className="text-sm text-gray-600">{String(info)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Products & Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Product {item}</h3>
                  <p className="text-gray-600 text-sm mb-3">Description for product {item}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">$9.99</span>
                    <Link href={`/p/${item}`} className="text-blue-600 hover:text-blue-800 text-sm">
                      View Details
                    </Link>
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

export default EntityProfilePage;