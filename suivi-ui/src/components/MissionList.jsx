import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const MissionList = () => {
  const [missions, setMissions] = useState([]);
  const [carList, setCarList] = useState([]);
  const [driverList, setDriverList] = useState([]);
 const [filters, setFilters] = useState({
  order: '',
  car: '',
  driver: '',
  date: '',
  retour: '',
  vehicleType: '',
  zone: ''  // ✅ NEW
});

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRetour, setSelectedRetour] = useState(null);
  const [monthOnlyDate, setMonthOnlyDate] = useState(null);
  const [yearOnlyDate, setYearOnlyDate] = useState(null);
  const [monthOnlyRetour, setMonthOnlyRetour] = useState(null);
  const [yearOnlyRetour, setYearOnlyRetour] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedMission, setEditedMission] = useState({});

  const formatDate = (date, type) => {
    if (!date) return '';
    const d = new Date(date);
    if (type === 'year') return `${d.getFullYear()}`;
    if (type === 'month') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const fetchMissions = async () => {
    try {
      const query = new URLSearchParams();
      if (filters.order) query.append('order', filters.order);
      if (filters.car) query.append('car', filters.car);
      if (filters.vehicleType) query.append('vehicleType', filters.vehicleType);
      if (filters.driver) query.append('driver', filters.driver);
      if (filters.zone) query.append('zone', filters.zone); // ✅ Add this line
      if (filters.date) query.append('date', filters.date);
      if (filters.retour) query.append('retour', filters.retour);
      const res = await axios.get(`http://localhost:3000/api/missions?${query.toString()}`);
      setMissions(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch missions:', err);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [cars, drivers] = await Promise.all([
        axios.get('http://localhost:3000/api/missions/cars/ids'),
        axios.get('http://localhost:3000/api/missions/drivers/names'),
      ]);
      setCarList(cars.data);
      setDriverList(drivers.data);
    } catch (err) {
      console.error('❌ Failed to fetch dropdowns:', err);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, [filters]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  const resetFilters = () => {
  setFilters({
    order: '',
    car: '',
    driver: '',
    date: '',
    retour: '',
    vehicleType: '',
    zone: ''
  });
  setSelectedDate(null);
  setMonthOnlyDate(null);
  setYearOnlyDate(null);
  setSelectedRetour(null);
  setMonthOnlyRetour(null);
  setYearOnlyRetour(null);
};


  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this mission?')) {
      try {
        await axios.delete(`http://localhost:3000/api/missions/${id}`);
        await fetchMissions();
      } catch (err) {
        console.error('❌ Failed to delete mission:', err);
        alert('Failed to delete mission');
      }
    }
  };

const handleEdit = (mission) => {
  const updatedMission = {
    ...mission,
    missionType: Array.isArray(mission.missionType) ? mission.missionType : [],
    vehicleType: mission.vehicleType || 'véhicule',
  };

  // 🚫 Force 'lieu' to be '—' if missionZone is 'zone OCP'
  if (mission.missionZone === 'zone OCP') {
    updatedMission.lieu = '—';
  }

  setEditingId(mission._id);
  setEditedMission(updatedMission);
};
// ✅ <— add this brace



  const handleChange = (key, value) => {
    setEditedMission(prev => ({ ...prev, [key]: value }));
  };
const handleMissionTypeChange = (type) => {
  setEditedMission(prev => {
    const current = Array.isArray(prev.missionType) ? prev.missionType : [];
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    return { ...prev, missionType: updated };
  });
};


const submitEdit = async () => {
const depart = Number(editedMission.kmDepart);
const retour = Number(editedMission.kmRetour);

// Validation: KM logic
if (!isNaN(depart) && !isNaN(retour) && retour <= depart) {
  alert('❌ Km Retour must be greater than Km Depart');
  return;
}

// Validation: Lieu must be filled if zone is 'hors OCP'
if (editedMission.missionZone === 'hors OCP' && (!editedMission.lieu || editedMission.lieu.trim() === '')) {
  alert('❌ "Lieu" is required when zone is "hors OCP"');
  return;
}


  try {
    await axios.patch(`http://localhost:3000/api/missions/${editingId}`, editedMission);
    setEditingId(null);
    setEditedMission({});
    fetchMissions();
    alert('✅ Mission updated');
  } catch (err) {
    console.error('❌ Failed to update mission:', err);
    alert('❌ Failed to update mission');
  }
};


  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">📋 All Missions</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <input type="text" placeholder="Search by Order" value={filters.order} onChange={(e) => updateFilter('order', e.target.value)} className="border px-2 py-1" />
        <select value={filters.car} onChange={(e) => updateFilter('car', e.target.value)} className="border px-2 py-1">
          <option value="">All Cars</option>
          {carList.map((car) => <option key={car} value={car}>{car}</option>)}
        </select>
        <select value={filters.driver} onChange={(e) => updateFilter('driver', e.target.value)} className="border px-2 py-1">
          <option value="">All Drivers</option>
          {driverList.map((driver) => <option key={driver} value={driver}>{driver}</option>)}
        </select>
