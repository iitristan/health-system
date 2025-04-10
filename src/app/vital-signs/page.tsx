"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

interface VitalSign {
  dateTime: string;
  bloodPressure: string;
  temperature: number;
  pulseRate: number;
  respirationRate: number;
  weight: number;
  height: number;
  oxygen: number;
  painScale: number;
  comments: string;
}

interface NewVitalSign {
  bloodPressure: string;
  temperature: string;
  pulseRate: string;
  respirationRate: string;
  weight: string;
  height: string;
  oxygen: string;
  painScale: string;
  comments: string;
}

export default function VitalSignsWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VitalSignsPage />
    </Suspense>
  );
}

function VitalSignsPage() {
  const searchParams = useSearchParams();
  const patientName = searchParams.get("patient");
  const router = useRouter();

  const [patientInfo, setPatientInfo] = useState({
    fullName: "",
    dateToday: new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    physician: "",
    admissionHeight: "",
    admissionWeight: "",
  });

  const [patients, setPatients] = useState<Array<{ full_name: string }>>([]);
  const [selectedPatient, setSelectedPatient] = useState("");

  // Fetch all patients and patient info
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all patients for the dropdown
        const { data: patientsData, error: patientsError } = await supabase
          .from("patients")
          .select("full_name")
          .order("full_name");

        if (patientsError) throw patientsError;
        setPatients(patientsData || []);

        // If patient name is in URL, fetch their info
        if (patientName) {
          const { data: patientData, error: patientError } = await supabase
            .from("patients")
            .select("*")
            .eq("full_name", patientName)
            .single();

          if (patientError) throw patientError;

          if (patientData) {
            setPatientInfo(prev => ({
              ...prev,
              fullName: patientData.full_name,
              physician: "Dr. Alena Santos, Pediatrician",
            }));
            setSelectedPatient(patientData.full_name);

            // Fetch existing vital signs data
            const { data: vitalSignsData, error: vitalSignsError } = await supabase
              .from("vital_signs")
              .select("*")
              .eq("full_name", patientName)
              .order("created_at", { ascending: false });

            if (vitalSignsError) throw vitalSignsError;

            if (vitalSignsData) {
              setVitalSigns(
                vitalSignsData.map((record) => ({
                  dateTime: new Date(record.created_at).toLocaleString(),
                  bloodPressure: `${record.blood_pressure_systolic}/${record.blood_pressure_diastolic}`,
                  temperature: record.temperature,
                  pulseRate: record.pulse_rate,
                  respirationRate: record.respiratory_rate,
                  weight: record.weight,
                  height: record.height,
                  oxygen: record.oxygen_saturation,
                  painScale: record.pain_level,
                  comments: record.notes,
                }))
              );
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [patientName]);

  // State for vital signs records
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([]);

  // State for new entry
  const [newEntry, setNewEntry] = useState<NewVitalSign>({
    bloodPressure: "",
    temperature: "",
    pulseRate: "",
    respirationRate: "",
    weight: "",
    height: "",
    oxygen: "",
    painScale: "",
    comments: "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEntry((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!patientName) {
      setError("Please select a patient before saving vital signs.");
      return;
    }

    try {
      // Parse blood pressure
      const [systolic, diastolic] = newEntry.bloodPressure
        .split("/")
        .map(Number);

      // Validate height and weight
      const height = parseFloat(newEntry.height);
      const weight = parseFloat(newEntry.weight);

      if (height > 999.99) {
        setError("Height must be less than 1000 cm. Please enter a valid height.");
        return;
      }

      if (weight > 999.99) {
        setError("Weight must be less than 1000 kg. Please enter a valid weight.");
        return;
      }

      // Insert vital signs data
      const { error: insertError } = await supabase.from("vital_signs").insert([
        {
          full_name: patientName,
          blood_pressure_systolic: systolic,
          blood_pressure_diastolic: diastolic,
          temperature: parseFloat(newEntry.temperature),
          pulse_rate: parseInt(newEntry.pulseRate),
          respiratory_rate: parseInt(newEntry.respirationRate),
          oxygen_saturation: parseInt(newEntry.oxygen),
          height: height,
          weight: weight,
          pain_level: parseInt(newEntry.painScale),
          notes: newEntry.comments,
        },
      ]);

      if (insertError) {
        if (insertError.message.includes("numeric field overflow")) {
          setError(" Height values is too small. Please check your entries and try again.");
        } else {
          setError(`Error saving vital signs: ${insertError.message}`);
        }
        return;
      }

      // Fetch updated vital signs data
      const { data: vitalSignsData, error: fetchError } = await supabase
        .from("vital_signs")
        .select("*")
        .eq("full_name", patientName)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      if (vitalSignsData) {
        setVitalSigns(
          vitalSignsData.map((record) => ({
            dateTime: new Date(record.created_at).toLocaleString(),
            bloodPressure: `${record.blood_pressure_systolic}/${record.blood_pressure_diastolic}`,
            temperature: record.temperature,
            pulseRate: record.pulse_rate,
            respirationRate: record.respiratory_rate,
            weight: record.weight,
            height: record.height,
            oxygen: record.oxygen_saturation,
            painScale: record.pain_level,
            comments: record.notes,
          }))
        );
      }

      // Clear form
      setNewEntry({
        bloodPressure: "",
        temperature: "",
        pulseRate: "",
        respirationRate: "",
        weight: "",
        height: "",
        oxygen: "",
        painScale: "",
        comments: "",
      });

      alert("Vital signs saved successfully!");
    } catch (error) {
      console.error("Error saving vital signs:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedPatient(selectedName);
    if (selectedName) {
      router.push(`/vital-signs?patient=${encodeURIComponent(selectedName)}`);
    } else {
      router.push('/vital-signs');
    }
  };

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
            <p className="mt-1 text-lg text-indigo-200">Vital Signs</p>
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Form Header */}
          <div className="bg-indigo-700 px-8 py-5">
            <h2 className="text-2xl font-semibold text-white">
              Vital Signs Form
            </h2>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Patient Selection */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Patient
                  </label>
                  <button
                    type="button"
                    onClick={() => router.push('/patient-information')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div>
                  <p className="text-sm font-medium text-gray-500">Patient Name</p>
                  <p className="text-lg font-semibold text-gray-900">{patientInfo.fullName || 'Not selected'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date of Service</p>
                  <p className="text-lg font-semibold text-gray-900">{patientInfo.dateToday}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Physician</p>
                  <p className="text-lg font-semibold text-gray-900">{patientInfo.physician}</p>
                </div>
              </div>

              {/* Vital Signs Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Vital Signs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Pressure
                    </label>
                    <input
                      type="text"
                      name="bloodPressure"
                      value={newEntry.bloodPressure}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 120/80"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temperature
                    </label>
                    <input
                      type="number"
                      name="temperature"
                      value={newEntry.temperature}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="°C"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pulse Rate
                    </label>
                    <input
                      type="number"
                      name="pulseRate"
                      value={newEntry.pulseRate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="bpm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Respiration Rate
                    </label>
                    <input
                      type="number"
                      name="respirationRate"
                      value={newEntry.respirationRate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="breaths/min"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={newEntry.height}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter height in cm (max 999.99)"
                      step="0.01"
                      max="999.99"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={newEntry.weight}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter weight in kg (max 999.99)"
                      step="0.01"
                      max="999.99"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Oxygen Saturation
                    </label>
                    <input
                      type="number"
                      name="oxygen"
                      value={newEntry.oxygen}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="%"
                      required
                    />
                  </div>
                  <div className="col-span-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comments
                    </label>
                    <input
                      type="text"
                      name="comments"
                      value={newEntry.comments}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="submit"
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Vital Signs
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/health-assessment?patient=${encodeURIComponent(patientName || '')}`)}
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Continue to Health Assessment
                </button>
              </div>
            </form>

            {/* Vital Signs History */}
            <div className="mt-8 overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Vital Signs History
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Blood Pressure (mmHg)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Temperature
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pulse Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Respiration Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Weight
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Height
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Oxygen
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comments
                        </th>
                      </tr>
                      <tr className="bg-gray-100">
                        <th className="px-6 py-2 text-left text-xs text-gray-500"></th>
                        <th className="px-6 py-2 text-left text-xs text-gray-500"></th>
                        <th className="px-6 py-2 text-left text-xs text-gray-500">
                          °C
                        </th>
                        <th className="px-6 py-2 text-left text-xs text-gray-500">
                          bpm
                        </th>
                        <th className="px-6 py-2 text-left text-xs text-gray-500">
                          breaths/min
                        </th>
                        <th className="px-6 py-2 text-left text-xs text-gray-500">
                          kg
                        </th>
                        <th className="px-6 py-2 text-left text-xs text-gray-500">
                          cm
                        </th>
                        <th className="px-6 py-2 text-left text-xs text-gray-500">
                          %
                        </th>
                        <th className="px-6 py-2 text-left text-xs text-gray-500"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vitalSigns.map((record, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {record.dateTime}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {record.bloodPressure} mmHg
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {record.temperature}°C
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {record.pulseRate} bpm
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {record.respirationRate} breaths/min
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {record.weight} kg
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {record.height} cm
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {record.oxygen} %
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {record.comments}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
