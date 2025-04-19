"use client";
import React, { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/app/context/SessionContext";

interface MedicationRecord {
  id: string;
  full_name: string;
  physician_id: string;
  physician_name: string;
  date_of_service: string;
  created_at: string;
  medications: Array<{
    name: string;
    startDate: string;
    endDate: string;
    timeIntervals: string[];
    administrations: Array<{
      [key: string]: string;
    }>;
  }>;
}

export default function MedicationAdministrationWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MedicationAdministrationPage />
    </Suspense>
  );
}

function MedicationAdministrationPage() {
  const searchParams = useSearchParams();
  const patientName = searchParams.get("patient");
  const router = useRouter();
  const { selectedNurse } = useSession();

  const [patientInfo, setPatientInfo] = useState({
    fullName: "",
    dateOfService: new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    physician: selectedNurse
      ? `${selectedNurse.full_name}, ${selectedNurse.position}`
      : "",
    age: "",
    gender: "",
  });

  const [patients, setPatients] = useState<Array<{ full_name: string }>>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [historyRecords, setHistoryRecords] = useState<MedicationRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicationRecord | null>(
    null
  );
  const [allergies, setAllergies] = useState("");
  const [adverseDrugEffects, setAdverseDrugEffects] = useState("");

  const [medications, setMedications] = useState([
    {
      name: "",
      startDate: "",
      endDate: "",
      administrations: Array(7).fill({ time: "", status: "" }),
      timeIntervals: ["08:00"], // Default time interval
    },
  ]);

  // Fetch patient data
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
            .eq("full_name", decodeURIComponent(patientName))
            .single();

          if (patientError) throw patientError;

          if (patientData) {
            setPatientInfo((prev) => ({
              ...prev,
              fullName: patientData.full_name,
              age: patientData.age,
              gender: patientData.gender,
            }));
            setSelectedPatient(patientData.full_name);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [patientName]);

  // Fetch history records when patient changes
  useEffect(() => {
    if (patientName) {
      fetchHistoryRecords();
    }
  }, [patientName]);

  const fetchHistoryRecords = async () => {
    if (!patientName) return;

    try {
      const { data, error } = await supabase
        .from("medication_administration_records")
        .select("*")
        .eq("full_name", decodeURIComponent(patientName))
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistoryRecords(data || []);
    } catch (error) {
      console.error("Error fetching history records:", error);
    }
  };

  const handleViewRecord = (record: MedicationRecord) => {
    setSelectedRecord(record);
    setMedications(record.medications);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewRecord = () => {
    setSelectedRecord(null);
    setAllergies("");
    setAdverseDrugEffects("");
    setMedications([
      {
        name: "",
        startDate: "",
        endDate: "",
        administrations: Array(7).fill({ time: "", status: "" }),
        timeIntervals: ["08:00"],
      },
    ]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this record? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("medication_administration_records")
        .delete()
        .eq("id", recordId);

      if (error) throw error;

      alert("Record deleted successfully!");
      await fetchHistoryRecords();
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Error deleting record. Please try again.");
    }
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedPatient(selectedName);
    if (selectedName) {
      router.push(
        `/medication-admin?patient=${encodeURIComponent(selectedName)}`
      );
    } else {
      router.push("/medication-admin");
    }
  };

  const handleNewPatient = () => {
    router.push("/patient-information");
  };

  const generateDates = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      dates.push(
        currentDate.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit",
        })
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const handleMedicationChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedMeds = [...medications];
    updatedMeds[index] = {
      ...updatedMeds[index],
      [field]: value,
      administrations:
        field === "startDate" || field === "endDate"
          ? Array(
              generateDates(
                field === "startDate" ? value : updatedMeds[index].startDate,
                field === "endDate" ? value : updatedMeds[index].endDate
              ).length
            ).fill({})
          : updatedMeds[index].administrations,
    };
    setMedications(updatedMeds);
  };

  const handleAdminChange = (
    medIndex: number,
    adminIndex: number,
    timeIndex: number,
    value: string
  ) => {
    const updatedMeds = [...medications];
    const newAdministrations = [...updatedMeds[medIndex].administrations];
    newAdministrations[adminIndex] = {
      ...newAdministrations[adminIndex],
      [`status_${timeIndex}`]: value,
    };
    updatedMeds[medIndex] = {
      ...updatedMeds[medIndex],
      administrations: newAdministrations,
    };
    setMedications(updatedMeds);
  };

  const handleTimeIntervalChange = (
    medIndex: number,
    timeIndex: number,
    value: string
  ) => {
    const updatedMeds = [...medications];
    const newTimeIntervals = [...updatedMeds[medIndex].timeIntervals];
    newTimeIntervals[timeIndex] = value;
    updatedMeds[medIndex] = {
      ...updatedMeds[medIndex],
      timeIntervals: newTimeIntervals,
    };
    setMedications(updatedMeds);
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      {
        name: "",
        startDate: "",
        endDate: "",
        administrations: Array(7).fill({ time: "", status: "" }),
        timeIntervals: ["08:00"], // Default time interval
      },
    ]);
  };

  const removeMedication = (index: number) => {
    const updatedMeds = [...medications];
    updatedMeds.splice(index, 1);
    setMedications(updatedMeds);
  };

  const addTimeInterval = (medIndex: number) => {
    const updatedMeds = [...medications];
    const newTimeIntervals = [...updatedMeds[medIndex].timeIntervals, "08:00"];
    updatedMeds[medIndex] = {
      ...updatedMeds[medIndex],
      timeIntervals: newTimeIntervals,
    };
    setMedications(updatedMeds);
  };

  const removeTimeInterval = (medIndex: number, timeIndex: number) => {
    const updatedMeds = [...medications];
    const newTimeIntervals = [...updatedMeds[medIndex].timeIntervals];
    newTimeIntervals.splice(timeIndex, 1);
    updatedMeds[medIndex] = {
      ...updatedMeds[medIndex],
      timeIntervals: newTimeIntervals,
    };
    setMedications(updatedMeds);
  };

  const dates = [
    "03/28/25",
    "03/29/25",
    "03/30/25",
    "03/31/25",
    "04/01/25",
    "04/02/25",
    "04/03/25",
  ];
  const times = ["6 AM", "8 AM", "12 PM", "2 PM", "6 PM", "8 PM", "10 PM"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedNurse) {
      alert("Please select a nurse/physician first");
      return;
    }

    if (!patientInfo.fullName) {
      alert("Please select a patient first");
      return;
    }

    try {
      const submissionData = {
        full_name: patientInfo.fullName,
        physician_id: selectedNurse.id,
        physician_name: `${selectedNurse.full_name}, ${selectedNurse.position}`,
        date_of_service: new Date().toISOString().split("T")[0],
        medications: medications.map((med) => ({
          name: med.name,
          startDate: med.startDate,
          endDate: med.endDate,
          timeIntervals: med.timeIntervals,
          administrations: med.administrations,
        })),
        allergies: allergies,
        adverse_drug_effects: adverseDrugEffects,
      };

      const { error } = await supabase
        .from("medication_administration_records")
        .upsert([submissionData]);

      if (error) throw error;

      alert("Medication administration record saved successfully");
      await fetchHistoryRecords();
      handleNewRecord();
    } catch (error) {
      console.error("Error saving medication administration:", error);
      alert("Failed to save medication administration record");
    }
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
            <p className="mt-1 text-lg text-indigo-200">
              Medication Administration
            </p>
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Form Header */}
            <div className="bg-indigo-700 px-8 py-5">
              <h2 className="text-2xl font-semibold text-white">
                MEDICATION ADMINISTRATION RECORD
              </h2>
              <span className="text-sm text-gray-200">
                To navigate the Medication Administration Record (MAR), start by
                filling in the patient&apos;s basic details at the top (name,
                date of birth, age, sex, month, and year). Then, select the
                appropriate code (GN, NG, DL, DC) for each medication time slot
                under the corresponding date and time, based on whether the drug
                was given, not given, delayed, or discontinued. Be sure to
                verify the drug name and treatment dates before saving or
                updating the record.
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
                    onClick={handleNewPatient}
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

              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                  <p className="text-sm font-medium text-gray-500">Physician</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patientInfo.physician}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patientInfo.age || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {patientInfo.gender || "Not specified"}
                  </p>
                </div>
              </div>

              {/* Legends */}
              <div className="p-4 bg-gray-100 border-b">
                <h3 className="font-medium mb-2">
                  Direction: Change the code of the administration box (ADM)
                  based on the actions taken (see the legends below)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 border border-gray-300 flex items-center justify-center mr-2">
                      GN
                    </div>
                    <span>Given</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 border border-gray-300 flex items-center justify-center mr-2">
                      NG
                    </div>
                    <span>Not Given</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 border border-gray-300 flex items-center justify-center mr-2">
                      DL
                    </div>
                    <span>Delayed</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 border border-gray-300 flex items-center justify-center mr-2">
                      DC
                    </div>
                    <span>Discontinued</span>
                  </div>
                </div>
              </div>

              {/* Medications Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                        MEDICATIONS
                      </th>
                      {medications[0]?.startDate && medications[0]?.endDate ? (
                        generateDates(
                          medications[0].startDate,
                          medications[0].endDate
                        ).map((date, index) => (
                          <th
                            key={index}
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                          >
                            {date}
                            <div className="text-xs font-normal">DATE</div>
                          </th>
                        ))
                      ) : (
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                          Please set start and end dates
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {medications.map((med, medIndex) => (
                      <React.Fragment key={`medication-${medIndex}`}>
                        <tr className="border-b">
                          <td className="px-6 py-4 whitespace-nowrap border-r">
                            <div className="mb-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Drug Name
                              </label>
                              <input
                                type="text"
                                value={med.name}
                                onChange={(e) =>
                                  handleMedicationChange(
                                    medIndex,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="mt-1 p-2 border border-gray-300 rounded w-full"
                                placeholder="Enter drug name"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Start Date
                                </label>
                                <input
                                  type="date"
                                  value={med.startDate}
                                  onChange={(e) =>
                                    handleMedicationChange(
                                      medIndex,
                                      "startDate",
                                      e.target.value
                                    )
                                  }
                                  className="mt-1 p-2 border border-gray-300 rounded w-full"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  End Date
                                </label>
                                <input
                                  type="date"
                                  value={med.endDate}
                                  onChange={(e) =>
                                    handleMedicationChange(
                                      medIndex,
                                      "endDate",
                                      e.target.value
                                    )
                                  }
                                  className="mt-1 p-2 border border-gray-300 rounded w-full"
                                />
                              </div>
                            </div>
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700">
                                Administration Times
                              </label>
                              <div className="space-y-2">
                                {med.timeIntervals.map((time, timeIndex) => (
                                  <div
                                    key={`time-${medIndex}-${timeIndex}`}
                                    className="flex items-center space-x-2"
                                  >
                                    <input
                                      type="time"
                                      value={time}
                                      onChange={(e) =>
                                        handleTimeIntervalChange(
                                          medIndex,
                                          timeIndex,
                                          e.target.value
                                        )
                                      }
                                      className="p-1 border border-gray-300 rounded"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeTimeInterval(medIndex, timeIndex)
                                      }
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addTimeInterval(medIndex)}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  Add Time
                                </button>
                              </div>
                            </div>
                          </td>
                          {medications[0]?.startDate && medications[0]?.endDate
                            ? generateDates(
                                medications[0].startDate,
                                medications[0].endDate
                              ).map((_, adminIndex) => (
                                <td
                                  key={`admin-${medIndex}-${adminIndex}`}
                                  className="px-6 py-4 whitespace-nowrap border-r"
                                >
                                  <div className="flex flex-col space-y-2">
                                    {med.timeIntervals.map(
                                      (time, timeIndex) => (
                                        <div
                                          key={`time-${timeIndex}`}
                                          className="flex items-center"
                                        >
                                          <div className="w-16 mr-2">
                                            {time}
                                          </div>
                                          <select
                                            value={
                                              med.administrations[adminIndex]?.[
                                                `status_${timeIndex}`
                                              ] || ""
                                            }
                                            onChange={(e) =>
                                              handleAdminChange(
                                                medIndex,
                                                adminIndex,
                                                timeIndex,
                                                e.target.value
                                              )
                                            }
                                            className="p-1 border border-gray-300 rounded"
                                          >
                                            <option value=""></option>
                                            <option value="GN">GN</option>
                                            <option value="NG">NG</option>
                                            <option value="DL">DL</option>
                                            <option value="DC">DC</option>
                                          </select>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </td>
                              ))
                            : null}
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
                      </React.Fragment>
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

              {/* Allergies and Reactions */}
              <div className="p-6 bg-gray-50 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergies
                    </label>
                    <textarea
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      className="mt-1 p-2 border border-gray-300 rounded w-full h-24"
                      placeholder="Enter any allergies"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adverse Drug Reactions
                    </label>
                    <textarea
                      value={adverseDrugEffects}
                      onChange={(e) => setAdverseDrugEffects(e.target.value)}
                      className="mt-1 p-2 border border-gray-300 rounded w-full h-24"
                      placeholder="Enter any adverse drug reactions"
                    />
                  </div>
                </div>

                {/* Iron Supplements Section */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Taking Iron Supplements
                  </label>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="ironYes"
                        name="ironSupplements"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <label
                        htmlFor="ironYes"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Yes
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="ironNo"
                        name="ironSupplements"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <label
                        htmlFor="ironNo"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        No
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => router.push(`/`)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Assessment
                </button>
              </div>
            </div>
          </form>

          {/* History Records Table */}
          {historyRecords.length > 0 && (
            <div className="mt-8 ">
              <div className="flex justify-between items-center mb-4 px-8">
                <h2 className="text-lg font-semibold text-gray-900">
                  Assessment History
                </h2>
                <button
                  onClick={handleNewRecord}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  New Record
                </button>
              </div>
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nurse/Physician
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historyRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.physician_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewRecord(record)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
