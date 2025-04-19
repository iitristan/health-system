"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/app/context/SessionContext";

interface NurseProfile {
  full_name: string;
  position: string;
  email: string;
  signature: string;
}

interface Nurse extends NurseProfile {
  id: string;
  created_at: string;
  updated_at: string;
}

interface Patient {
  full_name: string;
  date_of_birth: string;
  gender: string;
}

interface RelatedRecord {
  id: string;
  full_name: string;
  date_of_service: string;
  physician_id: string;
}

interface RelatedRecords {
  vital_signs: RelatedRecord[];
  medical_checkups: RelatedRecord[];
  vaccinations: RelatedRecord[];
  deworming: RelatedRecord[];
  nutrition_diet: RelatedRecord[];
  emergency_response: RelatedRecord[];
  extensive_medical: RelatedRecord[];
}

const ProfilePage = () => {
  const router = useRouter();
  const { selectedNurse, setSelectedNurse } = useSession();
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [formData, setFormData] = useState<NurseProfile>({
    full_name: "",
    position: "",
    email: "",
    signature: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'nurse' | 'patient', id: string, name: string } | null>(null);
  const [relatedRecords, setRelatedRecords] = useState<RelatedRecords>({
    vital_signs: [],
    medical_checkups: [],
    vaccinations: [],
    deworming: [],
    nutrition_diet: [],
    emergency_response: [],
    extensive_medical: []
  });

  useEffect(() => {
    fetchNurses();
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedNurse) {
      setFormData({
        full_name: selectedNurse.full_name,
        position: selectedNurse.position,
        email: selectedNurse.email,
        signature: selectedNurse.signature,
      });
    } else {
      setFormData({
        full_name: "",
        position: "",
        email: "",
        signature: "",
      });
    }
  }, [selectedNurse]);

  const fetchNurses = async () => {
    try {
      const { data, error } = await supabase
        .from("nurses")
        .select("*")
        .order("full_name");

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error("No data received from the server");
      }

      setNurses(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(`Failed to fetch nurses: ${errorMessage}`);
      console.error("Error fetching nurses:", err);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("full_name");

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error("No data received from the server");
      }

      setPatients(data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(`Failed to fetch patients: ${errorMessage}`);
      console.error("Error fetching patients:", err);
    }
  };

  const fetchRelatedRecords = async (nurseId: string) => {
    try {
      const [
        vitalSigns,
        medicalCheckups,
        vaccinations,
        deworming,
        nutritionDiet,
        emergencyResponse,
        extensiveMedical
      ] = await Promise.all([
        supabase.from("vital_signs").select("*").eq("physician_id", nurseId),
        supabase.from("medical_checkup_records").select("*").eq("physician_id", nurseId),
        supabase.from("vaccination_records").select("*").eq("physician_id", nurseId),
        supabase.from("deworming_records").select("*").eq("physician_id", nurseId),
        supabase.from("nutrition_diet_records").select("*").eq("physician_id", nurseId),
        supabase.from("emergency_response_records").select("*").eq("physician_id", nurseId),
        supabase.from("extensive_medical_assistance_records").select("*").eq("physician_id", nurseId)
      ]);

      setRelatedRecords({
        vital_signs: vitalSigns.data || [],
        medical_checkups: medicalCheckups.data || [],
        vaccinations: vaccinations.data || [],
        deworming: deworming.data || [],
        nutrition_diet: nutritionDiet.data || [],
        emergency_response: emergencyResponse.data || [],
        extensive_medical: extensiveMedical.data || []
      });
    } catch (err) {
      console.error("Error fetching related records:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNurseSelect = (nurse: Nurse) => {
    setSelectedNurse(nurse);
  };

  const handleCreateNew = () => {
    setSelectedNurse(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (selectedNurse) {
        const { error } = await supabase
          .from("nurses")
          .update(formData)
          .eq("id", selectedNurse.id);

        if (error) {
          throw new Error(error.message);
        }
      } else {
        const { error } = await supabase
          .from("nurses")
          .insert([formData]);

        if (error) {
          throw new Error(error.message);
        }
      }

      await fetchNurses();
      setSelectedNurse(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(`Failed to save staff profile: ${errorMessage}`);
      console.error("Error saving staff profile:", err);
    }
  };

  const handleDeleteNurse = async (nurseId: string) => {
    try {
      // First check if there are any related records
      const hasRelatedRecords = Object.values(relatedRecords).some(records => records.length > 0);
      
      if (hasRelatedRecords) {
        setError("Cannot delete nurse: Please delete all related records first.");
        return;
      }

      const { error } = await supabase
        .from("nurses")
        .delete()
        .eq("id", nurseId);

      if (error) {
        if (error.code === "23503") { // Foreign key violation
          setError("Cannot delete nurse: This nurse has associated records in other tables. Please delete those records first.");
        } else {
          throw new Error(error.message);
        }
        return;
      }

      await fetchNurses();
      if (selectedNurse?.id === nurseId) {
        setSelectedNurse(null);
      }
      setShowDeleteConfirm(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(`Failed to delete nurse: ${errorMessage}`);
      console.error("Error deleting nurse:", err);
    }
  };

  const handleDeletePatient = async (patientName: string) => {
    try {
      const { error } = await supabase
        .from("patients")
        .delete()
        .eq("full_name", patientName);

      if (error) {
        throw new Error(error.message);
      }

      await fetchPatients();
      setShowDeleteConfirm(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(`Failed to delete patient: ${errorMessage}`);
      console.error("Error deleting patient:", err);
    }
  };

  const handleDeleteRelatedRecord = async (table: string, recordId: string) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", recordId);

      if (error) throw error;

      // Refresh related records
      if (showDeleteConfirm?.type === 'nurse') {
        await fetchRelatedRecords(showDeleteConfirm.id);
      }
    } catch (err) {
      console.error(`Error deleting record from ${table}:`, err);
    }
  };

  // Update the useEffect to fetch related records when showing delete confirmation
  useEffect(() => {
    if (showDeleteConfirm?.type === 'nurse') {
      fetchRelatedRecords(showDeleteConfirm.id);
    }
  }, [showDeleteConfirm]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-800 py-6 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="p-2 text-white hover:bg-indigo-700 rounded-md transition-colors"
            title="Go to Home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">
              Electronic Health Record
            </h1>
            <p className="mt-1 text-lg text-indigo-200">Staff Profile</p>
          </div>

          <button
            onClick={() => router.back()}
            className="p-2 text-white hover:bg-indigo-700 rounded-md transition-colors"
            title="Go Back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Nurse List */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-blue-800 text-white flex justify-between items-center">
                <h2 className="text-xl font-semibold">Staff List</h2>
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-800 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                >
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Staff
                </button>
              </div>
              <div className="border-t border-gray-200">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-gray-400 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <span className="text-sm text-gray-500">
                      {nurses.length} nurses found
                    </span>
                  </div>
                </div>
                <ul className="divide-y divide-gray-200">
                  {nurses.map((nurse) => (
                    <li
                      key={nurse.id}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                        selectedNurse?.id === nurse.id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleNurseSelect(nurse)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {nurse.full_name}
                          </p>
                          <p className="text-sm text-gray-500">{nurse.position}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm({ type: 'nurse', id: nurse.id, name: nurse.full_name });
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Patient List */}
            <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-green-800 text-white">
                <h2 className="text-xl font-semibold">Patient List</h2>
              </div>
              <div className="border-t border-gray-200">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-gray-400 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <span className="text-sm text-gray-500">
                      {patients.length} patients found
                    </span>
                  </div>
                </div>
                <ul className="divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <li
                      key={patient.full_name}
                      className="px-4 py-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {patient.full_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {patient.gender} • {new Date(patient.date_of_birth).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowDeleteConfirm({ type: 'patient', id: patient.full_name, name: patient.full_name })}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Confirm Delete
                </h3>
                
                {showDeleteConfirm.type === 'nurse' && (
                  <>
                    <p className="text-sm text-gray-500 mb-4">
                      Are you sure you want to delete {showDeleteConfirm.name}? This action cannot be undone.
                    </p>
                    
                    {/* Related Records Section */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Related Records</h4>
                      <div className="space-y-4">
                        {Object.entries(relatedRecords).map(([table, records]) => (
                          records.length > 0 && (
                            <div key={table} className="border rounded-md p-3">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">
                                {table.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Records
                              </h5>
                              <div className="space-y-2">
                                {records.map((record: RelatedRecord) => (
                                  <div key={record.id} className="flex justify-between items-center text-sm">
                                    <span>
                                      {record.full_name} - {new Date(record.date_of_service).toLocaleDateString()}
                                    </span>
                                    <button
                                      onClick={() => handleDeleteRelatedRecord(table, record.id)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (showDeleteConfirm.type === 'nurse') {
                        handleDeleteNurse(showDeleteConfirm.id);
                      } else {
                        handleDeletePatient(showDeleteConfirm.id);
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-blue-800 text-white">
                <h2 className="text-xl font-semibold">Staff Information</h2>
              </div>

              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 p-2 border border-gray-300 rounded w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Position
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        required
                        className="mt-1 p-2 border border-gray-300 rounded w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1 p-2 border border-gray-300 rounded w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Digital Signature
                    </label>
                    <input
                      type="text"
                      name="signature"
                      value={formData.signature}
                      onChange={handleInputChange}
                      className="mt-1 p-2 border border-gray-300 rounded w-full"
                      placeholder="Enter your digital signature"
                    />
                  </div>

                  <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 