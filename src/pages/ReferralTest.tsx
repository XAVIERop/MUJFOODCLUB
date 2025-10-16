import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReferralCodeInput from '@/components/ReferralCodeInput';
import { ReferralValidation } from '@/services/referralService';

// Test page for referral system - SAFE TESTING ONLY
const ReferralTest = () => {
  const [referralCode, setReferralCode] = useState('');
  const [validation, setValidation] = useState<ReferralValidation | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testReferralCodes = async () => {
    const testCodes = ['TEAM123', 'TEAM002', 'INVALID', 'TEAM003'];
    
    for (const code of testCodes) {
      try {
        const { referralService } = await import('@/services/referralService');
        const result = await referralService.validateReferralCode(code);
        addTestResult(`${code}: ${result.isValid ? '✅ Valid' : '❌ Invalid'} - ${result.teamMemberName || result.error}`);
      } catch (error) {
        addTestResult(`${code}: ❌ Error - ${error}`);
      }
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🧪 Referral System Test Page
            </CardTitle>
            <p className="text-center text-gray-600">
              Safe testing environment - no data will be modified
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Manual Test */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Manual Referral Code Test</h3>
              <ReferralCodeInput
                value={referralCode}
                onChange={setReferralCode}
                onValidation={setValidation}
                placeholder="Enter referral code to test"
                className="w-full"
              />
              {validation && (
                <div className="p-3 rounded-lg bg-gray-100">
                  <p><strong>Validation Result:</strong></p>
                  <p>Valid: {validation.isValid ? '✅ Yes' : '❌ No'}</p>
                  {validation.teamMemberName && <p>Team Member: {validation.teamMemberName}</p>}
                  {validation.error && <p>Error: {validation.error}</p>}
                </div>
              )}
            </div>

            {/* Automated Test */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Automated Test Suite</h3>
              <div className="flex gap-2">
                <Button onClick={testReferralCodes} className="bg-blue-600 hover:bg-blue-700">
                  Run Tests
                </Button>
                <Button onClick={clearResults} variant="outline">
                  Clear Results
                </Button>
              </div>
              
              {testResults.length > 0 && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Test Results:</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {testResults.map((result, index) => (
                      <div key={index} className="text-sm font-mono">
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Test Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Test Instructions:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Try entering "TEAM123" - should show green checkmark</li>
                <li>• Try entering "INVALID" - should show red X</li>
                <li>• Click "Run Tests" to test all codes automatically</li>
                <li>• This page is safe - no data will be modified</li>
              </ul>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReferralTest;
