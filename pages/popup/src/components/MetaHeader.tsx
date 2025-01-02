import { SiteMeta } from '@extension/shared';
import React from 'react';

export const MetaHeader = ({ meta }: { meta: SiteMeta | undefined }) => {
  return (
    <header className="mb-2">
      <h2 className="text-sm font-semibold text-slate-400">{meta?.title.slice(0, 70)}</h2>
      <small className="text-slate-400">{meta?.origin}</small>
    </header>
  );
};
