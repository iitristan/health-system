"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Suspense } from "react";
import { useSession } from "@/app/context/SessionContext";

interface DietRecall {
  day1: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  day2: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  day3: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
}

interface FoodGroups {
  milk: boolean;
  fruits: boolean;
  meat: boolean;
  bread: boolean;
  vegetables: boolean;
  fat: boolean;
}

interface MealDetails {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  reason: string;
}

interface DietHistory {
  foodGroups: FoodGroups;
  junkFood: MealDetails;
  fastFood: MealDetails;
  skippedMeals: MealDetails;
}

interface FoodInsecurity {
  skippingMeals: boolean;
  limitedAccess: boolean;
  foodAssistance: boolean;
  other: string;
}

interface FormData {
  fullName: string;
  physicianId: string;
  dateOfService: string;
  dietRecall: DietRecall;
  waterIntake: {
    amount: string;
    temperature: string;
  };
  dietHistory: {
    foodGroups: {
      milk: boolean;
      fruits: boolean;
      meat: boolean;
      bread: boolean;
      vegetables: boolean;
      fat: boolean;
    };
    junkFood: {
      frequency: string;
      types: string;
    };
    fastFood: {
      frequency: string;
      types: string;
    };
    skippedMeals: {
      breakfast: boolean;
      lunch: boolean;
      dinner: boolean;
      reason: string;
    };
  };
  malnutritionScreening: {
    weightLoss: {
      hasWeightLoss: boolean;
      amount: string;
    };
    appetite: {
      hasIssues: boolean;
      details: string;
    };
    eatingDifficulties: {
      hasDifficulties: boolean;
      details: string;
    };
    foodAllergies: {
      hasAllergies: boolean;
      details: string;
    };
  };
  appetiteStatus: {
    status: string;
    details: string;
  };
  foodInsecurity: {
    skippingMeals: boolean;
    limitedAccess: boolean;
    foodAssistance: boolean;
    other: boolean;
    details: string;
  };
  eatingBehavior: {
    concerns: boolean;
    details: string;
  };
}

interface DietaryNutritionalRecord {
  id: string;
  full_name: string;
  physician_id: string;
  physician_name: string;
  date_of_service: string;
  created_at: string;
  diet_recall: {
    day1: { breakfast: string; lunch: string; dinner: string };
    day2: { breakfast: string; lunch: string; dinner: string };
    day3: { breakfast: string; lunch: string; dinner: string };
  };
  water_intake: {
    amount: string;
    temperature: string;
  };
  diet_history: {
    foodGroups: {
      milk: boolean;
      fruits: boolean;
      meat: boolean;
      bread: boolean;
      vegetables: boolean;
      fat: boolean;
    };
    junkFood: {
      breakfast: boolean;
      lunch: boolean;
      dinner: boolean;
      reason: string;
    };
    fastFood: {
      breakfast: boolean;
      lunch: boolean;
      dinner: boolean;
      reason: string;
    };
    skippedMeals: {
      breakfast: boolean;
      lunch: boolean;
      dinner: boolean;
      reason: string;
    };
  };
  malnutrition_screening: {
    weightLoss: string;
    weightLossDetails: string;
    appetite: string;
    appetiteDetails: string;
    eatingDifficulty: string;
    eatingDifficultyDetails: string;
    foodAllergies: string;
    foodAllergiesDetails: string;
  };
  appetite_status: {
    normal: boolean;
    suppressed: boolean;
    increased: boolean;
  };
  food_insecurity?: {
    skippingMeals: boolean;
    limitedAccess: boolean;
    foodAssistance: boolean;
    other: string;
  };
}

interface DietaryStatus {
  status: string;
  color: string;
  intervention: string;
}

export default function DietaryAssessmentWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DietaryAssessmentPage />
    </Suspense>
  );
}

