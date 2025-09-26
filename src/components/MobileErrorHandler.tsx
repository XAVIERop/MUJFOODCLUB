import React, { useEffect, useState } from 'react';

interface MobileErrorHandlerProps {
  children: React.ReactNode;
}

const MobileErrorHandler: React.FC<MobileErrorHandlerProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string>('');

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Mobile Error Handler caught:', event.error);
      setErrorInfo(`Error: ${event.error?.message || 'Unknown error'}`);
      setHasError(true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Mobile Error Handler caught promise rejection:', event.reason);
      setErrorInfo(`Promise Error: ${event.reason?.message || 'Unknown promise error'}`);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pb-24 lg:pb-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Mobile App Error
            </h1>
            <p className="text-gray-600 mb-4">
              Something went wrong on mobile. Here's what we found:
            </p>
            <div className="bg-gray-100 p-3 rounded text-sm text-left mb-4">
              <code className="text-red-600">{errorInfo}</code>
            </div>
            <button
              onClick={() => {
                setHasError(false);
                setErrorInfo('');
                window.location.reload();
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MobileErrorHandler;
