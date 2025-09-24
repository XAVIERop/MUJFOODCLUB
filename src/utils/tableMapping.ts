// Cafe-specific table number mapping
// This maps cafe names to their available table numbers

export const getTableOptions = (cafeName: string): number[] => {
  console.log('🔍 TableMapping: Received cafe name:', cafeName);
  
  // Cafe name to table range mapping (case-insensitive)
  const tableRanges: { [key: string]: number[] } = {
    // Cook House: Tables 1-13
    'cook house': Array.from({ length: 13 }, (_, i) => i + 1),
    'COOK HOUSE': Array.from({ length: 13 }, (_, i) => i + 1),
    'Cook House': Array.from({ length: 13 }, (_, i) => i + 1),
    
    // Food Court: Tables 1-8  
    'food court': Array.from({ length: 8 }, (_, i) => i + 1),
    'FOOD COURT': Array.from({ length: 8 }, (_, i) => i + 1),
    'Food Court': Array.from({ length: 8 }, (_, i) => i + 1),
    
    // Chatkara: Tables 1-12
    'chatkara': Array.from({ length: 12 }, (_, i) => i + 1),
    'CHATKARA': Array.from({ length: 12 }, (_, i) => i + 1),
    'Chatkara': Array.from({ length: 12 }, (_, i) => i + 1),
    
    // Punjabi Tadka: Tables 1-12
    'punjabi tadka': Array.from({ length: 12 }, (_, i) => i + 1),
    'PUNJABI TADKA': Array.from({ length: 12 }, (_, i) => i + 1),
    'Punjabi Tadka': Array.from({ length: 12 }, (_, i) => i + 1),
    
    // Munch Box: Tables 1-12
    'munch box': Array.from({ length: 12 }, (_, i) => i + 1),
    'MUNCH BOX': Array.from({ length: 12 }, (_, i) => i + 1),
    'Munch Box': Array.from({ length: 12 }, (_, i) => i + 1),
  };

  const result = tableRanges[cafeName] || [];
  console.log('🔍 TableMapping: Available keys:', Object.keys(tableRanges));
  console.log('🔍 TableMapping: Result for', cafeName, ':', result);
  
  return result;
};

// Helper function to get table options for a cafe
export const getCafeTableOptions = (cafeId: string): { value: string; label: string }[] => {
  const tables = getTableOptions(cafeId);
  return tables.map(table => ({
    value: table.toString(),
    label: `Table ${table}`
  }));
};
