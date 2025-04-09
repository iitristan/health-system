'use client';

import { useState } from 'react';

export default function HealthHistoryPage() {
  // Patient information (would typically come from props or API)
  const patientInfo = {
    lastName: 'Olayvar',
    firstName: 'Charlene',
    middleName: 'Alison',
    todaysDate: 'March 2025',
    dateOfBirth: 'August 15, 2013',
    address: 'Barangay 412, Sampaloc Manila, Philippines',
    contactNumber: '0995-728-4623',
    physician: 'Dr. Alena Santos, Pediatrician'
  };

  // State for form data
  const [formData, setFormData] = useState({
    chiefComplaint: '',
    sex: '',
    maritalStatus: 'Single',
    pastMedicalHistory: {
      occasionalColds: false,
      anemia: false,
      other: '',
    },
    pastSurgicalHistory: {
      hadSurgery: '',
      surgeries: [{ type: '', year: '' }]
    },
    recentHospitalization: 'None',
    healthMaintenance: {
      lastPediatricCheckup: '',
      lastCBC: '',
      lastNutritionalAssessment: '',
      lastVaccination: '',
      lastDeworming: '',
      lastEyeExam: '',
      visionCorrection: '',
      medications: [
        { name: 'Ferrous Sulfate (Iron)', frequency: 'O.D' },
        { name: 'Zinc Sulfate', frequency: 'O.D' }
      ]
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof formData],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSurgeryChange = (index: number, field: string, value: string) => {
    const updatedSurgeries = [...formData.pastSurgicalHistory.surgeries];
    updatedSurgeries[index] = {
      ...updatedSurgeries[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      pastSurgicalHistory: {
        ...prev.pastSurgicalHistory,
        surgeries: updatedSurgeries
      }
    }));
  };

  const addSurgery = () => {
    setFormData(prev => ({
      ...prev,
      pastSurgicalHistory: {
        ...prev.pastSurgicalHistory,
        surgeries: [...prev.pastSurgicalHistory.surgeries, { type: '', year: '' }]
      }
    }));
  };

  const removeSurgery = (index: number) => {
    const updatedSurgeries = formData.pastSurgicalHistory.surgeries.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      pastSurgicalHistory: {
        ...prev.pastSurgicalHistory,
        surgeries: updatedSurgeries
      }
    }));
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const updatedMedications = [...formData.healthMaintenance.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      healthMaintenance: {
        ...prev.healthMaintenance,
        medications: updatedMedications
      }
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      healthMaintenance: {
        ...prev.healthMaintenance,
        medications: [...prev.healthMaintenance.medications, { name: '', frequency: '' }]
      }
    }));
  };

  const removeMedication = (index: number) => {
    const updatedMedications = formData.healthMaintenance.medications.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      healthMaintenance: {
        ...prev.healthMaintenance,
        medications: updatedMedications
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Patient Information Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Patient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <div className="p-2 border border-gray-300 rounded-md bg-gray-50">{patientInfo.lastName}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <div className="p-2 border border-gray-300 rounded-md bg-gray-50">{patientInfo.firstName}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
              <div className="p-2 border border-gray-300 rounded-md bg-gray-50">{patientInfo.middleName}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Today's Date</label>
              <div className="p-2 border border-gray-300 rounded-md bg-gray-50">{patientInfo.todaysDate}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <div className="p-2 border border-gray-300 rounded-md bg-gray-50">{patientInfo.dateOfBirth}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <div className="p-2 border border-gray-300 rounded-md bg-gray-50">{patientInfo.address}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <div className="p-2 border border-gray-300 rounded-md bg-gray-50">{patientInfo.contactNumber}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Physician</label>
              <div className="p-2 border border-gray-300 rounded-md bg-gray-50">{patientInfo.physician}</div>
            </div>
          </div>
        </div>

        {/* Health History Form */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Health History Form</h2>
            
            <form className="space-y-8">
              {/* Chief Complaint */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chief Complaint</label>
                <textarea
                  name="chiefComplaint"
                  value={formData.chiefComplaint}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Enter the primary reason for visit"
                />
              </div>

              {/* Sex */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="sex"
                      value="Female"
                      checked={formData.sex === 'Female'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Female</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="sex"
                      value="Male"
                      checked={formData.sex === 'Male'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Male</span>
                  </label>
                </div>
              </div>

              {/* Marital Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              {/* Past Medical History */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Past Medical History</h3>
                <p className="text-sm text-gray-600 mb-4">Check any conditions you have had:</p>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="pastMedicalHistory.occasionalColds"
                      checked={formData.pastMedicalHistory.occasionalColds}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>Occasional colds and cough</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="pastMedicalHistory.anemia"
                      checked={formData.pastMedicalHistory.anemia}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>Mild iron-deficiency anemia</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600"
                    />
                    <input
                      type="text"
                      name="pastMedicalHistory.other"
                      value={formData.pastMedicalHistory.other}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Other conditions (please specify)"
                    />
                  </div>
                </div>
              </div>

              {/* Past Surgical History */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Past Surgical History</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Have you ever had surgery?</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="pastSurgicalHistory.hadSurgery"
                        value="Yes"
                        checked={formData.pastSurgicalHistory.hadSurgery === 'Yes'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="pastSurgicalHistory.hadSurgery"
                        value="No"
                        checked={formData.pastSurgicalHistory.hadSurgery === 'No'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                </div>

                {formData.pastSurgicalHistory.hadSurgery === 'Yes' && (
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-700">If yes, please list:</h4>
                    {formData.pastSurgicalHistory.surgeries.map((surgery, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <input
                            type="text"
                            value={surgery.type}
                            onChange={(e) => handleSurgeryChange(index, 'type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Type of surgery"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                          <input
                            type="text"
                            value={surgery.year}
                            onChange={(e) => handleSurgeryChange(index, 'year', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Year of surgery"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSurgery(index)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSurgery}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                      Add Another Surgery
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Hospitalization */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Recent Hospitalization</h3>
                <input
                  type="text"
                  name="recentHospitalization"
                  value={formData.recentHospitalization}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter recent hospitalization details"
                />
              </div>

              {/* Health Maintenance */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Health Maintenance</h3>
                <p className="text-sm text-gray-600 mb-4">Fill in all that apply:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Last Pediatric Checkup</label>
                    <input
                      type="text"
                      name="healthMaintenance.lastPediatricCheckup"
                      value={formData.healthMaintenance.lastPediatricCheckup}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g. December 2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Last CBC</label>
                    <input
                      type="text"
                      name="healthMaintenance.lastCBC"
                      value={formData.healthMaintenance.lastCBC}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g. February 2025"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Last Nutritional Assessment (BMI, MUAC)</label>
                    <input
                      type="text"
                      name="healthMaintenance.lastNutritionalAssessment"
                      value={formData.healthMaintenance.lastNutritionalAssessment}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g. January 2025"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Last Vaccination</label>
                    <input
                      type="text"
                      name="healthMaintenance.lastVaccination"
                      value={formData.healthMaintenance.lastVaccination}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g. July 2024 (Booster shot)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Last Deworming</label>
                    <input
                      type="text"
                      name="healthMaintenance.lastDeworming"
                      value={formData.healthMaintenance.lastDeworming}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g. August 2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Last eye exam</label>
                    <input
                      type="text"
                      name="healthMaintenance.lastEyeExam"
                      value={formData.healthMaintenance.lastEyeExam}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g. January 2025"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Glasses or contacts?</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="healthMaintenance.visionCorrection"
                        value="Yes"
                        checked={formData.healthMaintenance.visionCorrection === 'Yes'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="healthMaintenance.visionCorrection"
                        value="No"
                        checked={formData.healthMaintenance.visionCorrection === 'No'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">No</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="healthMaintenance.visionCorrection"
                        value="Both"
                        checked={formData.healthMaintenance.visionCorrection === 'Both'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Both</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Medications */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">List all medications and supplements you have:</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine or Supplement</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">How often?</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.healthMaintenance.medications.map((med, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="text"
                              value={med.name}
                              onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              placeholder="e.g. Ferrous Sulfate (Iron)"
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="text"
                              value={med.frequency}
                              onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              placeholder="e.g. O.D"
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => removeMedication(index)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <button
                  type="button"
                  onClick={addMedication}
                  className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  Add Medication
                </button>
              </div>

              {/* Form Actions */}
              <div className="border-t border-gray-200 pt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Health History
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}