"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/app/context/SessionContext";
import { cn } from "@/lib/utils";

interface FormData {
  chiefComplaint: string;
  pastMedicalHistory: {
    occasionalColds: boolean;
    anemia: boolean;
    other: string;
  };
  pastSurgicalHistory: {
    hadSurgery: string;
    surgeries: Array<{ type: string; year: string }>;
  };
  recentHospitalization: string;
  healthMaintenance: {
    lastPediatricCheckup: string;
    lastCBC: string;
    lastNutritionalAssessment: string;
    lastVaccination: string;
    lastDeworming: string;
    lastEyeExam: string;
    visionCorrection: string;
    medications: Array<{ name: string; frequency: string }>;
  };
  familyHistory: {
    diabetes: boolean;
    hypertension: boolean;
    asthma: boolean;
    heartDisease: boolean;
    cancer: boolean;
    stroke: boolean;
    other: boolean;
    otherDetails: string;
  };
}

interface HealthHistoryRecord {
  id: string;
  full_name: string;
  physician_id: string;
  chief_complaint: string;
  past_medical_conditions: {
    occasionalColds: boolean;
    anemia: boolean;
    other: string;
  };
  past_surgical_history: {
    hadSurgery: string;
    surgeries: Array<{ type: string; year: string }>;
  };
  family_history: {
    diabetes: boolean;
    hypertension: boolean;
    asthma: boolean;
    heartDisease: boolean;
    cancer: boolean;
    stroke: boolean;
    other: boolean;
    otherDetails: string;
  };
  recent_hospitalization: string;
  health_maintenance: {
    lastPediatricCheckup: string;
    lastCBC: string;
    lastNutritionalAssessment: string;
    lastVaccination: string;
    lastDeworming: string;
    lastEyeExam: string;
    visionCorrection: string;
    medications: Array<{ name: string; frequency: string }>;
  };
  created_at: string;
  updated_at: string;
}

export default function HealthHistoryWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HealthHistoryPage />
    </Suspense>
  );
}

function HealthHistoryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedNurse } = useSession();
  const patientName = searchParams.get("patient");

  const [patientInfo, setPatientInfo] = useState({
    fullName: "",
    physician: selectedNurse
      ? `${selectedNurse.full_name}, ${selectedNurse.position}`
      : "N/A",
    dateOfService: new Date().toLocaleDateString(),
    age: "",
    gender: "",
  });

  const [patients, setPatients] = useState<Array<{ full_name: string }>>([]);
  const [selectedPatient, setSelectedPatient] = useState("");

  const [historyRecords, setHistoryRecords] = useState<HealthHistoryRecord[]>(
    []
  );
  const [selectedRecord, setSelectedRecord] =
    useState<HealthHistoryRecord | null>(null);

  // Update physician when selectedNurse changes
  useEffect(() => {
    if (selectedNurse) {
      setPatientInfo((prev) => ({
        ...prev,
        physician: `${selectedNurse.full_name}, ${selectedNurse.position}`,
      }));
    }
  }, [selectedNurse]);

  // Fetch all patients and patient info
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all patients for the dropdown
        const { data: patientsData, error: patientsError } = await supabase
          .from("patients")
          .select("full_name, age, gender")
          .order("full_name");

        if (patientsError) throw patientsError;
        setPatients(patientsData || []);

        // If patient name is in URL, fetch their info and health history
        if (patientName) {
          // Fetch patient info
          const { data: patientData, error: patientError } = await supabase
            .from("patients")
            .select("full_name, age, gender")
            .eq("full_name", decodeURIComponent(patientName))
            .single();

          if (patientError) throw patientError;

          if (patientData) {
            setPatientInfo((prev) => ({
              ...prev,
              fullName: patientData.full_name,
              age: patientData.age?.toString() || "N/A",
              gender: patientData.gender || "N/A",
            }));
            setSelectedPatient(patientData.full_name);
          }

          // Fetch existing health history
          const { data: healthHistoryData, error: healthHistoryError } =
            await supabase
              .from("health_history")
              .select("*")
              .eq("full_name", decodeURIComponent(patientName))
              .single();

          if (healthHistoryError && healthHistoryError.code !== "PGRST116") {
            // PGRST116 is "no rows returned"
            throw healthHistoryError;
          }

          if (healthHistoryData) {
            // Parse JSONB data
            const pastMedicalConditions =
              typeof healthHistoryData.past_medical_conditions === "string"
                ? JSON.parse(healthHistoryData.past_medical_conditions)
                : healthHistoryData.past_medical_conditions;

            const pastSurgicalHistory =
              typeof healthHistoryData.past_surgical_history === "string"
                ? JSON.parse(healthHistoryData.past_surgical_history)
                : healthHistoryData.past_surgical_history;

            const healthMaintenance =
              typeof healthHistoryData.health_maintenance === "string"
                ? JSON.parse(healthHistoryData.health_maintenance)
                : healthHistoryData.health_maintenance;

            // Update form data with existing health history
            setFormData({
              chiefComplaint: healthHistoryData.chief_complaint || "",
              pastMedicalHistory: {
                occasionalColds:
                  pastMedicalConditions?.occasionalColds || false,
                anemia: pastMedicalConditions?.anemia || false,
                other: pastMedicalConditions?.other || "",
              },
              pastSurgicalHistory: {
                hadSurgery: pastSurgicalHistory?.hadSurgery || "",
                surgeries: pastSurgicalHistory?.surgeries || [
                  { type: "", year: "" },
                ],
              },
              recentHospitalization:
                healthHistoryData.recent_hospitalization || "None",
              healthMaintenance: {
                lastPediatricCheckup:
                  healthMaintenance?.lastPediatricCheckup || "",
                lastCBC: healthMaintenance?.lastCBC || "",
                lastNutritionalAssessment:
                  healthMaintenance?.lastNutritionalAssessment || "",
                lastVaccination: healthMaintenance?.lastVaccination || "",
                lastDeworming: healthMaintenance?.lastDeworming || "",
                lastEyeExam: healthMaintenance?.lastEyeExam || "",
                visionCorrection: healthMaintenance?.visionCorrection || "",
                medications: healthMaintenance?.medications || [
                  { name: "Ferrous Sulfate (Iron)", frequency: "O.D" },
                  { name: "Zinc Sulfate", frequency: "O.D" },
                ],
              },
              familyHistory: {
                diabetes: false,
                hypertension: false,
                asthma: false,
                heartDisease: false,
                cancer: false,
                stroke: false,
                other: false,
                otherDetails: "",
              },
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [patientName]);

  // Fetch history records
  useEffect(() => {
    const fetchHistoryRecords = async () => {
      if (!patientName) return;

      const { data, error } = await supabase
        .from("health_history")
        .select("*")
        .eq("full_name", decodeURIComponent(patientName))
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching history records:", error);
        return;
      }

      setHistoryRecords(data || []);
    };

    fetchHistoryRecords();
  }, [patientName]);

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedPatient(selectedName);
    if (selectedName) {
      router.push(
        `/health-history?patient=${encodeURIComponent(selectedName)}`
      );
    } else {
      router.push("/health-history");
    }
  };

  // State for form data
  const [formData, setFormData] = useState<FormData>({
    chiefComplaint: "",
    pastMedicalHistory: {
      occasionalColds: false,
      anemia: false,
      other: "",
    },
    pastSurgicalHistory: {
      hadSurgery: "",
      surgeries: [{ type: "", year: "" }],
    },
    recentHospitalization: "",
    healthMaintenance: {
      lastPediatricCheckup: "",
      lastCBC: "",
      lastNutritionalAssessment: "",
      lastVaccination: "",
      lastDeworming: "",
      lastEyeExam: "",
      visionCorrection: "",
      medications: [{ name: "", frequency: "" }],
    },
    familyHistory: {
      diabetes: false,
      hypertension: false,
      asthma: false,
      heartDisease: false,
      cancer: false,
      stroke: false,
      other: false,
      otherDetails: "",
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      const parentKey = parent as keyof FormData;
      const parentValue = formData[parentKey] as Record<
        string,
        string | boolean
      >;

      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...parentValue,
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSurgeryChange = (index: number, field: string, value: string) => {
    const updatedSurgeries = [...formData.pastSurgicalHistory.surgeries];
    updatedSurgeries[index] = {
      ...updatedSurgeries[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      pastSurgicalHistory: {
        ...prev.pastSurgicalHistory,
        surgeries: updatedSurgeries,
      },
    }));
  };

  const addSurgery = () => {
    setFormData((prev) => ({
      ...prev,
      pastSurgicalHistory: {
        ...prev.pastSurgicalHistory,
        surgeries: [
          ...prev.pastSurgicalHistory.surgeries,
          { type: "", year: "" },
        ],
      },
    }));
  };

  const removeSurgery = (index: number) => {
    const updatedSurgeries = formData.pastSurgicalHistory.surgeries.filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({
      ...prev,
      pastSurgicalHistory: {
        ...prev.pastSurgicalHistory,
        surgeries: updatedSurgeries,
      },
    }));
  };

  const handleMedicationChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedMedications = [...formData.healthMaintenance.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      healthMaintenance: {
        ...prev.healthMaintenance,
        medications: updatedMedications,
      },
    }));
  };

  const addMedication = () => {
    setFormData((prev) => ({
      ...prev,
      healthMaintenance: {
        ...prev.healthMaintenance,
        medications: [
          ...prev.healthMaintenance.medications,
          { name: "", frequency: "" },
        ],
      },
    }));
  };

  const removeMedication = (index: number) => {
    const updatedMedications = formData.healthMaintenance.medications.filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({
      ...prev,
      healthMaintenance: {
        ...prev.healthMaintenance,
        medications: updatedMedications,
      },
    }));
  };

  const handleViewRecord = (record: HealthHistoryRecord) => {
    setSelectedRecord(record);
    setFormData({
      chiefComplaint: record.chief_complaint,
      pastMedicalHistory: record.past_medical_conditions,
      pastSurgicalHistory: record.past_surgical_history,
      familyHistory: record.family_history,
      recentHospitalization: record.recent_hospitalization,
      healthMaintenance: record.health_maintenance,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName) {
      alert("No patient selected");
      return;
    }

    if (!selectedNurse) {
      alert("No nurse selected. Please select a staff in the profile section.");
      return;
    }

    try {
      // Update current health history
      const { error: updateError } = await supabase
        .from("health_history")
        .upsert({
          full_name: decodeURIComponent(patientName),
          physician_id: selectedNurse.id,
          chief_complaint: formData.chiefComplaint,
          past_medical_conditions: formData.pastMedicalHistory,
          past_surgical_history: formData.pastSurgicalHistory,
          recent_hospitalization: formData.recentHospitalization,
          health_maintenance: formData.healthMaintenance,
          family_history: formData.familyHistory,
        });

      if (updateError) throw updateError;

      // Refresh history records
      const { data: newRecords } = await supabase
        .from("health_history")
        .select("*")
        .eq("full_name", decodeURIComponent(patientName))
        .order("created_at", { ascending: false });

      setHistoryRecords(newRecords || []);
      alert("Health history saved successfully!");
    } catch (error) {
      console.error("Error saving health history:", error);
      alert("Error saving health history. Please try again.");
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!patientName) {
      alert("No patient selected");
      return;
    }

    try {
      const { error } = await supabase
        .from("health_history")
        .delete()
        .eq("id", recordId);

      if (error) throw error;

      // Refresh the records list
      const { data: newRecords } = await supabase
        .from("health_history")
        .select("*")
        .eq("full_name", decodeURIComponent(patientName))
        .order("created_at", { ascending: false });

      setHistoryRecords(newRecords || []);
      alert("Record deleted successfully");
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Error deleting record. Please try again.");
    }
  };

  const handleFamilyHistoryChange = (condition: keyof FormData['familyHistory'], value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      familyHistory: {
        ...prev.familyHistory,
        [condition]: value
      }
    }));
  };

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
            <p className="mt-1 text-lg text-indigo-200">Health History</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form Section */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-indigo-700 px-8 py-5">
            <h2 className="text-2xl font-semibold text-white">
              Health History Form
            </h2>
            <span className="text-l text-gray-200">
              Select patient / Fill up the form
            </span>
          </div>
          <div className="p-8">
            {/* Patient Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Patient
                </label>
                <button
                  type="button"
                  onClick={() => router.push("/patient-information")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Patient
                </button>
              </div>
              <select
                value={selectedPatient}
                onChange={handlePatientChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a patient</option>
                {patients.map((patient) => (
                  <option key={patient.full_name} value={patient.full_name}>
                    {patient.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Patient Name
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {patientInfo.fullName || "Not selected"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Date of Service
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {patientInfo.dateOfService}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Nurse</p>
                <p className="text-lg font-semibold text-gray-900">
                  {patientInfo.physician || "Not selected"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Age</p>
                <p className="text-lg font-semibold text-gray-900">
                  {patientInfo.age || "Not available"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Gender</p>
                <p className="text-lg font-semibold text-gray-900">
                  {patientInfo.gender || "Not available"}
                </p>
              </div>
            </div>

            <div className="p-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Chief Complaint */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chief Complaint
                  </label>
                  <textarea
                    name="chiefComplaint"
                    value={formData.chiefComplaint}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    placeholder="Enter the primary reason for visit"
                  />
                </div>

                {/* Past Medical History */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Past Medical History
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="pastMedicalHistory.occasionalColds"
                        checked={formData.pastMedicalHistory.occasionalColds}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span>Occasional colds and cough</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="pastMedicalHistory.anemia"
                        checked={formData.pastMedicalHistory.anemia}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span>Mild iron-deficiency anemia</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        name="pastMedicalHistory.other"
                        value={formData.pastMedicalHistory.other}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Other conditions (please specify)"
                      />
                    </div>
                  </div>
                </div>

                {/* Past Surgical History */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Past Surgical History
                  </h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Have you ever had surgery?
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="pastSurgicalHistory.hadSurgery"
                          value="Yes"
                          checked={
                            formData.pastSurgicalHistory.hadSurgery === "Yes"
                          }
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="ml-2">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="pastSurgicalHistory.hadSurgery"
                          value="No"
                          checked={
                            formData.pastSurgicalHistory.hadSurgery === "No"
                          }
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="ml-2">No</span>
                      </label>
                    </div>
                  </div>

                  {formData.pastSurgicalHistory.hadSurgery === "Yes" && (
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-700">
                        If yes, please list:
                      </h4>
                      {formData.pastSurgicalHistory.surgeries.map(
                        (surgery, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
                          >
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type
                              </label>
                              <input
                                type="text"
                                value={surgery.type}
                                onChange={(e) =>
                                  handleSurgeryChange(
                                    index,
                                    "type",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Type of surgery"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Year
                              </label>
                              <input
                                type="text"
                                value={surgery.year}
                                onChange={(e) =>
                                  handleSurgeryChange(
                                    index,
                                    "year",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Year of surgery"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSurgery(index)}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        )
                      )}
                      <button
                        type="button"
                        onClick={addSurgery}
                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Add Another Surgery
                      </button>
                    </div>
                  )}
                </div>

                {/* Recent Hospitalization */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Recent Hospitalization
                  </h3>
                  <input
                    type="text"
                    name="recentHospitalization"
                    value={formData.recentHospitalization}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter recent hospitalization details"
                  />
                </div>

                {/* Health Maintenance */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Health Maintenance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Last Pediatric Checkup
                      </label>
                      <input
                        type="text"
                        name="healthMaintenance.lastPediatricCheckup"
                        value={formData.healthMaintenance.lastPediatricCheckup}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. December 2024"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Last CBC
                      </label>
                      <input
                        type="text"
                        name="healthMaintenance.lastCBC"
                        value={formData.healthMaintenance.lastCBC}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. February 2025"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Last Nutritional Assessment
                      </label>
                      <input
                        type="text"
                        name="healthMaintenance.lastNutritionalAssessment"
                        value={
                          formData.healthMaintenance.lastNutritionalAssessment
                        }
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. January 2025"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Last Vaccination
                      </label>
                      <input
                        type="text"
                        name="healthMaintenance.lastVaccination"
                        value={formData.healthMaintenance.lastVaccination}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. July 2024"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Last Deworming
                      </label>
                      <input
                        type="text"
                        name="healthMaintenance.lastDeworming"
                        value={formData.healthMaintenance.lastDeworming}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. August 2024"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Last Eye Exam
                      </label>
                      <input
                        type="text"
                        name="healthMaintenance.lastEyeExam"
                        value={formData.healthMaintenance.lastEyeExam}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. January 2025"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Glasses or contacts?
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="healthMaintenance.visionCorrection"
                          value="Glasses"
                          checked={
                            formData.healthMaintenance.visionCorrection ===
                            "Glasses"
                          }
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="ml-2">Glasses</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="healthMaintenance.visionCorrection"
                          value="Contacts"
                          checked={
                            formData.healthMaintenance.visionCorrection ===
                            "Contacts"
                          }
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="ml-2">Contacts</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="healthMaintenance.visionCorrection"
                          value="Both"
                          checked={
                            formData.healthMaintenance.visionCorrection ===
                            "Both"
                          }
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="ml-2">Both</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Medications */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    List all medications and supplements you have:
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Medicine or Supplement
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            How often?
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.healthMaintenance.medications.map(
                          (med, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={med.name}
                                  onChange={(e) =>
                                    handleMedicationChange(
                                      index,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                  placeholder="e.g. Ferrous Sulfate (Iron)"
                                />
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={med.frequency}
                                  onChange={(e) =>
                                    handleMedicationChange(
                                      index,
                                      "frequency",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                  placeholder="e.g. O.D"
                                />
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => removeMedication(index)}
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    onClick={addMedication}
                    className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Medication
                  </button>
                </div>

                {/* Family History Section */}
                <div className="bg-white mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Family History</h3>
                  <p className="text-sm text-gray-600 mb-4">Select all that applies:</p>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.familyHistory.diabetes}
                        onChange={(e) => handleFamilyHistoryChange('diabetes', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Diabetes</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.familyHistory.hypertension}
                        onChange={(e) => handleFamilyHistoryChange('hypertension', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Hypertension</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.familyHistory.asthma}
                        onChange={(e) => handleFamilyHistoryChange('asthma', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Asthma</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.familyHistory.heartDisease}
                        onChange={(e) => handleFamilyHistoryChange('heartDisease', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Heart Disease</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.familyHistory.cancer}
                        onChange={(e) => handleFamilyHistoryChange('cancer', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Cancer</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.familyHistory.stroke}
                        onChange={(e) => handleFamilyHistoryChange('stroke', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Stroke</span>
                    </label>

                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.familyHistory.other}
                          onChange={(e) => handleFamilyHistoryChange('other', e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Others:</span>
                      </label>
                      <input
                        type="text"
                        value={formData.familyHistory.otherDetails}
                        onChange={(e) => handleFamilyHistoryChange('otherDetails', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Specify other conditions"
                        disabled={!formData.familyHistory.other}
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="border-t border-gray-200 pt-8 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => router.push(`/`)}
                    className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save Health History
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-lg shadow mt-8">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Health History Records</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Nurse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Chief Complaint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Medical Conditions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Surgical History
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Family History
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Recent Hospitalization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historyRecords.map((record) => {
                  const medicalConditions = [];
                  if (record.past_medical_conditions.occasionalColds)
                    medicalConditions.push("Occasional Colds");
                  if (record.past_medical_conditions.anemia)
                    medicalConditions.push("Anemia");
                  if (record.past_medical_conditions.other)
                    medicalConditions.push(record.past_medical_conditions.other);

                  const surgeries = record.past_surgical_history.surgeries
                    .filter((surgery) => surgery.type && surgery.year)
                    .map((surgery) => `${surgery.type} (${surgery.year})`);

                  const familyHistory = [];
                  if (record.family_history.diabetes) familyHistory.push("Diabetes");
                  if (record.family_history.hypertension) familyHistory.push("Hypertension");
                  if (record.family_history.asthma) familyHistory.push("Asthma");
                  if (record.family_history.heartDisease) familyHistory.push("Heart Disease");
                  if (record.family_history.cancer) familyHistory.push("Cancer");
                  if (record.family_history.stroke) familyHistory.push("Stroke");
                  if (record.family_history.other && record.family_history.otherDetails) 
                    familyHistory.push(record.family_history.otherDetails);

                  return (
                    <tr
                      key={record.id}
                      className={cn(
                        "hover:bg-gray-50 cursor-pointer",
                        selectedRecord?.id === record.id && "bg-blue-50"
                      )}
                      onClick={() => handleViewRecord(record)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.created_at).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {selectedNurse
                          ? `${selectedNurse.full_name}, ${selectedNurse.position}`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.chief_complaint}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {medicalConditions.length > 0
                          ? medicalConditions.join(", ")
                          : "None"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {surgeries.length > 0 ? surgeries.join(", ") : "None"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {familyHistory.length > 0 ? familyHistory.join(", ") : "None"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.recent_hospitalization || "None"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              window.confirm(
                                "Are you sure you want to delete this record?"
                              )
                            ) {
                              handleDeleteRecord(record.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
