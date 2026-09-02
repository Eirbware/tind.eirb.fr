import React from 'react';
import FillotItem from './FillotItem';
import { Fillot } from '../../views/ParrainView';

interface FillotListProps {
  filteredFillots: Fillot[];
  user: any;
  activeFillot: Fillot | null;
  setActiveFillot: (fillot: Fillot | null) => void;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  getFilliere: (fillot: Fillot) => string;
}

const FillotList: React.FC<FillotListProps> = React.memo(({
  filteredFillots,
  user,
  activeFillot,
  setActiveFillot,
  addFavorite,
  removeFavorite,
  getFilliere,
}) => {
  return (
    <div className='overflow-y-scroll m-2 mr-0 pr-1 h-full'>
      {filteredFillots.map(fillot => (
        <FillotItem
          key={fillot.id}
          fillot={fillot}
          user={user}
          activeFillot={activeFillot}
          setActiveFillot={setActiveFillot}
          addFavorite={addFavorite}
          removeFavorite={removeFavorite}
          getFilliere={getFilliere}
        />
      ))}
    </div>
  );
});

export default FillotList;
