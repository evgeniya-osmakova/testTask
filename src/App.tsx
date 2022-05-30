import './App.css';
import { useEffect, useState } from 'react';
import { getItems } from './api/items';
import { Item } from './models/models';
import useRequest from './hooks/useRequest';

function App() {
  const { data, loading, error, refetch } = useRequest(getItems, 10000);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] =useState<null | {label: string, id: number, parentId: number | null}>(null);

  useEffect(() => {
    if (data) {
      setItems(data);
    }
  }, [data])

  if (error && !loading) {
    return <div>Ошибка при загрузке данных</div>
  }

  return <main>
    <div className="flex-container">
      <div className="block">
        {!data && loading && <p>...loading</p>}
      </div>
      <div className="block">
        {selectedItem && <>
          <div>{selectedItem.label}</div>
          <div>{selectedItem.id}</div>
          <div>{selectedItem.parentId}</div>
        </>
        }
      </div>
    </div>
    <div className="flex-container btns-section">
      <button className="btn" disabled={loading} onClick={refetch}>Refresh</button>
      <button className="btn" disabled={loading}>Remove</button>
    </div>
  </main>;
}

export default App;
