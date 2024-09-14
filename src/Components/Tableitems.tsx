import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import axios from 'axios';

interface mainItem {
  id: string;
  title: string;
  place: string;
  artist_display: string;
  inscriptions: string;
  start: number;
  end: number;
}

const Tableitems = () => {
  // const [items, setitems] = useState();
  const [val, setval] = useState<mainItem[]>([]);
  const [selectedArtworks, setSelectedArtworks] = useState<mainItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [visible, setvisible] = useState(false);
  const [itemsToSelect, setItemsToSelect] = useState<number>(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  const fetchData = async (page: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}`);
      const data = response.data;
      setval(data.data);
      setTotalRecords(data.pagination.total);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  useEffect(() => {
    const saveditems = localStorage.getItem('selectedArtworks');
    if (saveditems) {
      setSelectedArtworks(JSON.parse(saveditems));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedArtworks', JSON.stringify(selectedArtworks));
  }, [selectedArtworks]);

  const onPageChange = (event: any) => {
    setPage(event.page + 1); 
  };

  const openOverlay = () => {
    setvisible(true);
  };

  const h = (event: React.ChangeEvent<HTMLInputElement>) => {
    setItemsToSelect(Number(event.target.value));
  };

  const handleSelectItems = async () => {
    let selected = [...selectedArtworks];
    let remainingToSelect = itemsToSelect;

    for (let curr = page; remainingToSelect > 0; curr++) {
      const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${curr}`);
      const data = response.data.data;

      const itemsOnPage = data.length;
      const pageselection = Math.min(itemsOnPage, remainingToSelect);

      selected = [...selected, ...data.slice(0, pageselection)];
      remainingToSelect -= pageselection;

      if (remainingToSelect <= 0 || curr >= Math.ceil(totalRecords / 10)) {
        break;
      }
    }

    setSelectedArtworks(selected);
    setvisible(false); 
  };

  const titleHeaderTemplate = () => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span>Title</span>
      <i
        className="pi pi-pencil"
        style={{ fontSize: '16px', marginLeft: '8px', cursor: 'pointer' }}
        onClick={openOverlay}
      />
    </div>
  );

  const handleSelectionChange = (e: { value: mainItem[] }) => {
    setSelectedArtworks(e.value);
  };

  return (
    <div className="card">
      <DataTable
        value={val}
        loading={loading}
        paginator={false}
        rows={10}
        selection={selectedArtworks}
        onSelectionChange={handleSelectionChange}
        dataKey="id"
        selectionMode="multiple" 
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>

        <Column field="title" header={titleHeaderTemplate()}></Column>
        <Column field="place" header="Place"></Column>
        <Column field="artist_display" header="Artist"></Column>
        <Column field="inscriptions" header="Inscriptions"></Column>
        <Column field="start" header=" Start"></Column>
        <Column field="end" header="End"></Column>
      </DataTable>

      <Paginator
        first={(page - 1) * 10}
        rows={10}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
      />

      {visible && (
        <div
          className="overlay-panel"
          ref={overlayRef}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#fff',
            padding: '20px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h3>Select Items</h3>
          <input
            type="number"
            value={itemsToSelect}
            onChange={h}
            placeholder="Enter number of items"
          />
          <button onClick={handleSelectItems}>Submit</button>
        </div>
      )}

     
    </div>
  );
};

export default Tableitems;
