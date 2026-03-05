import { FC } from 'react';
import { useRequestStore } from '../../application/stores/requestStore';
import { RequestTab } from '../../domain/types';

const TABS: RequestTab[] = ['PARAMS', 'HEADERS', 'BODY', 'AUTH'];

export const TabBar: FC = () => {
  const { requestTab, setRequestTab } = useRequestStore();
  
  return (
    <div className="panel-tabs">
      {TABS.map((tab) => (
        <div
          key={tab}
          className={`panel-tab${requestTab === tab ? ' active' : ''}`}
          onClick={() => setRequestTab(tab)}
        >
          {tab}
        </div>
      ))}
    </div>
  );
};