function DietaryAssessmentPage() {
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
            setPatientInfo((prev) => ({
              ...prev,
              fullName: patientData.full_name,
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
        `/dietary-nutritional-assessment?patient=${encodeURIComponent(
          selectedName
        )}`
      );
    } else {
      router.push("/dietary-nutritional-assessment");
    }
  };

  // State management for form fields
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    physicianId: "",
    dateOfService: "",
    dietRecall: {
      day1: { breakfast: "", lunch: "", dinner: "" },
      day2: { breakfast: "", lunch: "", dinner: "" },
      day3: { breakfast: "", lunch: "", dinner: "" },
    },
    waterIntake: {
      amount: "",
      temperature: "",
    },
    dietHistory: {
      foodGroups: {
        milk: false,
        fruits: false,
        meat: false,
        bread: false,
        vegetables: false,
        fat: false,
      },
      junkFood: {
        frequency: "",
        types: "",
      },
      fastFood: {
        frequency: "",
        types: "",
      },
      skippedMeals: {
        breakfast: false,
        lunch: false,
        dinner: false,
        reason: "",
      },
    },
    malnutritionScreening: {
      weightLoss: {
        hasWeightLoss: false,
        amount: "",
      },
      appetite: {
        hasIssues: false,
        details: "",
      },
      eatingDifficulties: {
        hasDifficulties: false,
        details: "",
      },
      foodAllergies: {
        hasAllergies: false,
        details: "",
      },
    },
    appetiteStatus: {
      status: "",
      details: "",
    },
    foodInsecurity: {
      skippingMeals: false,
      limitedAccess: false,
      foodAssistance: false,
      other: false,
      details: "",
    },
    eatingBehavior: {
      concerns: false,
      details: "",
    },
  });

  const handleMealInputChange = (
    day: keyof DietRecall,
    meal: "breakfast" | "lunch" | "dinner",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      dietRecall: {
        ...prev.dietRecall,
        [day]: {
          ...prev.dietRecall[day],
          [meal]: value,
        },
      },
    }));
  };

  const handleFoodGroupChange = (group: keyof FoodGroups, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      dietHistory: {
        ...prev.dietHistory,
        foodGroups: {
          ...prev.dietHistory.foodGroups,
          [group]: value,
        },
      },
    }));
  };

  const handleMealDetailsChange = (
    type: "junkFood" | "fastFood" | "skippedMeals",
    meal: keyof MealDetails,
    value: boolean | string
  ) => {
    setFormData((prev) => ({
      ...prev,
      dietHistory: {
        ...prev.dietHistory,
        [type]: {
          ...prev.dietHistory[type],
          [meal]: value,
        },
      },
    }));
  };

  const handleFoodInsecurityChange = (
    key: keyof FoodInsecurity,
    value: boolean | string
  ) => {
    setFormData((prev) => ({
      ...prev,
      foodInsecurity: {
        ...prev.foodInsecurity,
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName) {
      alert("No patient selected");
      return;
    }

    if (!selectedNurse) {
      alert(
        "No staff selected. Please select a staff from the dashboard first."
      );
      return;
    }

    try {
      const submissionData = {
        full_name: decodeURIComponent(patientName),
        physician_id: selectedNurse.id,
        date_of_service: new Date().toISOString().split("T")[0],
        diet_recall: formData.dietRecall,
        water_intake: formData.waterIntake,
        diet_history: {
          foodGroups: formData.dietHistory.foodGroups,
          junkFood: formData.dietHistory.junkFood,
          fastFood: formData.dietHistory.fastFood,
          skippedMeals: formData.dietHistory.skippedMeals,
        },
        malnutrition_screening: formData.malnutritionScreening,
        appetite_status: formData.appetiteStatus,
        food_insecurity: formData.foodInsecurity,
      };

      console.log("Submitting data:", submissionData);

      const { error } = await supabase
        .from("dietary_nutritional_records")
        .upsert(submissionData);

      if (error) throw error;

      alert("Dietary assessment saved successfully!");

      // Refresh the history records after saving
      const { data: updatedRecords, error: fetchError } = await supabase
        .from("dietary_nutritional_records")
        .select("*")
        .eq("full_name", decodeURIComponent(patientName))
        .order("date_of_service", { ascending: false });

      if (fetchError) throw fetchError;
      setHistoryRecords(updatedRecords || []);
    } catch (error) {
      console.error("Error saving dietary assessment:", error);
      alert("Error saving dietary assessment. Please try again.");
    }
  };

  const [historyRecords, setHistoryRecords] = useState<
    DietaryNutritionalRecord[]
  >([]);
  const [selectedRecord, setSelectedRecord] =
    useState<DietaryNutritionalRecord | null>(null);

  // Fetch history records when patient changes
  useEffect(() => {
    const fetchHistoryRecords = async () => {
      if (patientName) {
        try {
          const { data: records, error } = await supabase
            .from("dietary_nutritional_records")
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

    fetchHistoryRecords();
  }, [patientName]);

  const handleViewRecord = (record: DietaryNutritionalRecord) => {
    setSelectedRecord(record);
    const initialFormData: FormData = {
      fullName: record.full_name,
      physicianId: record.physician_id,
      dateOfService: record.date_of_service,
      dietRecall: {
        day1: record.diet_recall?.day1 || {
          breakfast: "",
          lunch: "",
          dinner: "",
        },
        day2: record.diet_recall?.day2 || {
          breakfast: "",
          lunch: "",
          dinner: "",
        },
        day3: record.diet_recall?.day3 || {
          breakfast: "",
          lunch: "",
          dinner: "",
        },
      },
      waterIntake: record.water_intake || {
        amount: "",
        temperature: "",
      },
      dietHistory: record.diet_history || {
        foodGroups: {
          milk: false,
          fruits: false,
          meat: false,
          bread: false,
          vegetables: false,
          fat: false,
        },
        junkFood: {
          frequency: "",
          types: "",
        },
        fastFood: {
          frequency: "",
          types: "",
        },
        skippedMeals: {
          breakfast: false,
          lunch: false,
          dinner: false,
          reason: "",
        },
      },
      malnutritionScreening: {
        weightLoss:
          record.malnutrition_screening?.weightLoss === "Yes"
            ? {
                hasWeightLoss: true,
                amount: record.malnutrition_screening?.weightLossDetails || "",
              }
            : { hasWeightLoss: false, amount: "" },
        appetite:
          record.malnutrition_screening?.appetite === "Yes"
            ? {
                hasIssues: true,
                details: record.malnutrition_screening?.appetiteDetails || "",
              }
            : { hasIssues: false, details: "" },
        eatingDifficulties:
          record.malnutrition_screening?.eatingDifficulty === "Yes"
            ? {
                hasDifficulties: true,
                details:
                  record.malnutrition_screening?.eatingDifficultyDetails || "",
              }
            : { hasDifficulties: false, details: "" },
        foodAllergies:
          record.malnutrition_screening?.foodAllergies === "Yes"
            ? {
                hasAllergies: true,
                details:
                  record.malnutrition_screening?.foodAllergiesDetails || "",
              }
            : { hasAllergies: false, details: "" },
      },
      appetiteStatus: {
        status: record.appetite_status?.normal
          ? "Normal"
          : record.appetite_status?.suppressed
          ? "Suppressed"
          : record.appetite_status?.increased
          ? "Increased"
          : "",
        details: record.appetite_status?.details || "",
      },
      foodInsecurity: {
        skippingMeals: record.food_insecurity?.skippingMeals || false,
        limitedAccess: record.food_insecurity?.limitedAccess || false,
        foodAssistance: record.food_insecurity?.foodAssistance || false,
        other: record.food_insecurity?.other || false,
        details: record.food_insecurity?.details || "",
      },
    };
    setFormData(initialFormData);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewRecord = () => {
    setSelectedRecord(null);
    setFormData({
      fullName: "",
      physicianId: "",
      dateOfService: "",
      dietRecall: {
        day1: { breakfast: "", lunch: "", dinner: "" },
        day2: { breakfast: "", lunch: "", dinner: "" },
        day3: { breakfast: "", lunch: "", dinner: "" },
      },
      waterIntake: {
        amount: "",
        temperature: "",
      },
      dietHistory: {
        foodGroups: {
          milk: false,
          fruits: false,
          meat: false,
          bread: false,
          vegetables: false,
          fat: false,
        },
        junkFood: {
          frequency: "",
          types: "",
        },
        fastFood: {
          frequency: "",
          types: "",
        },
        skippedMeals: {
          breakfast: false,
          lunch: false,
          dinner: false,
          reason: "",
        },
      },
      malnutritionScreening: {
        weightLoss: { hasWeightLoss: false, amount: "" },
        appetite: { hasIssues: false, details: "" },
        eatingDifficulties: { hasDifficulties: false, details: "" },
        foodAllergies: { hasAllergies: false, details: "" },
      },
      appetiteStatus: {
        status: "",
        details: "",
      },
      foodInsecurity: {
        skippingMeals: false,
        limitedAccess: false,
        foodAssistance: false,
        other: false,
        details: "",
      },
      eatingBehavior: {
        concerns: false,
        details: "",
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
        .from("dietary_nutritional_records")
        .delete()
        .eq("id", recordId);

      if (error) {
        console.error("Error deleting record:", error);
        throw error;
      }

      alert("Record deleted successfully!");

      // Fetch updated records after deletion
      if (patientName) {
        const { data: records, error: fetchError } = await supabase
          .from("dietary_nutritional_records")
          .select("*")
          .eq("full_name", decodeURIComponent(patientName))
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

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
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Error deleting record. Please try again.");
    }
  };

  const getWeightLossStatus = (
    weightLoss: string,
    amount?: string
  ): DietaryStatus | null => {
    if (weightLoss === "Yes") {
      return {
        status: "Recent Weight Loss Detected",
        color: "bg-red-100 text-red-800",
        intervention: `1. Assess weight loss amount and time frame
2. Monitor BMI percentile and growth chart trends
3. Refer to a nutritionist/pediatrician for detailed assessment
4. Counsel on increasing caloric intake using nutrient-dense foods`,
      };
    }
    return null;
  };
  const getAppetiteStatus = (appetite: string): DietaryStatus | null => {
    if (appetite === "Yes") {
      return {
        status: "Decreased Appetite Detected",
        color: "bg-yellow-100 text-yellow-800",
        intervention: `1. Evaluate for underlying medical or psychosocial causes
2. Encourage small, frequent meals and child-preferred healthy snacks
3. Educate caregivers on ways to improve appetite (e.g., active play before meals, pleasant mealtime environment)
4. Consider zinc supplementation as ordered by the physician (if appetite suppression is suspected nutritionally)`,
      };
    }
    return null;
  };

  const getEatingDifficultyStatus = (
    difficulty: string
  ): DietaryStatus | null => {
    if (difficulty === "Yes") {
      return {
        status: "Eating Difficulties Detected",
        color: "bg-red-100 text-red-800",
        intervention: `1. Assess for chewing/swallowing issues or oral/dental problems
2. Observe gagging, drooling, or choking
3. Consult with a speech-language therapist or pediatrician
4. Offer soft-textured or modified consistency meals`,
      };
    }
    return null;
  };

  const getFoodInsecurityStatus = (
    insecurity: FoodInsecurity
  ): DietaryStatus | null => {
    if (
      insecurity.skippingMeals ||
      insecurity.limitedAccess ||
      insecurity.foodAssistance
    ) {
      const interventions = [];
      if (insecurity.skippingMeals) {
        interventions.push(`
      1. Refer to social services or school feeding programs
      2. Connect with barangay or LGU nutritional support (e.g., DSWD, feeding drives)
      3. Teach caregivers low-cost, high-calorie meal options (rice + egg, mung beans, malunggay)`);
      }
      if (insecurity.limitedAccess) {
        interventions.push(`
      1. Educate caregivers on repeated food exposure techniques
      2. Introduce nutrition games or fun presentations (e.g., food colors, textures)
      3. Collaborate with school for creative healthy meal planning`);
      }
      if (insecurity.foodAssistance) {
        interventions.push(`
      1. Monitor adequacy of assistance (frequency, quality)
      2. Educate caregivers on maximizing food items provided (e.g., how to enrich lugaw or rice porridge)
      3. Recommend supplementation if micronutrient risk is high`);
      }
      return {
        status: "Food Insecurity Detected",
        color: "bg-red-100 text-red-800",
        intervention: interventions.join("\n\n"),
      };
    }
    return null;
  };

  const getEatingBehaviorStatus = (behavior: {
    appetite: string;
    mealFrequency: string;
    foodPreferences: string;
    feedingDifficulties: {
      refusesFood: boolean;
      chokingRisk: boolean;
      textureAversion: boolean;
    };
  }): DietaryStatus | null => {
    const interventions = [];

    if (
      behavior.appetite === "Poor" ||
      behavior.appetite === "Selective eating"
    ) {
      interventions.push(`1. Monitor weight weekly
      2. Create a structured meal schedule with appetite stimulators (e.g., physical play)
      3. Gradual food reintroduction; offer a variety of textures and colors`);
    }

    if (behavior.mealFrequency === "1-2") {
      interventions.push(`1. Educate on 3 main meals + 1–2 nutritious snacks
      2. Emphasize the importance of breakfast and hydration
      3. Track 24-hour food recall and recommend meal calendar`);
    }

    if (
      behavior.foodPreferences === "High in processed food" ||
      behavior.foodPreferences === "Low in variety"
    ) {
      interventions.push(`1. Provide caregivers with healthy food swap suggestions
      2. Encourage inclusion of vegetables/fruits in small amounts with familiar foods
      3. Reinforce the value of family meals and caregiver modeling`);
    }

    if (behavior.feedingDifficulties.refusesFood) {
      interventions.push(`1. Use positive reinforcement and child-led choices at meals
      2. Avoid forcing food; allow trial portions and praise effort`);
    }

    if (behavior.feedingDifficulties.chokingRisk) {
      interventions.push(`1. Refer for feeding therapy or pediatric ENT if suspected
      2. Modify food texture; supervise meals`);
    }

    if (behavior.feedingDifficulties.textureAversion) {
      interventions.push(`1. Offer purees or soft foods; desensitize slowly to textures
2. Use food play to normalize textures outside of mealtimes`);
    }

    if (interventions.length > 0) {
      return {
        status: "Eating Behavior Concerns Detected",
        color: "bg-yellow-100 text-yellow-800",
        intervention: interventions.join("\n\n"),
      };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-800 py-4 sm:py-6 px-4 sm:px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="p-2 text-white hover:bg-indigo-700 rounded-md transition-colors"
            title="Go to Home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6"
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
            <h1 className="text-xl sm:text-3xl font-bold text-white">
              Electronic Health Record
            </h1>
            <p className="mt-1 text-sm sm:text-lg text-indigo-200">
              Dietary and Nutritional Assessment
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="p-2 text-white hover:bg-indigo-700 rounded-md transition-colors"
            title="Go Back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Form Header */}
          <div className="bg-indigo-700 px-4 sm:px-8 py-4 sm:py-5">
            <h2 className="text-lg sm:text-2xl font-semibold text-white">
              Dietary and Nutritional Assessment Form
            </h2>
          </div>

          <div className="p-4 sm:p-8">
            {/* Patient Selection */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-0">
                  Select Patient
                </label>
                <button
                  type="button"
                  onClick={() => router.push("/patient-information")}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Patient Name
                </p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {patientInfo.fullName || "Not selected"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Date of Service
                </p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {patientInfo.dateOfService}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Nurse</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {patientInfo.physician || "Not available"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Appetite Status */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Appetite
                </h3>
                <div className="space-y-2">
                  {[
                    { key: "normal", label: "Normal" },
                    { key: "suppressed", label: "Suppressed" },
                    { key: "increased", label: "Increased" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          formData.appetiteStatus?.[
                            key as keyof typeof formData.appetiteStatus
                          ] || false
                        }
                        onChange={(e) => {
                          const newValue = e.target.checked;
                          setFormData((prev) => ({
                            ...prev,
                            appetiteStatus: {
                              ...(prev.appetiteStatus || {
                                normal: false,
                                suppressed: false,
                                increased: false,
                              }),
                              [key]: newValue,
                            },
                          }));
                        }}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Diet Recall */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    DIET RECALL
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const currentDays = Object.keys(formData.dietRecall);
                      const lastDayNumber = parseInt(
                        currentDays[currentDays.length - 1].replace("day", "")
                      );
                      const newDayKey = `day${lastDayNumber + 1}`;
                      setFormData((prev) => ({
                        ...prev,
                        dietRecall: {
                          ...prev.dietRecall,
                          [newDayKey]: { breakfast: "", lunch: "", dinner: "" },
                        },
                      }));
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Add Day
                  </button>
                </div>
                {Object.keys(formData.dietRecall).map((day) => (
                  <div
                    key={day}
                    className="mb-6 border border-gray-200 rounded-lg p-4 relative"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Day {day.charAt(3)}</h4>
                      {Object.keys(formData.dietRecall).length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const { [day]: removed, ...remainingDays } =
                              formData.dietRecall;
                            setFormData((prev) => ({
                              ...prev,
                              dietRecall: remainingDays,
                            }));
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove Day
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {["breakfast", "lunch", "dinner"].map((meal) => (
                        <div key={meal}>
                          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                            {meal}
                          </label>
                          <input
                            type="text"
                            value={formData.dietRecall[day][meal]}
                            onChange={(e) =>
                              handleMealInputChange(day, meal, e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder={`Enter ${meal} details`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Water Intake */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  WATER INTAKE
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of glasses per day
                    </label>
                    <input
                      type="number"
                      value={formData.waterIntake.amount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          waterIntake: {
                            ...prev.waterIntake,
                            amount: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred water temperature
                    </label>
                    <select
                      value={formData.waterIntake.temperature}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          waterIntake: {
                            ...prev.waterIntake,
                            temperature: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select temperature</option>
                      <option value="room">Room temperature</option>
                      <option value="cold">Cold</option>
                      <option value="warm">Warm</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Diet History */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  DIET HISTORY
                </h3>
                <div className="mb-4">
                  <p className="mb-2">
                    Daily consumption of foods from each food group:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {Object.entries({
                      milk: "Milk products",
                      fruits: "Fruits",
                      meat: "Meat",
                      bread: "Bread and cereals",
                      vegetables: "Vegetables",
                      fat: "Fat",
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            formData.dietHistory.foodGroups[
                              key as keyof FoodGroups
                            ]
                          }
                          onChange={(e) =>
                            handleFoodGroupChange(
                              key as keyof FoodGroups,
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

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    How often do you take junk food?
                  </label>
                  <input
                    type="text"
                    value={formData.dietHistory.junkFood.reason}
                    onChange={(e) =>
                      handleMealDetailsChange(
                        "junkFood",
                        "reason",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Process/fast foods consumption:{" "}
                    <input
                      type="text"
                      value={formData.dietHistory.fastFood.frequency || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dietHistory: {
                            ...prev.dietHistory,
                            fastFood: {
                              ...prev.dietHistory.fastFood,
                              frequency: e.target.value,
                            },
                          },
                        }))
                      }
                      className="inline-block w-16 p-1 border border-gray-300 rounded-md"
                      placeholder="times/week"
                    />
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={formData.dietHistory.fastFood.types || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dietHistory: {
                            ...prev.dietHistory,
                            fastFood: {
                              ...prev.dietHistory.fastFood,
                              types: e.target.value,
                            },
                          },
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Specify types of fast food consumed"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <p className="mb-2">
                    Do you skip meals? If yes, which meals and why?
                  </p>
                  <div className="flex space-x-4 mb-2">
                    {["breakfast", "lunch", "dinner"].map((meal) => (
                      <label key={meal} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            formData.dietHistory.skippedMeals[
                              meal as keyof MealDetails
                            ] as boolean
                          }
                          onChange={(e) =>
                            handleMealDetailsChange(
                              "skippedMeals",
                              meal as keyof MealDetails,
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 capitalize">{meal}</span>
                      </label>
                    ))}
                  </div>
                  {(formData.dietHistory.skippedMeals.breakfast ||
                    formData.dietHistory.skippedMeals.lunch ||
                    formData.dietHistory.skippedMeals.dinner) && (
                    <div className="mt-2 p-2 rounded-md bg-red-100 text-red-800">
                      <p className="font-medium">Meal Skipping Detected</p>
                      <p className="mt-1 text-sm whitespace-pre-line">
                        1. Assess frequency and pattern of skipped meals 2.
                        Evaluate impact on daily caloric intake 3. Provide
                        education on importance of regular meals 4. Suggest
                        healthy snack alternatives 5. Consider referral to
                        nutritionist if pattern persists
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="mb-2">Reasons for skipping</p>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.foodInsecurity.skippingMeals}
                        onChange={(e) =>
                          handleFoodInsecurityChange(
                            "skippingMeals",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">
                        1. Skipping meals due to financial constraints
                      </span>
                    </label>
                    {formData.foodInsecurity.skippingMeals && (
                      <div className="ml-6 mt-2 p-2 rounded-md bg-red-100 text-red-800">
                        <p className="font-medium">Intervention:</p>
                        <ol className="list-decimal list-inside mt-1 text-sm">
                          <li>
                            Refer to social services or school feeding programs
                          </li>
                          <li>
                            Connect with barangay or LGU nutritional support
                            (e.g., DSWD, feeding drives)
                          </li>
                          <li>
                            Teach caregivers low-cost, high-calorie meal options
                            (rice + egg, mung beans, malunggay)
                          </li>
                        </ol>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.foodInsecurity.limitedAccess}
                        onChange={(e) =>
                          handleFoodInsecurityChange(
                            "limitedAccess",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">
                        2. Limited access to nutritious food due to picky eating
                      </span>
                    </label>
                    {formData.foodInsecurity.limitedAccess && (
                      <div className="ml-6 mt-2 p-2 rounded-md bg-red-100 text-red-800">
                        <p className="font-medium">Intervention:</p>
                        <ol className="list-decimal list-inside mt-1 text-sm">
                          <li>
                            Educate caregivers on repeated food exposure
                            techniques
                          </li>
                          <li>
                            Introduce nutrition games or fun presentations
                            (e.g., food colors, textures)
                          </li>
                          <li>
                            Collaborate with school for creative healthy meal
                            planning
                          </li>
                        </ol>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.foodInsecurity.foodAssistance}
                        onChange={(e) =>
                          handleFoodInsecurityChange(
                            "foodAssistance",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">
                        3. Relies on food assistance programs
                      </span>
                    </label>
                    {formData.foodInsecurity.foodAssistance && (
                      <div className="ml-6 mt-2 p-2 rounded-md bg-red-100 text-red-800">
                        <p className="font-medium">Intervention:</p>
                        <ol className="list-decimal list-inside mt-1 text-sm">
                          <li>
                            Monitor adequacy of assistance (frequency, quality)
                          </li>
                          <li>
                            Educate caregivers on maximizing food items provided
                            (e.g., how to enrich lugaw or rice porridge)
                          </li>
                          <li>
                            Recommend supplementation if micronutrient risk is
                            high
                          </li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-md font-medium mb-2">
                    Other concerns related to skipping food
                  </label>
                  <input
                    type="text"
                    value={formData.foodInsecurity.details || ""}
                    onChange={(e) =>
                      handleFoodInsecurityChange("details", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Specify any other food insecurity concerns"
                  />
                </div>
              </div>

              {/* Malnutrition Screening */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Malnutrition Screening
                </h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2">
                        Have you lost weight recently without trying?
                        <br />
                        {formData.malnutritionScreening.weightLoss
                          .hasWeightLoss && (
                          <>
                            <span className="text-sm ml-4">
                              How much weight have you lost?
                              <input
                                type="number"
                                value={
                                  formData.malnutritionScreening.weightLoss
                                    .amount
                                }
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    malnutritionScreening: {
                                      ...prev.malnutritionScreening,
                                      weightLoss: {
                                        ...prev.malnutritionScreening
                                          .weightLoss,
                                        amount: e.target.value,
                                      },
                                    },
                                  }))
                                }
                                className="ml-2 w-20 p-1 border border-gray-300 rounded-md"
                                placeholder="kg"
                                min="0"
                                step="0.1"
                              />
                            </span>
                            {getWeightLossStatus(
                              formData.malnutritionScreening.weightLoss
                                .hasWeightLoss
                                ? "Yes"
                                : "No",
                              formData.malnutritionScreening.weightLoss.amount
                            ) && (
                              <div
                                className={`mt-2 p-2 rounded-md ${
                                  getWeightLossStatus(
                                    formData.malnutritionScreening.weightLoss
                                      .hasWeightLoss
                                      ? "Yes"
                                      : "No",
                                    formData.malnutritionScreening.weightLoss
                                      .amount
                                  )?.color
                                }`}
                              >
                                <p className="font-medium">
                                  {
                                    getWeightLossStatus(
                                      formData.malnutritionScreening.weightLoss
                                        .hasWeightLoss
                                        ? "Yes"
                                        : "No",
                                      formData.malnutritionScreening.weightLoss
                                        .amount
                                    )?.status
                                  }
                                </p>
                                <p className="mt-1 text-sm whitespace-pre-line">
                                  {
                                    getWeightLossStatus(
                                      formData.malnutritionScreening.weightLoss
                                        .hasWeightLoss
                                        ? "Yes"
                                        : "No",
                                      formData.malnutritionScreening.weightLoss
                                        .amount
                                    )?.intervention
                                  }
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={
                                formData.malnutritionScreening.weightLoss
                                  .hasWeightLoss
                              }
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  malnutritionScreening: {
                                    ...prev.malnutritionScreening,
                                    weightLoss: {
                                      ...prev.malnutritionScreening.weightLoss,
                                      hasWeightLoss: true,
                                    },
                                  },
                                }))
                              }
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">Yes</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={
                                !formData.malnutritionScreening.weightLoss
                                  .hasWeightLoss
                              }
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  malnutritionScreening: {
                                    ...prev.malnutritionScreening,
                                    weightLoss: {
                                      ...prev.malnutritionScreening.weightLoss,
                                      hasWeightLoss: false,
                                      amount: "",
                                    },
                                  },
                                }))
                              }
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">No</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">
                        Have you been eating poorly because of decreased
                        appetite?
                        {formData.malnutritionScreening.appetite.hasIssues &&
                          getAppetiteStatus(
                            formData.malnutritionScreening.appetite.details
                          ) && (
                            <div
                              className={`mt-2 p-2 rounded-md ${
                                getAppetiteStatus(
                                  formData.malnutritionScreening.appetite
                                    .details
                                )?.color
                              }`}
                            >
                              <p className="font-medium">
                                {
                                  getAppetiteStatus(
                                    formData.malnutritionScreening.appetite
                                      .details
                                  )?.status
                                }
                              </p>
                              <p className="mt-1 text-sm whitespace-pre-line">
                                {
                                  getAppetiteStatus(
                                    formData.malnutritionScreening.appetite
                                      .details
                                  )?.intervention
                                }
                              </p>
                            </div>
                          )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={
                                formData.malnutritionScreening.appetite
                                  .hasIssues
                              }
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  malnutritionScreening: {
                                    ...prev.malnutritionScreening,
                                    appetite: {
                                      ...prev.malnutritionScreening.appetite,
                                      hasIssues: true,
                                    },
                                  },
                                }))
                              }
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">Yes</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={
                                !formData.malnutritionScreening.appetite
                                  .hasIssues
                              }
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  malnutritionScreening: {
                                    ...prev.malnutritionScreening,
                                    appetite: {
                                      ...prev.malnutritionScreening.appetite,
                                      hasIssues: false,
                                      details: "",
                                    },
                                  },
                                }))
                              }
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">No</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">
                        Have you experienced any difficulty in eating?
                        {formData.malnutritionScreening?.eatingDifficulties
                          ?.hasDifficulties && (
                          <div className="mt-2 p-2 rounded-md bg-red-100 text-red-800">
                            <p className="font-medium">
                              Eating Difficulties Detected
                            </p>
                            <p className="mt-1 text-sm whitespace-pre-line">
                              1. Assess for chewing/swallowing issues or
                              oral/dental problems 2. Observe gagging, drooling,
                              or choking 3. Consult with a speech-language
                              therapist or pediatrician 4. Offer soft-textured
                              or modified consistency meals
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={
                                formData.malnutritionScreening
                                  ?.eatingDifficulties?.hasDifficulties
                              }
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  malnutritionScreening: {
                                    ...prev.malnutritionScreening,
                                    eatingDifficulties: {
                                      ...prev.malnutritionScreening
                                        .eatingDifficulties,
                                      hasDifficulties: true,
                                    },
                                  },
                                }))
                              }
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">Yes</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={
                                !formData.malnutritionScreening
                                  ?.eatingDifficulties?.hasDifficulties
                              }
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  malnutritionScreening: {
                                    ...prev.malnutritionScreening,
                                    eatingDifficulties: {
                                      ...prev.malnutritionScreening
                                        .eatingDifficulties,
                                      hasDifficulties: false,
                                      details: "",
                                    },
                                  },
                                }))
                              }
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">No</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">
                        Do you have any food allergies?
                        <br />
                        {formData.malnutritionScreening.foodAllergies
                          .hasAllergies && (
                          <span className="text-sm ml-4">
                            If yes, specify:
                            <input
                              type="text"
                              value={
                                formData.malnutritionScreening.foodAllergies
                                  .details
                              }
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  malnutritionScreening: {
                                    ...prev.malnutritionScreening,
                                    foodAllergies: {
                                      ...prev.malnutritionScreening
                                        .foodAllergies,
                                      details: e.target.value,
                                    },
                                  },
                                }))
                              }
                              className="ml-2 w-48 p-1 border border-gray-300 rounded-md"
                              placeholder="Specify allergies"
                            />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={
                                formData.malnutritionScreening.foodAllergies
                                  .hasAllergies
                              }
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  malnutritionScreening: {
                                    ...prev.malnutritionScreening,
                                    foodAllergies: {
                                      ...prev.malnutritionScreening
                                        .foodAllergies,
                                      hasAllergies: true,
                                    },
                                  },
                                }))
                              }
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">Yes</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={
                                !formData.malnutritionScreening.foodAllergies
                                  .hasAllergies
                              }
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  malnutritionScreening: {
                                    ...prev.malnutritionScreening,
                                    foodAllergies: {
                                      ...prev.malnutritionScreening
                                        .foodAllergies,
                                      hasAllergies: false,
                                      details: "",
                                    },
                                  },
                                }))
                              }
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">No</span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Form Actions */}
              <div className="border-t border-gray-200 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => router.push(`/`)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Assessment
                </button>
              </div>
            </form>
          </div>

          {/* History Table */}
          {historyRecords.length > 0 && (
            <div className="mt-6 sm:mt-8 ">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 px-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">
                  Assessment History
                </h2>
                <button
                  onClick={handleNewRecord}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  New Record
                </button>
              </div>
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-indigo-50">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                          Nurse
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {historyRecords.map((record) => (
                        <tr
                          key={record.id}
                          className={
                            selectedRecord?.id === record.id
                              ? "bg-indigo-50"
                              : ""
                          }
                        >
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(
                              record.date_of_service
                            ).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(record.created_at).toLocaleTimeString()}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.physician_name}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
