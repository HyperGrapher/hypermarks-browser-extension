import { db } from '@extension/storage';
import { Button, cn } from '@extension/ui';
import React from 'react';

const ExportImport: React.FC = () => {
  // Export data to JSON file
  const handleExport = async () => {
    try {
      const exportData: { [tableName: string]: any[] } = {};

      // Fetch data from all tables
      for (const tableName of db.tables.map((table: any) => table.name)) {
        const tableData = await db.table(tableName).toArray();
        exportData[tableName] = tableData;
      }

      // Convert to JSON Blob
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      // Trigger file download
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `database_export_${new Date().toISOString()}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      alert('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  // Import data from JSON file
  const handleImport = async (file: File) => {
    try {
      const fileContent = await file.text();
      const importData = JSON.parse(fileContent);

      // WARN: Whenever add a new table/field with Date object, add it to the array.
      const dateFields = ['createdAt', 'updatedAt', 'datetime'];

      // Clear existing data
      for (const tableName of db.tables.map(table => table.name)) {
        await db.table(tableName).clear();
      }

      // Populate the database with imported data
      for (const [tableName, records] of Object.entries(importData)) {
        if (db.tables.some(table => table.name === tableName)) {
          const processedRecords = (records as any[]).map(record => {
            // Convert string dates back to Date objects
            dateFields.forEach(field => {
              if (record[field]) {
                record[field] = new Date(record[field]);
              }
            });
            return record;
          });

          await db.table(tableName).bulkAdd(processedRecords);
        }
      }

      alert('Data imported successfully!');
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Failed to import data. Please check the file format.');
    }
  };

  // Handle file input change for importing
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2 className="text-xl font-bold text-center">Export/Import Data</h2>
      <div className="flex justify-between">
        <Button
          className="text-base text-blue-500"
          variant={'link'}
          onClick={handleExport}
          style={{ marginRight: '10px' }}>
          Export Data
        </Button>
        <label
          className={cn(
            'text-blue-500 focus-visible:ring-ring inline-flex items-center justify-center gap-2 whitespace-nowrap',
            'rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1',
            'disabled:pointer-events-none disabled:opacity-50',
            '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 underline-offset-4 hover:underline h-9 px-4 py-2 text-base',
          )}
          htmlFor="import-input"
          style={{ cursor: 'pointer' }}>
          Import Data
        </label>
      </div>
      <input
        type="file"
        id="import-input"
        style={{ display: 'none' }}
        accept="application/json"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ExportImport;
