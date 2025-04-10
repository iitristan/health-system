'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MedicationAdministrationRecord() {
  const [medications, setMedications] = useState([
    { 
      name: 'Ferrous Sulfate', 
      startDate: '', 
      endDate: '',
      administrations: Array(7).fill({ time: '', status: '' })
    },
    { 
      name: 'Zinc Sulfate', 
      startDate: '', 
      endDate: '',
      administrations: Array(7).fill({ time: '', status: '' })
    },
    { 
      name: '', 
      startDate: '', 
      endDate: '',
      administrations: Array(7).fill({ time: '', status: '' })
    }
  ]);

  const [nurse, setNurse] = useState({
    name: 'Marsha M. Perez',
    initials: 'M.M.P.',
    signature: ''
  });

  const router = useRouter();

  const handleMedicationChange = (index, field, value) => {
    const updatedMeds = [...medications];
    updatedMeds[index][field] = value;
    setMedications(updatedMeds);
  };

  const handleAdminChange = (medIndex, adminIndex, field, value) => {
    const updatedMeds = [...medications];
    updatedMeds[medIndex].administrations[adminIndex] = {
      ...updatedMeds[medIndex].administrations[adminIndex],
      [field]: value
    };
    setMedications(updatedMeds);
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      { 
        name: '', 
        startDate: '', 
        endDate: '',
        administrations: Array(7).fill({ time: '', status: '' })
      }
    ]);
  };

  const removeMedication = (index) => {
    const updatedMeds = [...medications];
    updatedMeds.splice(index, 1);
    setMedications(updatedMeds);
  };

  const dates = ['03/28/25', '03/29/25', '03/30/25', '03/31/25', '04/01/25', '04/02/25', '04/03/25'];
  const times = ['6 AM', '8 AM', '12 PM', '2 PM', '6 PM', '8 PM', '10 PM'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-800 py-6 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="p-2 text-white hover:bg-indigo-700 rounded-md transition-colors"
            title="Go to Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Electronic Health Record</h1>
            <p className="mt-1 text-lg text-indigo-200">Medication Administration</p>
          </div>

          <button
            onClick={() => router.back()}
            className="p-2 text-white hover:bg-indigo-700 rounded-md transition-colors"
            title="Go Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>
      </div>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-800 text-white p-4">
            <h1 className="text-2xl font-bold">MEDICATION ADMINISTRATION RECORD</h1>
          </div>

          {/* Patient Information */}
          <div className="p-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <div className="mt-1 p-2 border border-gray-300 rounded bg-gray-50">C.A.O.</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Month</label>
                <div className="mt-1 p-2 border border-gray-300 rounded bg-gray-50">March</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Year</label>
                <div className="mt-1 p-2 border border-gray-300 rounded bg-gray-50">2025</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <div className="mt-1 p-2 border border-gray-300 rounded bg-gray-50">08-15-2013</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <div className="mt-1 p-2 border border-gray-300 rounded bg-gray-50">11</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sex</label>
                <div className="mt-1 p-2 border border-gray-300 rounded bg-gray-50">F</div>
              </div>
            </div>
          </div>

          {/* Legends */}
          <div className="p-4 bg-gray-100 border-b">
            <h3 className="font-medium mb-2">Direction: Change the code of the administration box (ADM) based on the actions taken (see the legends below)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="flex items-center">
                <div className="w-8 h-8 border border-gray-300 flex items-center justify-center mr-2">GN</div>
                <span>Given</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 border border-gray-300 flex items-center justify-center mr-2">NG</div>
                <span>Not Given</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 border border-gray-300 flex items-center justify-center mr-2">DL</div>
                <span>Delayed</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 border border-gray-300 flex items-center justify-center mr-2">DC</div>
                <span>Discontinued</span>
              </div>
            </div>
          </div>

          {/* Medications Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">MEDICATIONS</th>
                  {dates.map((date, index) => (
                    <th key={index} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                      {date}
                      <div className="text-xs font-normal">DATE</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {medications.map((med, medIndex) => (
                  <>
                    <tr key={`med-${medIndex}`} className="border-b">
                      <td className="px-6 py-4 whitespace-nowrap border-r">
                        <div className="mb-2">
                          <label className="block text-sm font-medium text-gray-700">Drug Name</label>
                          <input
                            type="text"
                            value={med.name}
                            onChange={(e) => handleMedicationChange(medIndex, 'name', e.target.value)}
                            className="mt-1 p-2 border border-gray-300 rounded w-full"
                            placeholder="Enter drug name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                              type="date"
                              value={med.startDate}
                              onChange={(e) => handleMedicationChange(medIndex, 'startDate', e.target.value)}
                              className="mt-1 p-2 border border-gray-300 rounded w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <input
                              type="date"
                              value={med.endDate}
                              onChange={(e) => handleMedicationChange(medIndex, 'endDate', e.target.value)}
                              className="mt-1 p-2 border border-gray-300 rounded w-full"
                            />
                          </div>
                        </div>
                      </td>
                      {dates.map((_, adminIndex) => (
                        <td key={`admin-${medIndex}-${adminIndex}`} className="px-6 py-4 whitespace-nowrap border-r">
                          <div className="flex flex-col space-y-2">
                            {times.map((time, timeIndex) => (
                              <div key={`time-${timeIndex}`} className="flex items-center">
                                <div className="w-16 mr-2">{time}</div>
                                <select
                                  value={med.administrations[adminIndex].status}
                                  onChange={(e) => handleAdminChange(medIndex, adminIndex, 'status', e.target.value)}
                                  className="p-1 border border-gray-300 rounded"
                                >
                                  <option value=""></option>
                                  <option value="GN">GN</option>
                                  <option value="NG">NG</option>
                                  <option value="DL">DL</option>
                                  <option value="DC">DC</option>
                                </select>
                              </div>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td colSpan={8} className="px-6 py-2">
                        <button
                          type="button"
                          onClick={() => removeMedication(medIndex)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove Medication
                        </button>
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Medication Button */}
          <div className="p-4 border-t">
            <button
              type="button"
              onClick={addMedication}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Medication
            </button>
          </div>

          {/* Nurse Information */}
          <div className="p-6 border-t">
            <h3 className="font-medium mb-4">NURSE INFORMATION</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Print Name of the Nurse</label>
                <div className="mt-1 p-2 border border-gray-300 rounded bg-gray-50">Marsha M. Perez</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Initials</label>
                <div className="mt-1 p-2 border border-gray-300 rounded bg-gray-50">M.M.P.</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Signature</label>
                <input
                  type="text"
                  value={nurse.signature}
                  onChange={(e) => setNurse({...nurse, signature: e.target.value})}
                  className="mt-1 p-2 border border-gray-300 rounded w-full"
                  placeholder="Enter signature"
                />
              </div>
            </div>
          </div>

          {/* Allergies and Reactions */}
          <div className="p-6 bg-gray-50 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Allergies</label>
                <div className="mt-1 p-2 border border-gray-300 rounded bg-white">None</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Adverse Drug Reactions</label>
                <div className="mt-1 p-2 border border-gray-300 rounded bg-white">None</div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-4 bg-gray-100 flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}