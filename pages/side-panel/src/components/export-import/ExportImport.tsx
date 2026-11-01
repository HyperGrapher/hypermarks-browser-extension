import { db, importDatabase } from '@extension/storage';
import type { ImportMode, ImportResult } from '@extension/storage';
import { Button, cn } from '@extension/ui';
import React, { useState } from 'react';
import { CheckCircle2Icon } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

const ExportImport: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(true);
  const [type, setType] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<ImportResult | undefined>(undefined);
  // The file the user picked, waiting for a merge/replace decision
  const [pendingFile, setPendingFile] = useState<File | undefined>(undefined);
  const [mode, setMode] = useState<ImportMode>('merge');
  const [importing, setImporting] = useState(false);
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
      setResult(undefined);

      // alert('Data exported successfully!');
    } catch (error) {
      setIsLoaded(false);
      setType('export');
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  // Import data from the picked JSON file, either merged into or replacing the current data
  const handleImport = async () => {
    if (!pendingFile) return;
    setImporting(true);
    try {
      const importData = JSON.parse(await pendingFile.text());
      const importResult = await importDatabase(importData, mode);

      setResult(importResult);
      setIsLoaded(true);
      setType('import');
    } catch (error) {
      console.error('Error importing data:', error);
      setResult(undefined);
      setIsLoaded(false);
      setType('import');
      alert('Failed to import data. Please check the file format.');
    } finally {
      setPendingFile(undefined);
      setImporting(false);
    }
  };

  // Picking a file only stages it, the user then chooses merge or replace
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setMode('merge');
      setType(undefined);
    }
    // Allows picking the same file again later
    event.target.value = '';
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
      {pendingFile && (
        <div className="mt-4 rounded-lg border border-zinc-300/20 bg-slate-900/50 p-3 text-sm">
          <p className="truncate font-medium" title={pendingFile.name}>
            {pendingFile.name}
          </p>
          <p className="mb-3 text-xs text-zinc-400">How should this file be imported?</p>

          <ImportOption
            checked={mode === 'merge'}
            onSelect={() => setMode('merge')}
            title="Merge with current data"
            description="Keeps what you have and adds the file's items. Items with a url you already saved are skipped."
          />
          <ImportOption
            checked={mode === 'replace'}
            onSelect={() => setMode('replace')}
            title="Replace current data"
            description={`Deletes all ${count ?? 0} current items first, then loads the file.`}
          />
          {mode === 'replace' && (
            <p className="mt-2 text-xs text-red-400">This can't be undone. Export your data first if unsure.</p>
          )}

          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={importing}
              className="shrink"
              onClick={() => setPendingFile(undefined)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={importing}
              className="w-full grow"
              variant={mode === 'replace' ? 'destructive' : 'default'}
              onClick={handleImport}>
              {mode === 'replace' ? 'Replace and import' : 'Merge and import'}
            </Button>
          </div>
        </div>
      )}

      <div className="">{type && <Success type={type} success={isLoaded} result={result} />}</div>
    </div>
  );
};

export default ExportImport;

const ImportOption = ({
  checked,
  onSelect,
  title,
  description,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  description: string;
}) => (
  <label
    className={cn(
      'mb-2 flex cursor-pointer items-start gap-2 rounded-md border p-2',
      checked ? 'border-blue-500/60 bg-blue-500/10' : 'border-zinc-300/20',
    )}>
    <input type="radio" name="import-mode" className="mt-1" checked={checked} onChange={onSelect} />
    <span>
      <span className="block font-medium">{title}</span>
      <span className="block text-xs text-zinc-400">{description}</span>
    </span>
  </label>
);

const Success = ({
  success,
  type = 'export',
  result,
}: {
  success: boolean;
  type: string | undefined;
  result?: ImportResult;
}) => {
  return success ? (
    <div className="mt-6 px-2 w-full">
      <div className="px-2 py-4 rounded-lg w-full text-center bg-green-800/20 border border-green-500/30 ">
        <h3 className="font-bold text-base text-green-200/80">Database {type} is successfull</h3>
        {type === 'import' && result && (
          <p className="px-2">
            {result.items} item{result.items === 1 ? '' : 's'} imported
            {result.skippedDuplicates > 0 && `, ${result.skippedDuplicates} already saved (skipped)`}
          </p>
        )}
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
