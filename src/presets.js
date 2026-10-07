// Presets for quick 2D array generation and testing

export const PRESETS = [
  {
    id: 'sales-matrix',
    name: 'Quarterly Sales Matrix',
    description: 'Regional quarterly revenue and performance metrics',
    headers: ['Region', 'Q1 Revenue ($)', 'Q2 Revenue ($)', 'Q3 Revenue ($)', 'Q4 Revenue ($)'],
    rows: [
      ['North America', '145000', '168000', '192000', '210000'],
      ['Europe', '98000', '112000', '125000', '140000'],
      ['Asia Pacific', '185000', '210000', '245000', '290000'],
      ['Latin America', '42000', '49000', '58000', '65000'],
      ['Middle East', '63000', '71000', '82000', '94000']
    ]
  },
  {
    id: 'student-grades',
    name: 'Student Academic Grade Sheet',
    description: 'Student test scores across key subjects',
    headers: ['Student Name', 'Mathematics', 'Physics', 'Chemistry', 'Computer Science'],
    rows: [
      ['Emma Watson', '95', '92', '88', '99'],
      ['Liam Johnson', '84', '89', '76', '91'],
      ['Sophia Chen', '98', '96', '94', '97'],
      ['Noah Davis', '78', '82', '85', '88']
    ]
  },
  {
    id: 'inventory-stock',
    name: 'Warehouse Inventory Matrix',
    description: 'Stock levels, reorder threshold, and unit pricing',
    headers: ['Item SKU', 'Product Name', 'Category', 'Stock Qty', 'Unit Price ($)'],
    rows: [
      ['SKU-1001', 'Wireless Mouse', 'Electronics', '150', '29.99'],
      ['SKU-1002', 'Mechanical Keyboard', 'Electronics', '85', '89.50'],
      ['SKU-1003', 'USB-C Docking Hub', 'Accessories', '42', '59.00'],
      ['SKU-1004', '4K Monitor 27"', 'Displays', '28', '299.00']
    ]
  },
  {
    id: 'math-coordinate',
    name: '3x3 Mathematical Matrix',
    description: 'Standard 3x3 numeric matrix',
    headers: ['Col A', 'Col B', 'Col C'],
    rows: [
      ['12', '7', '3'],
      ['4', '5', '6'],
      ['7', '8', '9']
    ]
  }
];

export const createEmptyMatrix = (rowCount = 3, colCount = 3, title = 'New 2D Array Dataset') => {
  const headers = Array.from({ length: colCount }, (_, i) => `Column ${i + 1}`);
  const rows = Array.from({ length: rowCount }, () => Array.from({ length: colCount }, () => ''));
  return {
    id: `matrix-${Date.now()}`,
    title,
    description: 'Interactive 2-dimensional array data',
    headers,
    rows
  };
};

export const getPresetWithNewId = (preset) => {
  return {
    ...preset,
    id: `matrix-${Date.now()}`,
    headers: [...preset.headers],
    rows: preset.rows.map(r => [...r])
  };
};

