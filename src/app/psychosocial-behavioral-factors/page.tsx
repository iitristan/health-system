"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Suspense } from "react";
import { useSession } from "@/app/context/SessionContext";

interface FormData {
  foodInsecurity: {
    skippingMeals: boolean;
    limitedAccess: boolean;
    foodAssistance: boolean;
    other: string;
  };
  eatingBehavior: {
    appetite: string;
    mealFrequency: string;
    foodPreferences: string;
    feedingDifficulties: {
      refusesFood: boolean;
      chokingRisk: boolean;
      textureAversion: boolean;
    };
  };
  emotionalHealth: {
    parentalBonding: string;
    developmentalMilestones: string;
    traumaExposure: boolean;
    emotionalDistress: {
      irritability: boolean;
      apathy: boolean;
      anxiety: boolean;
    };
  };
}

interface PsychosocialBehavioralRecord {
  id: string;
  full_name: string;
  physician_id: string;
  physician_name: string;
  date_of_service: string;
  created_at: string;
  skipping_meals: boolean;
  limited_access: boolean;
  food_assistance: boolean;
  other_food_insecurity: string;
  appetite: string;
  meal_frequency: string;
  food_preferences: string;
  refuses_food: boolean;
  choking_risk: boolean;
  texture_aversion: boolean;
  parental_bonding: string;
  developmental_milestones: string;
  trauma_exposure: boolean;
  irritability: boolean;
  apathy: boolean;
  anxiety: boolean;
}

interface PsychosocialStatus {
  status: string;
  color: string;
  intervention: string;
}

const getParentalBondingStatus = (
  bonding: string
): PsychosocialStatus | null => {
  if (bonding === "WEAK") {
    return {
      status: "Weak Parental Bonding & Emotional Support",
      color: "bg-red-100 text-red-800",
      intervention: `1. Encourage parents/guardians to stay in touch with their children
2. Organize workshops and support groups that educate parents about child development, effective parenting skills, and the importance of emotional support
3. Implement home visits to assess family dynamics, the living environment, and the parent's ability to meet their child's needs`,
    };
  }
  return null;
};

const getDevelopmentalMilestonesStatus = (
  milestones: string
): PsychosocialStatus | null => {
  if (milestones === "Delayed" || milestones === "Severely Delayed") {
    return {
      status: "Delayed or Severely Delayed Developmental Milestones",
      color: "bg-yellow-100 text-yellow-800",
      intervention: `1. Tailor programs that can be designed to address specific developmental milestones, focusing on cognitive, motor, and language skills
2. Educate families about developmental milestones, parenting strategies, and available community resources
3. Refer families to intervention programs that offer specialized services
4. Implement ongoing assessments to track the child's development closely
5. Encourage families to provide rich, engaging activities at home and in the community`,
    };
  }
  return null;
};

const getTraumaExposureStatus = (
  exposure: boolean
): PsychosocialStatus | null => {
  if (exposure) {
    return {
      status: "Exposure to Trauma Detected",
      color: "bg-red-100 text-red-800",
      intervention: `• Refer the child to a mental health professional for trauma-informed assessment and therapy
• Collaborate with social workers or child protection services
• Establish a safe and supportive environment in school and at home
• Implement trauma-informed care practices among caregivers and educators
• Encourage stable relationships with caring adults through mentoring programs`,
    };
  }
  return null;
};

const getEmotionalDistressStatus = (distress: {
  irritability: boolean;
  apathy: boolean;
  anxiety: boolean;
}): PsychosocialStatus | null => {
  if (distress.irritability || distress.apathy || distress.anxiety) {
    return {
      status: "Signs of Emotional Distress Detected",
      color: "bg-yellow-100 text-yellow-800",
      intervention: `• Conduct a comprehensive emotional and behavioral assessment
• Provide counseling services that focus on building emotional regulation
• Engage the child in structured routines and therapeutic play
• Involve caregivers in family therapy or parenting support programs
• Monitor emotional well-being regularly`,
    };
  }
  return null;
};

export default function PsychosocialBehavioralWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PsychosocialBehavioralPage />
    </Suspense>
  );
}

function PsychosocialBehavioralPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  const [historyRecords, setHistoryRecords] = useState<
    PsychosocialBehavioralRecord[]
  >([]);
  const [selectedRecord, setSelectedRecord] =
    useState<PsychosocialBehavioralRecord | null>(null);

  // Add state for trauma exposure
  const [traumaExposure, setTraumaExposure] = useState<string>("");

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

  // Add effect to update physician info when selectedNurse changes
  useEffect(() => {
    if (selectedNurse) {
      setPatientInfo((prev) => ({
        ...prev,
        physician: `${selectedNurse.full_name}, ${selectedNurse.position}`,
      }));
    }
  }, [selectedNurse]);

  // Only redirect if we're on the main page without a patient
  useEffect(() => {
    if (!selectedNurse && !patientName) {
      alert("Please select a staff from the dashboard first.");
      router.push("/");
    }
  }, [selectedNurse, patientName, router]);

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedPatient(selectedName);
    if (selectedName) {
      router.push(
        `/psychosocial-behavioral-factors?patient=${encodeURIComponent(
          selectedName
        )}`
      );
    } else {
      router.push("/psychosocial-behavioral-factors");
    }
  };

  // State management for form fields
  const [formData, setFormData] = useState<FormData>({
    foodInsecurity: {
      skippingMeals: false,
      limitedAccess: false,
      foodAssistance: false,
      other: "",
    },
    eatingBehavior: {
      appetite: "",
      mealFrequency: "",
      foodPreferences: "",
      feedingDifficulties: {
        refusesFood: false,
        chokingRisk: false,
        textureAversion: false,
      },
    },
    emotionalHealth: {
      parentalBonding: "",
      developmentalMilestones: "",
      traumaExposure: false,
      emotionalDistress: {
        irritability: false,
        apathy: false,
        anxiety: false,
      },
    },
  });

  // Update handleInputChange with proper typing
  const handleInputChange = (
    section: keyof FormData,
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Update handleNestedInputChange with proper typing
  const handleNestedInputChange = (
    section: keyof FormData,
    parentField: string,
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentField]: {
          ...(
            prev[section] as Record<string, Record<string, string | boolean>>
          )[parentField],
          [field]: value,
        },
      },
    }));
  };

  const [otherChecked, setOtherChecked] = useState(false);

  // Fetch history records when patient changes
  const fetchHistoryRecords = async () => {
    if (patientName) {
      try {
        const { data: records, error } = await supabase
          .from("psychosocial_behavioral_records")
          .select("*")
          .eq("full_name", decodeURIComponent(patientName))
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Fetch nurse information for each record
        const recordsWithNurseInfo = await Promise.all(
          (records || []).map(async (record) => {
            if (record.physician_id) {
              const { data: nurseData, error: nurseError } = await supabase
                .from("nurses")
                .select("full_name, position")
                .eq("id", record.physician_id)
                .single();

              if (!nurseError && nurseData) {
                return {
                  ...record,
                  physician_name: `${nurseData.full_name}, ${nurseData.position}`,
                };
              }
            }
            return {
              ...record,
              physician_name: "Unknown",
            };
          })
        );

        setHistoryRecords(recordsWithNurseInfo);
      } catch (error) {
        console.error("Error fetching history records:", error);
      }
    }
  };

  useEffect(() => {
    fetchHistoryRecords();
  }, [patientName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName) {
      alert("No patient selected");
      return;
    }

    if (!selectedNurse) {
      alert(
        "No nurse selected. Please select a staff from the dashboard first."
      );
      return;
    }

    try {
      const submissionData = {
        full_name: decodeURIComponent(patientName),
        physician_id: selectedNurse.id,
        date_of_service: new Date().toISOString().split("T")[0],
        skipping_meals: formData.foodInsecurity.skippingMeals,
        limited_access: formData.foodInsecurity.limitedAccess,
        food_assistance: formData.foodInsecurity.foodAssistance,
        other_food_insecurity: formData.foodInsecurity.other,
        appetite: formData.eatingBehavior.appetite,
        meal_frequency: formData.eatingBehavior.mealFrequency,
        food_preferences: formData.eatingBehavior.foodPreferences,
        refuses_food: formData.eatingBehavior.feedingDifficulties.refusesFood,
        choking_risk: formData.eatingBehavior.feedingDifficulties.chokingRisk,
        texture_aversion:
          formData.eatingBehavior.feedingDifficulties.textureAversion,
        parental_bonding: formData.emotionalHealth.parentalBonding,
        developmental_milestones:
          formData.emotionalHealth.developmentalMilestones,
        trauma_exposure: formData.emotionalHealth.traumaExposure,
        irritability: formData.emotionalHealth.emotionalDistress.irritability,
        apathy: formData.emotionalHealth.emotionalDistress.apathy,
        anxiety: formData.emotionalHealth.emotionalDistress.anxiety,
      };

      console.log("Submitting data:", submissionData);

      const { error } = await supabase
        .from("psychosocial_behavioral_records")
        .upsert(submissionData);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      alert("Psychosocial behavioral assessment saved successfully!");
      await fetchHistoryRecords();
    } catch (error) {
      console.error("Error saving assessment:", error);
      alert("Error saving assessment. Please try again.");
    }
  };

  const handleViewRecord = (record: PsychosocialBehavioralRecord) => {
    setSelectedRecord(record);
    setTraumaExposure(record.trauma_exposure ? "Yes" : "No");
    setFormData({
      foodInsecurity: {
        skippingMeals: record.skipping_meals,
        limitedAccess: record.limited_access,
        foodAssistance: record.food_assistance,
        other: record.other_food_insecurity,
      },
      eatingBehavior: {
        appetite: record.appetite,
        mealFrequency: record.meal_frequency,
        foodPreferences: record.food_preferences,
        feedingDifficulties: {
          refusesFood: record.refuses_food,
          chokingRisk: record.choking_risk,
          textureAversion: record.texture_aversion,
        },
      },
      emotionalHealth: {
        parentalBonding: record.parental_bonding,
        developmentalMilestones: record.developmental_milestones,
        traumaExposure: record.trauma_exposure,
        emotionalDistress: {
          irritability: record.irritability,
          apathy: record.apathy,
          anxiety: record.anxiety,
        },
      },
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewRecord = () => {
    setSelectedRecord(null);
    setOtherChecked(false);
    setTraumaExposure("");
    setFormData({
      foodInsecurity: {
        skippingMeals: false,
        limitedAccess: false,
        foodAssistance: false,
        other: "",
      },
      eatingBehavior: {
        appetite: "",
        mealFrequency: "",
        foodPreferences: "",
        feedingDifficulties: {
          refusesFood: false,
          chokingRisk: false,
          textureAversion: false,
        },
      },
      emotionalHealth: {
        parentalBonding: "",
        developmentalMilestones: "",
        traumaExposure: false,
        emotionalDistress: {
          irritability: false,
          apathy: false,
          anxiety: false,
        },
      },
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Add delete record function
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
        .from("psychosocial_behavioral_records")
        .delete()
        .eq("id", recordId);

      if (error) {
        console.error("Error deleting record:", error);
        throw error;
      }

      alert("Record deleted successfully!");
      await fetchHistoryRecords();
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Error deleting record. Please try again.");
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
              Psychosocial and Behavioral Factors Assessment
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
          {/* Form Header */}
          <div className="bg-indigo-700 px-8 py-5">
            <h2 className="text-2xl font-semibold text-white">
              Psychosocial and Behavioral Factors Assessment Form
            </h2>
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

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Food Insecurity */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Food Insecurity
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.foodInsecurity.skippingMeals}
                      onChange={(e) =>
                        handleInputChange(
                          "foodInsecurity",
                          "skippingMeals",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 mt-1 text-blue-600"
                    />
                    <span className="ml-2">
                      Reports skipping meals due to financial constraints
                    </span>
                  </div>
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.foodInsecurity.limitedAccess}
                      onChange={(e) =>
                        handleInputChange(
                          "foodInsecurity",
                          "limitedAccess",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 mt-1 text-blue-600"
                    />
                    <span className="ml-2">
                      Limited access to nutritious food due to picky eating
                      habits
                    </span>
                  </div>
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.foodInsecurity.foodAssistance}
                      onChange={(e) =>
                        handleInputChange(
                          "foodInsecurity",
                          "foodAssistance",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 mt-1 text-blue-600"
                    />
                    <span className="ml-2">
                      Relies on food assistance programs
                    </span>
                  </div>
                  <div className="flex items-start">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={otherChecked}
                        onChange={(e) => {
                          setOtherChecked(e.target.checked);
                          if (!e.target.checked) {
                            handleInputChange("foodInsecurity", "other", "");
                          }
                        }}
                        className="h-4 w-4 mt-1 text-blue-600"
                      />
                      <span className="ml-2">Others, please specify:</span>
                    </div>
                    {otherChecked && (
                      <input
                        type="text"
                        value={formData.foodInsecurity.other}
                        onChange={(e) =>
                          handleInputChange(
                            "foodInsecurity",
                            "other",
                            e.target.value
                          )
                        }
                        className="ml-2 w-48 p-1 border border-gray-300 rounded-md"
                        placeholder="Specify other food insecurity"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Child's Eating Behavior & Habits */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Child&apos;s Eating Behavior & Habits
                </h3>

                {/* Appetite Level */}
                <div className="mb-4">
                  <p className="font-medium mb-2">Appetite Level:</p>
                  <div className="space-y-2">
                    {["Normal", "Poor", "Selective eating"].map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.eatingBehavior.appetite === option}
                          onChange={() =>
                            handleInputChange(
                              "eatingBehavior",
                              "appetite",
                              option
                            )
                          }
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Meal Frequency */}
                <div className="mb-4">
                  <p className="font-medium mb-2">Meal Frequency per Day:</p>
                  <div className="space-y-2">
                    {["1 - 2", "3 - 4", "5+"].map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          checked={
                            formData.eatingBehavior.mealFrequency === option
                          }
                          onChange={() =>
                            handleInputChange(
                              "eatingBehavior",
                              "mealFrequency",
                              option
                            )
                          }
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Food Preferences */}
                <div className="mb-4">
                  <p className="font-medium mb-2">Food Preferences:</p>
                  <div className="space-y-2">
                    {[
                      "Balanced diet",
                      "High in processed food",
                      "Low in variety",
                    ].map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          checked={
                            formData.eatingBehavior.foodPreferences === option
                          }
                          onChange={() =>
                            handleInputChange(
                              "eatingBehavior",
                              "foodPreferences",
                              option
                            )
                          }
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Feeding Difficulties */}
                <div className="mb-4">
                  <p className="font-medium mb-2">
                    Signs of Feeding Difficulties:
                  </p>
                  <div className="space-y-2">
                    {[
                      { key: "refusesFood", label: "Refuses food" },
                      { key: "chokingRisk", label: "Choking risk" },
                      { key: "textureAversion", label: "Texture aversion" },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            formData.eatingBehavior.feedingDifficulties[
                              key as keyof typeof formData.eatingBehavior.feedingDifficulties
                            ]
                          }
                          onChange={(e) =>
                            handleNestedInputChange(
                              "eatingBehavior",
                              "feedingDifficulties",
                              key,
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Child's Emotional & Mental Health */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Child&apos;s Emotional & Mental Health
                </h3>

                {/* Parental Bonding */}
                <div className="space-y-4">
                  <p className="font-medium mb-2">
                    Parental Bonding & Emotional Support:
                  </p>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="parentalBonding"
                        value="Strong"
                        checked={
                          formData.emotionalHealth.parentalBonding === "Strong"
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "emotionalHealth",
                            "parentalBonding",
                            e.target.value
                          )
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Strong</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="parentalBonding"
                        value="Moderate"
                        checked={
                          formData.emotionalHealth.parentalBonding ===
                          "Moderate"
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "emotionalHealth",
                            "parentalBonding",
                            e.target.value
                          )
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Moderate</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="parentalBonding"
                        value="WEAK"
                        checked={
                          formData.emotionalHealth.parentalBonding === "WEAK"
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "emotionalHealth",
                            "parentalBonding",
                            e.target.value
                          )
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Weak</span>
                    </label>
                  </div>
                  {formData.emotionalHealth.parentalBonding === "WEAK" && (
                    <div className="p-3 rounded bg-red-100 text-red-800">
                      <p className="font-medium">
                        Weak Parental Bonding & Emotional Support
                      </p>
                      <p className="text-sm mt-1 whitespace-pre-line">
                        1. Encourage parents/guardians to stay in touch with
                        their children 2. Organize workshops and support groups
                        that educate parents about child development, effective
                        parenting skills, and the importance of emotional
                        support 3. Implement home visits to assess family
                        dynamics, the living environment, and the parent&apos;s
                        ability to meet their child&apos;s needs
                      </p>
                    </div>
                  )}
                </div>

                {/* Developmental Milestones */}
                <div className="space-y-4 mt-6">
                  <p className="font-medium mb-2">Developmental Milestones:</p>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="developmentalMilestones"
                        value="On Track"
                        checked={
                          formData.emotionalHealth.developmentalMilestones ===
                          "On Track"
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "emotionalHealth",
                            "developmentalMilestones",
                            e.target.value
                          )
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">On Track</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="developmentalMilestones"
                        value="Delayed"
                        checked={
                          formData.emotionalHealth.developmentalMilestones ===
                          "Delayed"
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "emotionalHealth",
                            "developmentalMilestones",
                            e.target.value
                          )
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Delayed</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="developmentalMilestones"
                        value="Severely Delayed"
                        checked={
                          formData.emotionalHealth.developmentalMilestones ===
                          "Severely Delayed"
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "emotionalHealth",
                            "developmentalMilestones",
                            e.target.value
                          )
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Severely Delayed</span>
                    </label>
                  </div>
                  {(formData.emotionalHealth.developmentalMilestones ===
                    "Delayed" ||
                    formData.emotionalHealth.developmentalMilestones ===
                      "Severely Delayed") && (
                    <div className="p-3 rounded bg-yellow-100 text-yellow-800">
                      <p className="font-medium">
                        Delayed or Severely Delayed Developmental Milestones
                      </p>
                      <p className="text-sm mt-1 whitespace-pre-line">
                        1. Tailor programs that can be designed to address
                        specific developmental milestones 2. Educate families
                        about developmental milestones and parenting strategies
                        3. Refer families to intervention programs that offer
                        specialized services 4. Implement ongoing assessments to
                        track the child&apos;s development 5. Encourage families
                        to provide rich, engaging activities at home
                      </p>
                    </div>
                  )}
                </div>

                {/* Trauma Exposure */}
                <div className="space-y-4 mt-6">
                  <p className="font-medium mb-2">Exposure to Trauma:</p>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="traumaExposure"
                        value="Yes"
                        checked={formData.emotionalHealth.traumaExposure}
                        onChange={(e) =>
                          handleInputChange(
                            "emotionalHealth",
                            "traumaExposure",
                            true
                          )
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="traumaExposure"
                        value="No"
                        checked={!formData.emotionalHealth.traumaExposure}
                        onChange={(e) =>
                          handleInputChange(
                            "emotionalHealth",
                            "traumaExposure",
                            false
                          )
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                  {formData.emotionalHealth.traumaExposure && (
                    <div className="p-3 rounded bg-red-100 text-red-800">
                      <p className="font-medium">Exposure to Trauma Detected</p>
                      <p className="text-sm mt-1 whitespace-pre-line">
                        • Refer the child to a mental health professional for
                        trauma-informed assessment • Collaborate with social
                        workers or child protection services • Establish a safe
                        and supportive environment • Implement trauma-informed
                        care practices • Encourage stable relationships with
                        caring adults
                      </p>
                    </div>
                  )}
                </div>

                {/* Emotional Distress */}
                <div className="space-y-4 mt-6">
                  <p className="font-medium mb-2">
                    Signs of Emotional Distress:
                  </p>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          formData.emotionalHealth.emotionalDistress
                            .irritability
                        }
                        onChange={(e) =>
                          handleNestedInputChange(
                            "emotionalHealth",
                            "emotionalDistress",
                            "irritability",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Irritability</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          formData.emotionalHealth.emotionalDistress.apathy
                        }
                        onChange={(e) =>
                          handleNestedInputChange(
                            "emotionalHealth",
                            "emotionalDistress",
                            "apathy",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Apathy</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          formData.emotionalHealth.emotionalDistress.anxiety
                        }
                        onChange={(e) =>
                          handleNestedInputChange(
                            "emotionalHealth",
                            "emotionalDistress",
                            "anxiety",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Anxiety</span>
                    </label>
                  </div>
                  {(formData.emotionalHealth.emotionalDistress.irritability ||
                    formData.emotionalHealth.emotionalDistress.apathy ||
                    formData.emotionalHealth.emotionalDistress.anxiety) && (
                    <div className="p-3 rounded bg-yellow-100 text-yellow-800">
                      <p className="font-medium">
                        Signs of Emotional Distress Detected
                      </p>
                      <p className="text-sm mt-1 whitespace-pre-line">
                        • Conduct a comprehensive emotional and behavioral
                        assessment • Provide counseling services for emotional
                        regulation • Engage in structured routines and
                        therapeutic play • Involve caregivers in family therapy
                        • Monitor emotional well-being regularly
                      </p>
                    </div>
                  )}
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
          </div>
          {/* History Table */}
          {historyRecords.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4 px-4">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Assessment History
                </h2>
                <button
                  onClick={handleNewRecord}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  New Record
                </button>
              </div>
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                        Nurse
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
}
