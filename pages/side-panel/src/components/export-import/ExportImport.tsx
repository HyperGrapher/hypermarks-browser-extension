import { db } from '@extension/storage';
import { Button, cn } from '@extension/ui';
import React, { useState } from 'react';
import { CheckCircle2Icon } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

const ExportImport: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(true);
  const [type, setType] = useState<string | undefined>(undefined);
  const count = useLiveQuery(async () => await db.marks?.count(), []);

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

      setIsLoaded(true);
      setType('export');

      // alert('Data exported successfully!');
    } catch (error) {
      setIsLoaded(false);
      setType('export');
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
      const dateFields = ['createdAt', 'updatedAt', 'datetime', 'joinedDate'];

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
                const date = new Date(record[field]);
                record[field] = isNaN(date.getTime()) ? new Date(0) : date;
              }
            });
            return record;
          });

          await db.table(tableName).bulkAdd(processedRecords);
        }
      }

      // setIsLoaded(true)
      // setType('import');

      alert('Data imported successfully!');
    } catch (error) {
      console.error('Error importing data:', error);
      setIsLoaded(false);
      setType('import');
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
      <div className="">{type && <Success type={type} success={isLoaded} />}</div>
    </div>
  );
};

export default ExportImport;

const Success = ({ success, type = 'export' }: { success: boolean; type: string | undefined }) => {
  return success ? (
    <div className="mt-6 px-2 w-full">
      <div className="px-2 py-4 rounded-lg w-full text-center bg-green-800/20 border border-green-500/30 ">
        <h3 className="font-bold text-base text-green-200/80">Database {type} is successfull</h3>
        {type === 'import' && <p className="px-2">Data will load in a few seconds</p>}
        <CheckCircle2Icon size={36} className="text-center mx-auto mt-2 text-green-400" />
      </div>
    </div>
  ) : (
    <div className="mt-6 px-2 w-full">
      <div className="px-2 py-4 rounded-lg w-full text-center bg-red-800/20 border border-red-500/30 ">
        <h3 className="font-bold text-base text-red-200/80">Database {type} is failed!</h3>
      </div>
    </div>
  );
};
