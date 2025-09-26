import React from 'react';
import { EnhancedCafeCard } from './EnhancedCafeCard';

// Sample Dialog cafe data for demo
const sampleDialogCafe = {
  id: 'dialog-cafe-id',
  name: 'Dialog',
  type: 'Multi Cuisine',
  description: 'A modern cafe offering a variety of cuisines with a cozy atmosphere.',
  location: 'B1 Ground Floor',
  phone: '+91-9876543210',
  hours: '11:00 AM - 2:00 AM',
  accepting_orders: true,
  average_rating: 4.2,
  total_ratings: 156,
  cuisine_categories: ['Indian', 'Chinese', 'Continental']
};

export const EnhancedCafeCardDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-24 lg:pb-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enhanced Cafe Card Demo
          </h1>
          <p className="text-gray-600">
            Swiggy-style design for Dialog cafe - Beta 1.3 Preview
          </p>
        </div>

        {/* Demo Card */}
        <div className="max-w-md mx-auto">
          <EnhancedCafeCard cafe={sampleDialogCafe} />
        </div>

        {/* Features List */}
        <div className="max-w-2xl mx-auto mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            New Features in Enhanced Design
          </h2>
          
          <div className="grid gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">🎨 Visual Improvements</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Large cafe image with overlay text</li>
                <li>• Cafe name and rating prominently displayed</li>
                <li>• Professional Swiggy-style layout</li>
                <li>• Better visual hierarchy and spacing</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">📱 Enhanced Information</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cost for two prominently displayed</li>
                <li>• Location (B1 Ground Floor) clearly shown</li>
                <li>• Timing information with icon</li>
                <li>• Open/Closed status badge</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">🔧 Maintained Functionality</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Same 4 action buttons (Order, View Menu, Call, WhatsApp)</li>
                <li>• Rating system unchanged</li>
                <li>• All existing features preserved</li>
                <li>• Same navigation and interactions</li>
              </ul>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mt-8 text-center">
            <h3 className="font-semibold text-orange-900 mb-2">🚀 Next Steps</h3>
            <p className="text-orange-800 text-sm">
              If you like this design, we can apply it to all cafe cards throughout the app!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
