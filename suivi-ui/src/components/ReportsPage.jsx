import React, { useState } from 'react';
import { Download } from 'lucide-react';

const ReportsPage = () => {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const validateDate = () => {
    if (!year || !month) {
      alert('⚠️ Please provide both month and year');
      return false;
    }
    return true;
  };

  const fetchExcel = async (url, filename) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('❌ Failed to fetch Excel');
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('❌ Failed to generate report');
      console.error(err);
    }
  };

  const handleGenerateCarReport = () => {
    if (!validateDate()) return;
    const paddedMonth = month.padStart(2, '0');
    fetchExcel(
      `http://localhost:3000/api/missions/report/cars/excel?year=${year}&month=${paddedMonth}`,
      `car_report_${year}_${paddedMonth}.xlsx`
    );
  };

  const handleGenerateDriverReport = () => {
    if (!validateDate()) return;
    const paddedMonth = month.padStart(2, '0');
    fetchExcel(
      `http://localhost:3000/api/missions/report/drivers/excel?year=${year}&month=${paddedMonth}`,
      `rapport_chauffeurs_${year}_${paddedMonth}.xlsx`
    );
  };

  const handleGenerateMissionReport = () => {
    if (!validateDate()) return;
    const paddedMonth = month.padStart(2, '0');
    fetchExcel(
      `http://localhost:3000/api/missions/report/missions/excel?year=${year}&month=${paddedMonth}`,
      `missions_${year}_${paddedMonth}.xlsx`
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-10">📊 Reports Dashboard</h2>

      {/* Month Picker */}
      <div className="flex justify-center mb-10">
        <input
          type="month"
          className="border border-gray-300 px-4 py-2 rounded-md shadow-sm"
          value={month && year ? `${year}-${month}` : ''}
          onChange={(e) => {
            const [y, m] = e.target.value.split('-');
            setMonth(m);
            setYear(y);
          }}
        />
      </div>
{/* Report Cards */}
<div className="w-full overflow-x-auto">
  <div className="flex flex-row justify-center gap-6 min-w-[960px] mb-12">
  {/* Car Report */}
<div className="border border-gray-100 rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition w-full sm:w-[300px] bg-white">
    <div className="flex items-center justify-center mb-4">
      <div className="bg-gray-100 rounded-xl p-4 text-3xl">🚗</div>
    </div>
    <h3 className="text-lg font-semibold text-gray-900">Car Report</h3>
    <p className="text-sm text-gray-500 mb-6">Missions and KM per car</p>
        <div className="flex justify-center mb-4">

<button
  onClick={handleGenerateCarReport}
  style={{
    backgroundColor: '#3b82f6', // Tailwind's blue-500
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '0.75rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
    cursor: 'pointer',
  }}
>
  <Download style={{ width: '20px', height: '20px', color: 'white' }} />
  Generate Report
</button>
</div>
<div className="mt-62" />



  </div>

  {/* Driver Report */}
<div className="border border-gray-100 rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition w-full sm:w-[300px] bg-white">
    <div className="flex items-center justify-center mb-4">
      <div className="bg-gray-100 rounded-xl p-4 text-3xl">👨‍✈️</div>
    </div>
    <h3 className="text-lg font-semibold text-gray-900">Driver Report</h3>
    <p className="text-sm text-gray-500 mb-6">Missions, hours, vehicle types per driver</p>
    <p className="text-sm text-gray-500 mb-6"></p>
    <div className="flex justify-center mb-4">

<button
  onClick={handleGenerateDriverReport}
  style={{
    backgroundColor: '#22c55e', // Tailwind's green-500
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '0.75rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
    cursor: 'pointer',
  }}
>
  <Download style={{ width: '20px', height: '20px', color: 'white' }} />
  Generate Report
</button>
</div>

  </div>

  {/* Full Mission Report */}
<div className="border border-gray-100 rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition w-full sm:w-[300px] bg-white">
    <div className="flex items-center justify-center mb-4">
      <div className="bg-gray-100 rounded-xl p-4 text-3xl">📄</div>
    </div>
    <h3 className="text-lg font-semibold text-gray-900">Full Mission Report</h3>
    <p className="text-sm text-gray-500 mb-3">Detailed table of all missions</p>
    <div className="flex justify-center mb-4">

<button
  onClick={handleGenerateMissionReport}
  style={{
    backgroundColor: '#8b5cf6', // Tailwind's purple-500
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '0.75rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 2px 6px rgba(187, 36, 36, 0.15)',
    cursor: 'pointer',
  }}
>
  <Download style={{ width: '20px', height: '20px', color: 'white' }} />
  Generate Report
</button>
</div>


  </div>
</div>
   </div>

{/* Unified Report Info Section */}
<div className="bg-blue-50 p-6 rounded-xl">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">Report Information</h2>
        <div className="flex gap-6 text-sm text-blue-900 justify-between">

          {/* Car Report Info */}
          <div className="flex-1">
            <p className="font-semibold mb-2">🚗 Car Report Includes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Total missions per car</li>
              <li>Total kilometers driven</li>
              <li>Vehicle utilization rate</li>
              <li>Maintenance scheduling</li>
            </ul>
          </div>

          {/* Driver Report Info */}
          <div className="flex-1">
            <p className="font-semibold mb-2">👨‍✈️✈️ Driver Report Includes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Total missions completed</li>
              <li>Total hours worked</li>
              <li>Vehicle types operated</li>
              <li>Performance metrics</li>
            </ul>
          </div>

          {/* Full Mission Report Info */}
          <div className="flex-1">
            <p className="font-semibold mb-2">📄 Full Mission Report Includes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Complete mission details</li>
              <li>Driver and vehicle assignments</li>
              <li>Time and distance tracking</li>
              <li>Mission type analysis</li>
            </ul>
          </div>

        </div>
      </div>
    </div>


);
};

export default ReportsPage;
