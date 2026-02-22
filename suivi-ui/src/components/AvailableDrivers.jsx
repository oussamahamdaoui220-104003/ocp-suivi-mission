import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AvailableDrivers = () => {
const [hoursFilter, setHoursFilter] = useState('all');

  const [drivers, setDrivers] = useState([]);
  const [driverStats, setDriverStats] = useState({});
useEffect(() => {
  const fetchDriverStats = async () => {
    try {
const today = new Date().toISOString().split('T')[0];
const res = await axios.get(`http://localhost:3000/api/missions/report/summary?start=2020-01-01&end=${today}`);

      setDriverStats(res.data.drivers || {});
    } catch (err) {
      console.error('❌ Failed to fetch driver stats', err);
    }
  };

  fetchDriverStats();
}, []);

  const [nameSearch, setNameSearch] = useState('');
  const [permitFilter, setPermitFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const resetFilters = () => {
  setNameSearch('');
  setPermitFilter('');
  setStatusFilter('');
  setMissionFilter('none');
  setHoursFilter('none');

};


const [newDriver, setNewDriver] = useState({ name: '', permitType: 'B' });

  const [editingId, setEditingId] = useState(null);
  const [editedDriver, setEditedDriver] = useState({ name: '', permit: 'B' });
const [missionFilter, setMissionFilter] = useState('none');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/drivers');
      setDrivers(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch drivers:', err);
    }
  };

const handleSearchAndFilter = () => {
  let filtered = drivers.filter(d =>
    d.name.toLowerCase().includes(nameSearch.toLowerCase()) &&
    (!permitFilter || d.permitType.includes(permitFilter)) &&
    (!statusFilter || d.status === statusFilter)
  );

  if (missionFilter === 'more') {
    filtered = [...filtered].sort((a, b) => (b.missionsCompleted ?? 0) - (a.missionsCompleted ?? 0));
  } else if (missionFilter === 'less') {
    filtered = [...filtered].sort((a, b) => (a.missionsCompleted ?? 0) - (b.missionsCompleted ?? 0));
  }
if (hoursFilter === 'more') {
  filtered = [...filtered].sort(
    (a, b) => (driverStats[b.name]?.hoursWorked ?? 0) - (driverStats[a.name]?.hoursWorked ?? 0)
  );
} else if (hoursFilter === 'less') {
  filtered = [...filtered].sort(
    (a, b) => (driverStats[a.name]?.hoursWorked ?? 0) - (driverStats[b.name]?.hoursWorked ?? 0)
  );
}


  return filtered;
};



const addDriver = async () => {
  if (!newDriver.name.trim()) return;

  try {
    await axios.post('http://localhost:3000/api/drivers', {
      name: newDriver.name,
      permitType: newDriver.permitType  // ✅ this must be a string like "B" or "C"
    });

    setNewDriver({ name: '', permitType: 'B' });
    fetchDrivers();
  } catch (err) {
    console.error('❌ Add Driver Error:', err.response?.data || err.message);
    alert('❌ Failed to create driver');
  }
};
const deleteDriver = async (id) => {
  const confirm = window.confirm('❗ Are you sure you want to delete this driver?');
  if (!confirm) return;

  await axios.delete(`http://localhost:3000/api/drivers/${id}`);
  fetchDrivers();
};

const toggleAvailability = async (driver) => {
  const action = driver.status === 'off_duty' ? 'mark this driver as available' : 'mark this driver as off duty';
  if (!window.confirm(`⚠️ Are you sure you want to ${action}?`)) return;

  const newStatus = driver.status === 'off_duty' ? 'available' : 'off_duty';
  await axios.patch(`http://localhost:3000/api/drivers/${driver._id}`, { status: newStatus });
  fetchDrivers();
};


 const startEdit = (driver) => {
  setEditingId(driver._id);
  setEditedDriver({ name: driver.name, permitType: driver.permitType });
};


  const saveEdit = async () => {
    await axios.patch(`http://localhost:3000/api/drivers/${editingId}`, editedDriver);
    setEditingId(null);
    fetchDrivers();
  };

  const cancelEdit = () => {
    setEditingId(null);
  };
  const filteredDrivers = handleSearchAndFilter();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold">🧑‍✈️ Driver Management</h2>

      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search by Name"
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
          className="border px-3 py-1 rounded w-full"
        />
        <select
          value={permitFilter}
          onChange={(e) => setPermitFilter(e.target.value)}
          className="border px-3 py-1 rounded"
        >
          <option value="">All Permits</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-1 rounded"
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="on_mission">On Mission</option>
          <option value="off_duty">Off Duty</option>
        </select>

        <select
  value={missionFilter}
  onChange={(e) => setMissionFilter(e.target.value)}
  className="border px-3 py-1 rounded"
>
  <option value="none">Sort by Missions</option>
  <option value="more">More Missions</option>
  <option value="less">Fewer Missions</option>
</select>
<select
  value={hoursFilter}
  onChange={(e) => setHoursFilter(e.target.value)}
  className="border px-3 py-1 rounded"
>
  <option value="all">All Hours</option>
  <option value="more">More Hours</option>
  <option value="less">Fewer Hours</option>
</select>


      </div>
      <button
  onClick={resetFilters}
  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
>
  Reset Filters
</button>


      {/* Driver Table */}
      <table className="w-full border mt-4 text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Permit</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Missions</th>
            
            <th className="border p-2">Hours Worked</th>
            <th className="border p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDrivers.map(driver => (
            <tr key={driver._id} className="bg-white">
              <td className="border p-2">
                {editingId === driver._id ? (
                  <input
                    value={editedDriver.name}
                    onChange={(e) => setEditedDriver({ ...editedDriver, name: e.target.value })}
                    className="border px-2 py-1 rounded w-full"
                  />
                ) : (
                  driver.name
                )}
              </td>
              <td className="border p-2">
    {editingId === driver._id ? (
  <select
    value={editedDriver.permitType}
    onChange={(e) => setEditedDriver({ ...editedDriver, permitType: e.target.value })}
    className="border px-2 py-1 rounded w-full"
  >
    <option value="B">B</option>
    <option value="C">C</option>
  </select>
) : (
  driver.permitType
)}
              </td>
              <td className="border p-2 capitalize text-sm font-medium">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(driver.status)}`}>
                  {driver.status.replace('_', ' ')}
                </span>
              </td>
              <td className="border p-2 text-center">{driver.missionsCompleted ?? 0}</td>
              <td className="border p-2 text-center">
  {formatWorkedHours(driverStats[driver.name]?.hoursWorked || 0)}
</td>

              <td className="border p-2 text-center space-x-2">
                {editingId === driver._id ? (
                  <>
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                      onClick={saveEdit}
                    >✅ Save</button>
                    <button
                      className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
                      onClick={cancelEdit}
                    >❌ Cancel</button>
                  </>
                ) : (
                  <>
                    <button
                      className="bg-indigo-600 text-white px-2 py-1 rounded text-xs"
                      onClick={() => startEdit(driver)}
                    >✏️ Edit</button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                      onClick={() => deleteDriver(driver._id)}
                    >🗑️ Delete</button>
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                      onClick={() => toggleAvailability(driver)}
                    >{driver.status === 'off_duty' ? '✅ Mark Available' : '⚙️ Mark Off Duty'}</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ➕ Add Driver */}
      <div className="mt-6 flex items-center gap-2">
        <input
          type="text"
          placeholder="New Driver Name"
          className="border px-3 py-1 rounded"
          value={newDriver.name}
          onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
        />
<select
  value={newDriver.permitType}
  onChange={(e) => setNewDriver({ ...newDriver, permitType: e.target.value })}
  className="border px-3 py-1 rounded"
>
  <option value="B">B</option>
  <option value="C">C</option>
</select>

        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          onClick={addDriver}
        >➕ Add Driver</button>
      </div>
    </div>
  );
};

function getStatusColor(status) {
  switch (status) {
    case 'available': return 'bg-green-100 text-green-700';
    case 'on_mission': return 'bg-blue-100 text-blue-700';
    case 'off_duty': return 'bg-gray-200 text-gray-600';
    default: return 'bg-gray-100 text-gray-700';
  }
}
function formatWorkedHours(hours) {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h} h ${m} min`;
}

export default AvailableDrivers;
