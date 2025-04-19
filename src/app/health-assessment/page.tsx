"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Suspense } from "react";
import { useSession } from "@/app/context/SessionContext";

interface FormData {
  dob: string;
  dateOfService: string;
  requestRelated: string[];
  documentationSentTo: string;
  riskLevel: string;
  assessmentTimeFrame: string;
  sentBy: string[];
  physician: string;
  [key: string]: string | string[] | Record<string, boolean>;
}

const initialFormData: FormData = {
  dob: "",
  dateOfService: "",
  requestRelated: [],
  documentationSentTo: "",
  riskLevel: "",
  assessmentTimeFrame: "",
  sentBy: ["Hard Copy"],
  physician: "",
};

export default function HealthAssessmentWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HealthAssessmentPage />
    </Suspense>
  );
}

function HealthAssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientName = searchParams.get("patient");
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
      : "N/A",
    age: "",
    gender: "",
  });

  const [patients, setPatients] = useState<Array<{ full_name: string }>>([]);
  const [selectedPatient, setSelectedPatient] = useState("");

  // State management for all form fields
  const [formData, setFormData] = useState<FormData>(initialFormData);

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

        // If patient name is in URL, fetch their info and health assessment
        if (patientName) {
          // Fetch patient info
          const { data: patientData, error: patientError } = await supabase
            .from("patients")
            .select("full_name, age, gender")
            .eq("full_name", decodeURIComponent(patientName))
            .single();

          if (patientError) throw patientError;

          if (patientData) {
            // Fetch health assessment data
            const { data: healthAssessmentData, error: healthAssessmentError } =
              await supabase
                .from("health_assessment")
                .select("*")
                .eq("full_name", decodeURIComponent(patientName))
                .single();

            if (
              healthAssessmentError &&
              healthAssessmentError.code !== "PGRST116"
            ) {
              throw healthAssessmentError;
            }

            setPatientInfo((prev) => ({
              ...prev,
              fullName: patientData.full_name,
              age: patientData.age?.toString() || "N/A",
              gender: patientData.gender || "N/A",
            }));
            setSelectedPatient(patientData.full_name);

            if (healthAssessmentData) {
              setFormData({
                dob: healthAssessmentData.date_of_service || "",
                dateOfService: healthAssessmentData.date_of_service || "",
                requestRelated: healthAssessmentData.request_related || [],
                documentationSentTo:
                  healthAssessmentData.documentation_sent_to || "",
                riskLevel: healthAssessmentData.risk_level || "",
                assessmentTimeFrame:
                  healthAssessmentData.assessment_time_frame || "",
                sentBy: healthAssessmentData.sent_by || ["Hard Copy"],
                physician: healthAssessmentData.physician || "",
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [patientName]);

  // Add effect to update physician info when selectedNurse changes
  useEffect(() => {
    if (selectedNurse) {
      const physicianInfo = `${selectedNurse.full_name}, ${selectedNurse.position}`;
      setPatientInfo((prev) => ({
        ...prev,
        physician: physicianInfo,
      }));
      setFormData((prev) => ({
        ...prev,
        physician: physicianInfo,
      }));
    }
  }, [selectedNurse]);

  // Only redirect if we're on the main health assessment page without a patient
  useEffect(() => {
    if (!selectedNurse && !patientName) {
      alert("Please select a nurse from the dashboard first.");
      router.push("/");
    }
  }, [selectedNurse, patientName, router]);

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedPatient(selectedName);
    if (selectedName) {
      router.push(
        `/health-assessment?patient=${encodeURIComponent(selectedName)}`
      );
    } else {
      router.push("/health-assessment");
    }
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === "checkbox") {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...((prev[parent] as Record<string, boolean>) || {}),
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

  const handleArrayChange = (path: keyof FormData, value: string) => {
    setFormData((prev) => {
      const current = prev[path] as string[];
      return {
        ...prev,
        [path]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName) {
      alert("No patient selected");
      return;
    }

    if (!selectedNurse) {
      alert(
        "No nurse selected. Please select a nurse from the dashboard first."
      );
      return;
    }

    try {
      // Prepare the data for submission
      const submissionData = {
        full_name: decodeURIComponent(patientName),
        physician_id: selectedNurse.id,
        date_of_service:
          formData.dateOfService || new Date().toISOString().split("T")[0],
        request_related: formData.requestRelated || [],
        documentation_sent_to: formData.documentationSentTo || "",
        risk_level: formData.riskLevel || "",
        assessment_time_frame: formData.assessmentTimeFrame || "",
        sent_by: formData.sentBy || ["Hard Copy"],
      };

      console.log("Submitting data:", submissionData);

      const { data, error: upsertError } = await supabase
        .from("health_assessment")
        .upsert(submissionData)
        .select();

      if (upsertError) {
        console.error("Supabase error:", upsertError);
        throw upsertError;
      }

      console.log("Success response:", data);
      alert("Health assessment saved successfully!");
    } catch (error) {
      console.error("Error saving health assessment:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      alert("Error saving health assessment. Please try again.");
    }
  };

  // Handle navigation to other pages
  const handleNavigation = (path: string) => {
    if (!selectedNurse) {
      alert("Please select a nurse from the dashboard first.");
      router.push("/");
      return;
    }
    if (!patientName) {
      alert("Please select a patient first.");
      return;
    }
    router.push(`${path}?patient=${encodeURIComponent(patientName)}`);
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
            <p className="mt-1 text-lg text-indigo-200">Health Assessment</p>
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
          {/* Form Header */}
          <div className="bg-indigo-700 px-8 py-5">
            <h2 className="text-2xl font-semibold text-white">
              Health Assessment Form
            </h2>
            <span className="text-l text-gray-200">
              To complete the required information, select the data relevant to
              the patient&apos;s physiological status, enter the needed details,
              and choose the information that applies to the patient&apos;s
              physical condition.
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
                <p className="text-sm font-medium text-gray-500">Physician</p>
                <p className="text-lg font-semibold text-gray-900">
                  {patientInfo.physician}
                </p>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">Age</p>
                <p className="text-lg font-semibold text-gray-900">
                  {patientInfo.age}
                </p>
            </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Gender</p>
                <p className="text-lg font-semibold text-gray-900">
                  {patientInfo.gender}
                </p>
          </div>
        </div>

            <form onSubmit={handleSubmit} className="space-y-8">
        {/* Request Related */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Request Related
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  CHECK ALL THAT APPLY
                </p>
          
          <div className="space-y-2">
                  {[
                    "Physical and Health Status",
                    "Dietary and Nutritional Assessment",
                    "Psychosocial and Behavioral Factors",
                    "Nail Assessment",
                    "Hair Assessment",
                    "Skin Assessment",
                  ].map((item) => (
              <label key={item} className="flex items-center">
                <input
                  type="checkbox"
                  name="requestRelated"
                  value={item}
                  checked={formData.requestRelated.includes(item)}
                        onChange={() =>
                          handleArrayChange("requestRelated", item)
                        }
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">{item}</span>
              </label>
            ))}
          </div>
          
          <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Documentation to be sent back to:
                  </label>
            <input
              type="text"
              name="documentationSentTo"
              value={formData.documentationSentTo}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

                {/* Additional Assessments - Conditionally rendered based on requestRelated */}
                {formData.requestRelated.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Additional Assessments
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {formData.requestRelated.includes(
                        "Physical and Health Status"
                      ) && (
                        <button
                          onClick={() => handleNavigation("/physical-health")}
                          className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow w-full text-left"
                        >
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            Physical and Health Status
                          </h4>
                          <p className="text-gray-600">
                            Complete physical health evaluation and assessment
                          </p>
                        </button>
                      )}

                      {formData.requestRelated.includes(
                        "Dietary and Nutritional Assessment"
                      ) && (
                        <button
                          onClick={() =>
                            handleNavigation("/dietary-nutritional-assessment")
                          }
                          className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow w-full text-left"
                        >
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            Dietary and Nutritional Assessment
                          </h4>
                          <p className="text-gray-600">
                            Evaluate dietary habits and nutritional status
                          </p>
                        </button>
                      )}

                      {formData.requestRelated.includes(
                        "Psychosocial and Behavioral Factors"
                      ) && (
                        <button
                          onClick={() =>
                            handleNavigation("/psychosocial-behavioral-factors")
                          }
                          className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow w-full text-left"
                        >
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            Psychosocial and Behavioral Factors
                          </h4>
                          <p className="text-gray-600">
                            Assess psychological and social factors affecting
                            health
                          </p>
                        </button>
                      )}

                      {formData.requestRelated.includes("Nail Assessment") && (
                        <button
                          onClick={() => handleNavigation("/nail-assessment")}
                          className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow w-full text-left"
                        >
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            Nail Assessment
                          </h4>
                          <p className="text-gray-600">
                            Evaluate nail health and conditions
                          </p>
                        </button>
                      )}

                      {formData.requestRelated.includes("Hair Assessment") && (
                        <button
                          onClick={() => handleNavigation("/hair-assessment")}
                          className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow w-full text-left"
                        >
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            Hair Assessment
                          </h4>
                          <p className="text-gray-600">
                            Assess hair health and conditions
                          </p>
                        </button>
                      )}

                      {formData.requestRelated.includes("Skin Assessment") && (
                        <button
                          onClick={() => handleNavigation("/skin-assessment")}
                          className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow w-full text-left"
                        >
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            Skin Assessment
                          </h4>
                          <p className="text-gray-600">
                            Evaluate skin health and conditions
                          </p>
                        </button>
                      )}
                    </div>
                  </div>
                )}
        </div>

        {/* Risk Level */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Level of Risk
                </h3>
          <div className="flex space-x-4">
                  {["High Risk", "Low Risk"].map((risk) => (
              <label key={risk} className="flex items-center">
                <input
                  type="radio"
                  name="riskLevel"
                  checked={formData.riskLevel === risk}
                        onChange={() =>
                          handleInputChange({
                            target: { name: "riskLevel", value: risk },
                          } as React.ChangeEvent<HTMLInputElement>)
                        }
                  className="h-4 w-4 text-blue-600"
                  required
                />
                <span className="ml-2">{risk}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Assessment Time Frame */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Assessment Time Frame
                </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "Admission",
                    "Weekly",
                    "Change in Condition",
                    "Quarterly",
                  ].map((time) => (
              <label key={time} className="flex items-center">
                <input
                  type="radio"
                  name="assessmentTimeFrame"
                  checked={formData.assessmentTimeFrame === time}
                        onChange={() =>
                          handleInputChange({
                            target: {
                              name: "assessmentTimeFrame",
                              value: time,
                            },
                          } as React.ChangeEvent<HTMLInputElement>)
                        }
                  className="h-4 w-4 text-blue-600"
                  required
                />
                <span className="ml-2">{time}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sent By */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">By:</h3>
          <div className="flex space-x-4">
                  {["Email", "Fax", "Hard Copy"].map((method) => (
              <label key={method} className="flex items-center">
                <input
                  type="checkbox"
                  name="sentBy"
                  value={method}
                  checked={formData.sentBy.includes(method)}
                        onChange={() => handleArrayChange("sentBy", method)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2">{method}</span>
              </label>
            ))}
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
      </form>
          </div>
        </div>
      </div>
    </div>
  );
}
