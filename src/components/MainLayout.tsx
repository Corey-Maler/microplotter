// import { MapRenderer } from '@/MapRender/React';
import './MainLayout.css';
import { PerfDisplay } from './Perf';

import { DraftingTable } from './DraftingTable';

export const MainLayout = () => {
  return (
    <div className="main-layout">
      <div className="left-panel">
        <div className="osm-query">
          <PerfDisplay />
        </div>
      </div>
      <div className="map-wrapper">
        <DraftingTable />
      </div>
    </div>
  );
};
