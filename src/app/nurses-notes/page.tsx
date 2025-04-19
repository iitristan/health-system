"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/app/context/SessionContext";
import { Suspense } from "react";

interface FormData {
  clientName: string;
  dateOfBirth: string;
  dateOfService: string;
  physician: string;
  documentationTo: string;
  assessmentTimeFrame: {
    admission: boolean;
    weekly: boolean;
    changeInCondition: boolean;
    quarterly: boolean;
  };
  riskLevel: {
    highRisk: boolean;
    lowRisk: boolean;
  };
  documentationMethod: {
    email: boolean;
    fax: boolean;
    hardCopy: boolean;
  };
}

interface NursesNotesRecord {
  id: string;
  full_name: string;
  physician_id: string;
  physician_name: string;
  date_of_service: string;
  created_at: string;
  documentation_to: string;
  assessment_time_frame: string;
  risk_level: string;
  documentation_method: string;
}

const NurseNotesPage: NextPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NurseNotesPageContent />
    </Suspense>
  );
};
const NurseNotesPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientName = searchParams.get("patient");
  const { selectedNurse } = useSession();
  const [formData, setFormData] = useState<FormData>({
    clientName: "Charlene Olayvar",
    dateOfBirth: "",
    dateOfService: new Date().toISOString().split("T")[0],
    physician: selectedNurse
      ? `${selectedNurse.full_name}, ${selectedNurse.position}`
      : "",
    documentationTo: "",
    assessmentTimeFrame: {
      admission: false,
      weekly: false,
      changeInCondition: false,
      quarterly: false,
    },
    riskLevel: {
      highRisk: false,
      lowRisk: false,
    },
    documentationMethod: {
      email: false,
      fax: false,
      hardCopy: true,
    },
  });

  const [patientInfo, setPatientInfo] = useState({
    fullName: "",
    dateToday: new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    age: "",
    gender: "",
  });

  const [patients, setPatients] = useState<Array<{ full_name: string }>>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [historyRecords, setHistoryRecords] = useState<NursesNotesRecord[]>([]);
  const [selectedRecord, setSelectedRecord] =
    useState<NursesNotesRecord | null>(null);

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

  // Update physician when selectedNurse changes
  useEffect(() => {
    if (selectedNurse) {
      setFormData((prev) => ({
        ...prev,
        physician: `${selectedNurse.full_name}, ${selectedNurse.position}`,
      }));
    }
  }, [selectedNurse]);

  // Add fetchHistoryRecords function
  const fetchHistoryRecords = async () => {
    if (!selectedPatient) return;

    try {
      const { data, error } = await supabase
        .from("nurses_notes_records")
        .select("*")
        .eq("full_name", selectedPatient)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistoryRecords(data || []);
    } catch (error) {
      console.error("Error fetching history records:", error);
    }
  };

  // Add handleViewRecord function
  const handleViewRecord = (record: NursesNotesRecord) => {
    setSelectedRecord(record);
    setFormData((prev) => ({
      ...prev,
      dateOfService: record.date_of_service,
      documentationTo: record.documentation_to || "",
      assessmentTimeFrame: {
        admission: record.assessment_time_frame?.includes("admission") || false,
        weekly: record.assessment_time_frame?.includes("weekly") || false,
        changeInCondition:
          record.assessment_time_frame?.includes("changeInCondition") || false,
        quarterly: record.assessment_time_frame?.includes("quarterly") || false,
      },
      riskLevel: {
        highRisk: record.risk_level?.includes("highRisk") || false,
        lowRisk: record.risk_level?.includes("lowRisk") || false,
      },
      documentationMethod: {
        email: record.documentation_method?.includes("email") || false,
        fax: record.documentation_method?.includes("fax") || false,
        hardCopy: record.documentation_method?.includes("hardCopy") || false,
      },
    }));
  };

  // Add handleDeleteRecord function
  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      const { error } = await supabase
        .from("nurses_notes_records")
        .delete()
        .eq("id", recordId);

      if (error) throw error;
      await fetchHistoryRecords();
      if (selectedRecord?.id === recordId) {
        setSelectedRecord(null);
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Failed to delete record. Please try again.");
    }
  };

  // Add handleNewRecord function
  const handleNewRecord = () => {
    setSelectedRecord(null);
    setFormData((prev) => ({
      ...prev,
      dateOfService: new Date().toISOString().split("T")[0],
      documentationTo: "",
      assessmentTimeFrame: {
        admission: false,
        weekly: false,
        changeInCondition: false,
        quarterly: false,
      },
      riskLevel: {
        highRisk: false,
        lowRisk: false,
      },
      documentationMethod: {
        email: false,
        fax: false,
        hardCopy: true,
      },
    }));
  };

  // Update useEffect to fetch history records when patient changes
  useEffect(() => {
    if (selectedPatient) {
      fetchHistoryRecords();
    }
  }, [selectedPatient]);

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientName = e.target.value;
    setSelectedPatient(patientName);
    router.push(`/nurses-notes?patient=${encodeURIComponent(patientName)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      alert("Please select a patient first");
      return;
    }

    if (!selectedNurse) {
      alert("Please select a nurse first");
      return;
    }

    // Validate date_of_service
    if (!formData.dateOfService) {
      alert("Please enter a valid date of service");
      return;
    }

    // Transform assessmentTimeFrame object into a string
    const assessmentTimeFrameStr = Object.entries(formData.assessmentTimeFrame)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(", ");

    // Transform riskLevel object into a string
    const riskLevelStr = Object.entries(formData.riskLevel)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(", ");

    // Transform documentationMethod object into a string
    const documentationMethodStr = Object.entries(formData.documentationMethod)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(", ");

    const submissionData = {
      full_name: selectedPatient,
      physician_id: selectedNurse.id,
      physician_name: `${selectedNurse.full_name}, ${selectedNurse.position}`,
      date_of_service: formData.dateOfService,
      documentation_to: formData.documentationTo,
      assessment_time_frame: assessmentTimeFrameStr || null,
      risk_level: riskLevelStr || null,
      documentation_method: documentationMethodStr || null,
    };

    try {
      const { error } = await supabase
        .from("nurses_notes_records")
        .upsert([submissionData]);

      if (error) throw error;

      alert("Notes saved successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving notes:", error);
      alert("Failed to save notes. Please try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
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
            <p className="mt-1 text-lg text-indigo-200">Nurse&apos;s Notes</p>
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
          <div className="bg-indigo-700 px-8 py-5">
            <h2 className="text-2xl font-semibold text-white">
              Nurse&apos;s Notes Form
            </h2>
            <p className="text-gray-200 text-sm">
              {" "}
              In using the Nurse&apos;s notes tab, begin by entering the
              client&apos;s basic information, including the date of birth and
              date of service. Record the attending physician&apos;s name or
              initial and indicate the nature of the request by checking the
              appropriate boxes under &quot;Request Related To,&quot; such as
              whether it concerns medical content or tasks to be completed.
              Specify where the documentation should be sent and assess the
              client&apos;s level of risk by selecting either &quot;High
              Risk&quot; or &quot;Low Risk.&quot; In the &quot;Assessment Time
              Frame&quot; section, choose the applicable category—such as
              admission, weekly, change in condition, or quarterly—to reflect
              the timing or reason for the assessment. Indicate how the
              documentation should be returned by selecting a method, such as
              email, fax, or hard copy. Lastly, document all the findings by
              category such as Skin Assessment, Hair Assessment, and Nail
              Assessment, to ensure a thorough and targeted examination.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Patient Selection */}
            <div className="px-8 mt-2">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Patient
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/patient-information?returnTo=/health-assessment`
                      )
                    }
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                    {patientInfo.dateToday}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Physician</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedNurse
                      ? `${selectedNurse.full_name}, ${selectedNurse.position}`
                      : "Not selected"}
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
            </div>

            <div className="px-8 space-y-10">
              <section>
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">
                  Documentation Details
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Documentation to be sent back to
                    </label>
                    <input
                      type="text"
                      name="documentationTo"
                      value={formData.documentationTo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Level of Risk
                    </label>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="riskLevel.highRisk"
                          checked={formData.riskLevel.highRisk}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-700">High Risk</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="riskLevel.lowRisk"
                          checked={formData.riskLevel.lowRisk}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-700">Low Risk</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Assessment Time Frame
                    </label>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="assessmentTimeFrame.admission"
                          checked={formData.assessmentTimeFrame.admission}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-700">Admission</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="assessmentTimeFrame.weekly"
                          checked={formData.assessmentTimeFrame.weekly}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-700">Weekly</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="assessmentTimeFrame.changeInCondition"
                          checked={
                            formData.assessmentTimeFrame.changeInCondition
                          }
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-700">
                          Change in Condition
                        </span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="assessmentTimeFrame.quarterly"
                          checked={formData.assessmentTimeFrame.quarterly}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-700">Quarterly</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Documentation Method
                    </label>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="documentationMethod.email"
                          checked={formData.documentationMethod.email}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-700">Email</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="documentationMethod.fax"
                          checked={formData.documentationMethod.fax}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-700">Fax</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="documentationMethod.hardCopy"
                          checked={formData.documentationMethod.hardCopy}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-700">Hard Copy</span>
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">
                  Parts to be Assessed
                </h3>
                <div className="space-y-4">
                  <a
                    href={`/health-assessment?patient=${encodeURIComponent(
                      selectedPatient
                    )}`}
                    className="block text-indigo-600 hover:text-indigo-800"
                  >
                    Skin Assessment
                  </a>
                  <a
                    href={`/health-assessment?patient=${encodeURIComponent(
                      selectedPatient
                    )}`}
                    className="block text-indigo-600 hover:text-indigo-800"
                  >
                    Hair Assessment
                  </a>
                  <a
                    href={`/health-assessment?patient=${encodeURIComponent(
                      selectedPatient
                    )}`}
                    className="block text-indigo-600 hover:text-indigo-800"
                  >
                    Nail Assessment
                  </a>
                </div>
              </section>

              <div className="border-t border-gray-200 pt-8 flex justify-end space-x-4 mb-4">
                <button
                  type="button"
                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => router.push(`/health-assessment`)}
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

          {/* History Table */}
          {historyRecords.length > 0 && (
            <div className="px-8 py-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Assessment History
                </h2>
                <button
                  onClick={handleNewRecord}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  New Record
                </button>
              </div>
              <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                        Nurse/Physician
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historyRecords.map((record) => (
                      <tr
                        key={record.id}
                        className={
                          selectedRecord?.id === record.id ? "bg-indigo-50" : ""
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(
                            record.date_of_service
                          ).toLocaleDateString()}{" "}
                          at {new Date(record.created_at).toLocaleTimeString()}
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
                              View Record
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
};

export default NurseNotesPage;