<select
  value={filters.vehicleType}
  onChange={(e) => updateFilter('vehicleType', e.target.value)}
  className="border px-2 py-1"
>
  <option value="">All Types</option>
  <option value="véhicule">Véhicule</option>
  <option value="camion">Camion</option>
  <option value="ambulance">Ambulance</option>
</select>
<button
  onClick={resetFilters}
  className="bg-gray-200 px-3 py-1 border rounded hover:bg-gray-300"
>
  Reset Filters
</button>

<select
  value={filters.zone}
  onChange={(e) => updateFilter('zone', e.target.value)}
  className="border px-2 py-1"
>
  <option value="">All Zones</option>
  <option value="zone OCP">zone OCP</option>
  <option value="hors OCP">hors OCP</option>
</select>



        {/* Date depart */}
        <div>
          <label className="block text-xs">📅 Date de départ:</label>
          <DatePicker selected={selectedDate} onChange={(d) => { setSelectedDate(d); updateFilter('date', formatDate(d, 'day')); }} dateFormat="yyyy-MM-dd" placeholderText="Day" className="border px-2 py-1" isClearable />
          <DatePicker selected={monthOnlyDate} onChange={(d) => { setMonthOnlyDate(d); updateFilter('date', formatDate(d, 'month')); }} dateFormat="MM/yyyy" showMonthYearPicker placeholderText="Month" className="border px-2 py-1 mt-1" isClearable />
          <DatePicker selected={yearOnlyDate} onChange={(d) => { setYearOnlyDate(d); updateFilter('date', formatDate(d, 'year')); }} showYearPicker dateFormat="yyyy" placeholderText="Year" className="border px-2 py-1 mt-1" isClearable />
        </div>

        {/* Date retour */}
        <div>
          <label className="block text-xs">📅 Date de retour:</label>
          <DatePicker selected={selectedRetour} onChange={(d) => { setSelectedRetour(d); updateFilter('retour', formatDate(d, 'day')); }} dateFormat="yyyy-MM-dd" placeholderText="Day" className="border px-2 py-1" isClearable />
          <DatePicker selected={monthOnlyRetour} onChange={(d) => { setMonthOnlyRetour(d); updateFilter('retour', formatDate(d, 'month')); }} dateFormat="MM/yyyy" showMonthYearPicker placeholderText="Month" className="border px-2 py-1 mt-1" isClearable />
          <DatePicker selected={yearOnlyRetour} onChange={(d) => { setYearOnlyRetour(d); updateFilter('retour', formatDate(d, 'year')); }} showYearPicker dateFormat="yyyy" placeholderText="Year" className="border px-2 py-1 mt-1" isClearable />
        </div>
      </div>
<div className="overflow-x-auto">
  
