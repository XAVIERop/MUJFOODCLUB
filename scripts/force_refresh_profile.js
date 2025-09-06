// Force Refresh Profile Data for test@muj.manipal.edu
// Run this in browser console after running the SQL reset script

// Method 1: Force refresh by calling the refreshProfile function
// (This only works if you're logged in as the test user)

console.log('🔄 Force refreshing profile data...');

// Check if we're on the right page and logged in
if (window.location.hostname === 'mujfoodclub.in' || window.location.hostname === 'localhost') {
  // Try to access the auth context and refresh profile
  try {
    // This will work if you're on a page that uses useAuth
    const event = new CustomEvent('forceProfileRefresh');
    window.dispatchEvent(event);
    console.log('✅ Profile refresh event dispatched');
  } catch (error) {
    console.log('❌ Could not dispatch refresh event:', error);
  }
} else {
  console.log('❌ Please run this script on mujfoodclub.in');
}

// Method 2: Manual profile data refresh
// This will work regardless of the current page

async function manualProfileRefresh() {
  try {
    console.log('🔄 Manually refreshing profile data...');
    
    // Get the current user from localStorage or session
    const sessionData = localStorage.getItem('sb-kblazvxfducwviyyiwde-auth-token');
    if (!sessionData) {
      console.log('❌ No session found. Please log in first.');
      return;
    }
    
    const session = JSON.parse(sessionData);
    const userId = session?.user?.id;
    
    if (!userId) {
      console.log('❌ No user ID found in session.');
      return;
    }
    
    console.log('🔍 Found user ID:', userId);
    
    // Make a direct API call to refresh profile
    const response = await fetch('https://kblazvxfducwviyyiwde.supabase.co/rest/v1/profiles', {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGF6dnhmZHVjd3ZpeXlpd2RlIiwicnNlIjoiYW5vbiIsImlhdCI6MTc1NjEzMjQ2OCwiZXhwIjoyMDcxNzA4NDY4fQ.bMtHsQy5cdkF-7ClprpF7HgMKUJpBUuZPaAPNz_LRSA',
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const profileData = await response.json();
      console.log('✅ Profile data refreshed:', profileData);
      
      // Force a page reload to update the UI
      console.log('🔄 Reloading page to update UI...');
      window.location.reload();
    } else {
      console.log('❌ Failed to refresh profile:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.log('❌ Error refreshing profile:', error);
  }
}

// Run the manual refresh
manualProfileRefresh();

console.log('📋 Instructions:');
console.log('1. Make sure you are logged in as test@muj.manipal.edu');
console.log('2. Run the SQL reset script in Supabase');
console.log('3. Run this script in browser console');
console.log('4. The page should reload with updated data');
