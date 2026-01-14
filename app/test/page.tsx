import { getVerifiedConsultants } from '@/lib/supabase'

export default async function TestPage() {
  try {
    const consultants = await getVerifiedConsultants({ limit: 5 })
    
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Supabase Next.js Integration Test</h1>
          
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Connection Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Supabase URL:</span>
                <p className="font-mono text-sm">{process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
              </div>
              <div>
                <span className="text-gray-600">Environment:</span>
                <p className="text-green-600 font-semibold">✅ Connected</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Consultant Data ({consultants.length} found)</h2>
            {consultants.length === 0 ? (
              <p className="text-gray-500">No consultant data found. Please add data to the database.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consultants.map((consultant) => (
                  <div key={consultant.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg">{consultant.name}</h3>
                    <p className="text-gray-600">{consultant.title}</p>
                    <div className="mt-2">
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        ${consultant.hourly_rate}/hour
                      </span>
                      <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                        ⭐ {consultant.rating}
                      </span>
                    </div>
                    {consultant.expertise && consultant.expertise.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Expertise:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {consultant.expertise.map((skill, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded border border-green-200">
                <p className="text-green-800">✅ Supabase Integration Successful!</p>
                <p className="text-sm text-green-600 mt-1">
                  Database connection established. You can start developing application features.
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <p>Next Steps:</p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li>Create consultant listing page</li>
                  <li>Create consultant detail page</li>
                  <li>Implement booking system</li>
                  <li>Integrate wallet connection</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Error</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Supabase Connection Failed</h2>
            <p className="text-red-600">{error instanceof Error ? error.message : 'Unknown error'}</p>
            <div className="mt-4 text-sm text-gray-600">
              <p>Please check:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Environment variables are correctly configured</li>
                <li>Supabase project is running</li>
                <li>Network connection is working</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