</div>
      <table className="w-full border text-sm" id="missions-table">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">#</th>
            <th className="border px-2 py-1">Order</th>
            <th className="border px-2 py-1">Car</th>
            <th className="border px-2 py-1">Type</th> 
            <th className="border px-2 py-1">Driver</th>
            <th className="border px-2 py-1">Mission Type</th>
            <th className="border px-2 py-1">Zone</th>
            <th className="border px-2 py-1">Lieu</th>
            <th className="border px-2 py-1">SA</th>
            <th className="border px-2 py-1">Km Depart</th>
            <th className="border px-2 py-1">Km Retour</th>
            <th className="border px-2 py-1">Heure Depart</th>
            <th className="border px-2 py-1">Heure Retour</th>
            <th className="border px-2 py-1">Date Depart</th>
            <th className="border px-2 py-1">Date Retour</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Duration</th>
            <th className="border px-2 py-1">Actions</th>
            <th className="border px-2 py-1">PDF</th>
          </tr>
        </thead>
        <tbody>
          {missions.map((m, i) => (
            <tr key={m._id} className="bg-white">
              <td className="border px-2 py-1">{i + 1}</td>
              <td className="border px-2 py-1">{m.orderNumber}</td>
<td className="border px-2 py-1">{m.carId}</td>

<td className="border px-2 py-1">{m.vehicleType || '—'}</td>


    <td className="border px-2 py-1">{m.driverName}</td>

             <td className="border px-2 py-1">
  {editingId === m._id ? (
    <div className="grid grid-cols-2 gap-1">
      {['courrier', 'personnel', 'matériel', 'malades'].map(type => (
        <label key={type} className="block">
          <input
            type="checkbox"
            checked={editedMission.missionType?.includes(type)}
            onChange={() => handleMissionTypeChange(type)}
            className="mr-1"
          />
          {type}
        </label>
      ))}
    </div>
  ) : (
    Array.isArray(m.missionType) ? m.missionType.join(', ') : ''
  )}
</td>

<td className="border px-2 py-1">
  {editingId === m._id ? (
<select
  value={editedMission.missionZone || ''}
  onChange={(e) => {
    const selectedZone = e.target.value;
    handleChange('missionZone', selectedZone);
    if (selectedZone === 'zone OCP') {
      handleChange('lieu', '—'); // auto fill lieu
    } else if (selectedZone === 'hors OCP') {
      handleChange('lieu', ''); // require user to input
    }
  }}
>
  <option value="zone OCP">zone OCP</option>
  <option value="hors OCP">hors OCP</option>
</select>

  ) : m.missionZone}
</td>
<td className="border px-2 py-1">
  {editingId === m._id ? (
    <input
      type="text"
      value={
        editedMission.missionZone === 'zone OCP' || editedMission.missionZone === 'zone_ocp'
          ? '—'
          : (editedMission.lieu || '')
      }
      readOnly={
        editedMission.missionZone === 'zone OCP' || editedMission.missionZone === 'zone_ocp'
      }
      onChange={(e) => handleChange('lieu', e.target.value)}
      placeholder={
        editedMission.missionZone === 'zone OCP' || editedMission.missionZone === 'zone_ocp'
          ? '—'
          : 'Enter location'
      }
      className={`border px-1 ${
        editedMission.missionZone === 'zone OCP' || editedMission.missionZone === 'zone_ocp'
          ? 'text-gray-400 italic bg-gray-100 cursor-not-allowed'
          : ''
      }`}
    />
  ) : m.missionZone === 'zone OCP' || m.missionZone === 'zone_ocp' ? '—' : (m.lieu || '—')}
</td>





<td className="border px-2 py-1 space-x-2 text-center whitespace-nowrap">

  {editingId === m._id ? (
    <input
      type="text"
      value={editedMission.sa || ''}
      onChange={(e) => handleChange('sa', e.target.value)}
    />
  ) : m.sa}
</td>

<td className="border px-2 py-1 space-x-2 text-center whitespace-nowrap">
{m.kmDepart}</td>

<td className="border px-2 py-1 space-x-2 text-center whitespace-nowrap">
  {editingId === m._id ? (
    <span>{editedMission.kmRetour || '—'}</span>
  ) : (
    m.kmRetour ?? '—'
  )}
</td>

<td className="border px-2 py-1 space-x-2 text-center whitespace-nowrap">

                {editingId === m._id ? (
                  <input type="time" value={editedMission.heureDepart || ''} onChange={(e) => handleChange('heureDepart', e.target.value)} />
                ) : m.heureDepart}
              </td>
              
             <td className="border px-2 py-1 space-x-2 text-center whitespace-nowrap">

                {editingId === m._id ? (
                  <input type="time" value={editedMission.heureRetour || ''} onChange={(e) => handleChange('heureRetour', e.target.value)} />
                ) : m.heureRetour ?? '—'}
              </td>
            <td className="border px-2 py-1 space-x-2 text-center whitespace-nowrap">

                {editingId === m._id ? (
                  <input type="date" value={editedMission.dateDepart || ''} onChange={(e) => handleChange('dateDepart', e.target.value)} />
                ) : m.dateDepart}
              </td>
          <td className="border px-2 py-1 space-x-2 text-center whitespace-nowrap">

                {editingId === m._id ? (
                  <input type="date" value={editedMission.dateRetour || ''} onChange={(e) => handleChange('dateRetour', e.target.value)} />
                ) : m.dateRetour ?? '—'}
              </td>
           <td className="border px-2 py-1 space-x-2 text-center whitespace-nowrap">
{m.status}</td>
<td className="border px-2 py-1 space-x-2 text-center whitespace-nowrap">

  {m.durationHours !== undefined
    ? `${Math.floor(m.durationHours)} h ${Math.round((m.durationHours % 1) * 60)} min`
    : '—'}
</td>
<td className="border px-2 py-1 space-x-2 text-center whitespace-nowrap">

                {editingId === m._id ? (
                  <>
                    <button onClick={submitEdit} className="text-green-600 hover:underline">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-gray-600 hover:underline">Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(m)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(m._id)} className="text-red-600 hover:underline">Delete</button>
                  </>
                )}
              </td>
             <td className="border px-2 py-1 space-x-2 text-center whitespace-nowrap">

                <a href={`http://localhost:3000/api/missions/${m._id}/report`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">PDF</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MissionList;
