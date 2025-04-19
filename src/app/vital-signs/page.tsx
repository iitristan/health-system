"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { useSession } from "@/app/context/SessionContext";

interface VitalSign {
  id: string;
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
  physician: string;
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

interface BMIRange {
  age: number;
  boys: {
    normal: { min: number; max: number };
    severelyUnderweight: number;
    severelyOverweight: number;
    underweight: { min: number; max: number };
    overweight: { min: number; max: number };
  };
  girls: {
    normal: { min: number; max: number };
    severelyUnderweight: number;
    severelyOverweight: number;
    underweight: { min: number; max: number };
    overweight: { min: number; max: number };
  };
}

interface BloodPressureStatus {
  status: string;
  color: string;
  intervention: string;
}

interface TemperatureStatus {
  status: string;
  color: string;
  intervention: string;
}

interface RespirationStatus {
  status: string;
  color: string;
  intervention: string;
}

interface PulseStatus {
  status: string;
  color: string;
  intervention: string;
}

interface OxygenStatus {
  status: string;
  color: string;
  intervention: string;
}

const bmiRanges: BMIRange[] = [
  {
    age: 6,
    boys: {
      normal: { min: 13.2, max: 18.8 },
      severelyUnderweight: 12.8,
      severelyOverweight: 21.5,
      underweight: { min: 12.9, max: 13.1 },
      overweight: { min: 18.9, max: 21.4 },
    },
    girls: {
      normal: { min: 12.9, max: 18.3 },
      severelyUnderweight: 12.6,
      severelyOverweight: 20.6,
      underweight: { min: 12.7, max: 12.8 },
      overweight: { min: 18.4, max: 20.5 },
    },
  },
  {
    age: 7,
    boys: {
      normal: { min: 13.4, max: 19.8 },
      severelyUnderweight: 13.0,
      severelyOverweight: 23.1,
      underweight: { min: 13.1, max: 13.3 },
      overweight: { min: 19.9, max: 23.0 },
    },
    girls: {
      normal: { min: 13.2, max: 19.1 },
      severelyUnderweight: 12.8,
      severelyOverweight: 21.9,
      underweight: { min: 12.9, max: 13.1 },
      overweight: { min: 19.2, max: 21.8 },
    },
  },
  {
    age: 8,
    boys: {
      normal: { min: 13.7, max: 20.9 },
      severelyUnderweight: 13.2,
      severelyOverweight: 24.7,
      underweight: { min: 13.3, max: 13.6 },
      overweight: { min: 21.0, max: 24.6 },
    },
    girls: {
      normal: { min: 13.5, max: 20.1 },
      severelyUnderweight: 13.1,
      severelyOverweight: 23.2,
      underweight: { min: 13.2, max: 13.4 },
      overweight: { min: 20.2, max: 23.1 },
    },
  },
  {
    age: 9,
    boys: {
      normal: { min: 13.9, max: 21.8 },
      severelyUnderweight: 13.5,
      severelyOverweight: 26.1,
      underweight: { min: 13.6, max: 13.8 },
      overweight: { min: 21.9, max: 26.0 },
    },
    girls: {
      normal: { min: 13.8, max: 21.0 },
      severelyUnderweight: 13.4,
      severelyOverweight: 24.5,
      underweight: { min: 13.5, max: 13.7 },
      overweight: { min: 21.1, max: 24.4 },
    },
  },
  {
    age: 10,
    boys: {
      normal: { min: 14.2, max: 22.7 },
      severelyUnderweight: 13.8,
      severelyOverweight: 27.4,
      underweight: { min: 13.9, max: 14.1 },
      overweight: { min: 22.8, max: 27.3 },
    },
    girls: {
      normal: { min: 14.2, max: 21.9 },
      severelyUnderweight: 13.7,
      severelyOverweight: 25.7,
      underweight: { min: 13.8, max: 14.1 },
      overweight: { min: 22.0, max: 25.6 },
    },
  },
  {
    age: 11,
    boys: {
      normal: { min: 14.6, max: 23.6 },
      severelyUnderweight: 14.1,
      severelyOverweight: 28.4,
      underweight: { min: 14.2, max: 14.5 },
      overweight: { min: 23.7, max: 28.3 },
    },
    girls: {
      normal: { min: 14.5, max: 22.7 },
      severelyUnderweight: 14.1,
      severelyOverweight: 26.7,
      underweight: { min: 14.2, max: 14.4 },
      overweight: { min: 22.8, max: 26.6 },
    },
  },
  {
    age: 12,
    boys: {
      normal: { min: 14.9, max: 24.3 },
      severelyUnderweight: 14.4,
      severelyOverweight: 29.3,
      underweight: { min: 14.5, max: 14.8 },
      overweight: { min: 24.4, max: 29.2 },
    },
    girls: {
      normal: { min: 14.9, max: 23.4 },
      severelyUnderweight: 14.4,
      severelyOverweight: 27.6,
      underweight: { min: 14.5, max: 14.8 },
      overweight: { min: 23.5, max: 27.5 },
    },
  },
];

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
  const { selectedNurse } = useSession();

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

            // Fetch existing vital signs data
            const { data: vitalSignsData, error: vitalSignsError } =
              await supabase
                .from("vital_signs")
                .select(
                  `
                  *,
                  nurses:physician_id (
                    full_name,
                    position
                  )
                `
                )
                .eq("full_name", patientName)
                .order("created_at", { ascending: false });

            if (vitalSignsError) throw vitalSignsError;

            if (vitalSignsData) {
              setVitalSigns(
                vitalSignsData.map((record) => ({
                  id: record.id,
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
                  physician: record.nurses
                    ? `${record.nurses.full_name}, ${record.nurses.position}`
                    : "Not recorded",
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
  const [bmi, setBmi] = useState<string>("");

  const calculateBMI = (height: string, weight: string) => {
    if (!height || !weight || !patientInfo.age) return "";

    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);
    const ageNum = parseInt(patientInfo.age);

    if (
      isNaN(heightInMeters) ||
      isNaN(weightInKg) ||
      heightInMeters <= 0 ||
      isNaN(ageNum)
    )
      return "";

    const bmi = weightInKg / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMIStatus = (bmi: string) => {
    if (!bmi || !patientInfo.age || !patientInfo.gender)
      return { status: "", color: "", intervention: "" };

    const bmiNum = parseFloat(bmi);
    const ageNum = parseInt(patientInfo.age);
    const range = bmiRanges.find((r) => r.age === ageNum);

    if (!range) return { status: "", color: "", intervention: "" };

    const genderRange =
      patientInfo.gender.toLowerCase() === "male" ? range.boys : range.girls;

    if (bmiNum <= genderRange.severelyUnderweight) {
      return {
        status: "Severely Underweight",
        color: "bg-red-100 text-red-800",
        intervention:
          "Monitor weight, height, and BMI; assess medical history and nutrition status. Enroll in school feeding programs; provide high-calorie, nutritious snacks; encourage balanced meals. Teach children and families about proper nutrition and healthy eating habits. Check for emotional issues; prevent bullying; involve parents and caregivers. Monitor progress regularly and refer to health professionals if needed.",
      };
    }

    if (bmiNum >= genderRange.severelyOverweight) {
      return {
        status: "Severely Overweight",
        color: "bg-red-100 text-red-800",
        intervention:
          "Assess BMI and lifestyle habits regularly. Promote healthy eating and portion control. Encourage daily physical activity and reduce screen time. Involve parents and teachers in supporting healthy routines. Address emotional concerns like low self-esteem or bullying. Monitor progress and refer to health professionals if needed.",
      };
    }

    if (
      bmiNum >= genderRange.underweight.min &&
      bmiNum <= genderRange.underweight.max
    ) {
      return {
        status: "Underweight",
        color: "bg-yellow-100 text-yellow-800",
        intervention:
          "Evaluate diet and health history for possible causes (e.g., poor appetite, illness). Promote balanced, nutrient-rich meals through health teaching. Encourage healthy snacks and regular meal schedules. Coordinate with feeding programs (e.g., school lunches, milk feeding). Involve parents in planning improved home nutrition. Monitor weight regularly (monthly or quarterly). Refer to healthcare providers if weight does not improve or if underlying issues are suspected.",
      };
    }

    if (
      bmiNum >= genderRange.overweight.min &&
      bmiNum <= genderRange.overweight.max
    ) {
      return {
        status: "Overweight",
        color: "bg-yellow-100 text-yellow-800",
        intervention:
          "Assess BMI and health status using growth charts. Identify eating and activity patterns through interviews or questionnaires. Promote healthy eating habits – encourage fruits, vegetables, whole grains, and limit sugary/junk foods. Encourage regular physical activity, aim for at least 60 minutes daily. Educate on healthy screen time limits – no more than 2 hours/day. Collaborate with parents and teachers to support healthy behaviors at school and home. Monitor progress with regular follow-up on BMI and behavior changes. Refer to professionals like dietitians or doctors if needed.",
      };
    }

    if (bmiNum >= genderRange.normal.min && bmiNum <= genderRange.normal.max) {
      return {
        status: "Normal",
        color: "bg-green-100 text-green-800",
        intervention:
          "Maintain current healthy habits. Continue regular physical activity and balanced diet. Regular monitoring of growth and development is recommended.",
      };
    }

    return { status: "", color: "", intervention: "" };
  };

  const getBloodPressureStatus = (
    systolic: number,
    diastolic: number
  ): BloodPressureStatus => {
    // Normal Range
    if (
      systolic >= 95 &&
      systolic <= 110 &&
      diastolic >= 60 &&
      diastolic <= 73
    ) {
      return {
        status: "Normal Blood Pressure",
        color: "bg-green-100 text-green-800",
        intervention:
          "Blood pressure is within normal range. Continue regular monitoring and healthy lifestyle habits.",
      };
    }

    // Elevated Blood Pressure
    if (systolic >= 116 || diastolic >= 77) {
      return {
        status: "Elevated Blood Pressure",
        color: "bg-yellow-100 text-yellow-800",
        intervention: `1. Immediate Intervention:
• Recheck BP (after 5 minutes of rest) to confirm the initial reading
• Assess for symptoms (dizziness, chest pain, headache, blurry vision)
• Position child comfortably and ensure they are calm

2. Urgent Intervention:
• Provide Education: Advise parents on salt intake, physical activity, and healthy eating
• Monitor BP: Recommend regular home BP monitoring and tracking readings

3. Referral:
• Notify Physician: If BP remains elevated after recheck
• Referral to Pediatric Cardiologist if BP remains high over time or symptoms persist`,
      };
    }

    // Low Blood Pressure
    if (systolic < 97 || diastolic < 57) {
      return {
        status: "Low Blood Pressure",
        color: "bg-red-100 text-red-800",
        intervention: `1. Immediate Intervention:
• Recheck BP to confirm the accuracy of the reading
• Assess for symptoms (dizziness, fainting, fatigue)
• Position child (lie down with legs elevated to improve circulation)
• Hydrate: Offer water or electrolyte solution to increase fluid intake

2. Urgent Intervention:
• Monitor for Dehydration: Check for dry mouth, sunken eyes, and low urine output
• Dietary Support: Suggest small, frequent meals with adequate salt if necessary

3. Referral:
• Notify Physician: If BP remains low after intervention or if symptoms worsen
• Referral to Pediatrician or specialist if low BP persists or is due to underlying medical condition`,
      };
    }

    return {
      status: "Unknown Status",
      color: "bg-gray-100 text-gray-800",
      intervention: "Please enter valid blood pressure readings.",
    };
  };

  const getTemperatureStatus = (temperature: number): TemperatureStatus => {
    // Normal Range (36.5°C to 37.5°C)
    if (temperature >= 36.5 && temperature <= 37.5) {
      return {
        status: "Normal Temperature",
        color: "bg-green-100 text-green-800",
        intervention:
          "Temperature is within normal range. Continue regular monitoring.",
      };
    }

    // Elevated Temperature (Fever)
    if (temperature > 37.5) {
      return {
        status: "Elevated Temperature (Fever)",
        color: "bg-yellow-100 text-yellow-800",
        intervention: `1. Immediate Intervention:
• Recheck temperature after 15–30 minutes to confirm the reading
• Ensure proper thermometer placement (oral, tympanic, or axillary)
• Administer antipyretics (e.g., acetaminophen or ibuprofen) based on age and weight
• Encourage fluid intake (water, broth, or electrolyte solutions)
• Keep child in a cool, well-ventilated environment
• Dress child lightly and use lukewarm sponge baths if necessary

2. Urgent Intervention:
• Monitor for warning signs:
  - Fever lasting more than 72 hours
  - Seizures
  - Rash
  - Lethargy
  - Difficulty breathing
• Educate caregivers on proper dosing of antipyretics and signs of complications

3. Referral:
• Notify physician if fever persists or worsens despite interventions
• Referral to pediatrician or infectious disease specialist if serious infection is suspected
• Refer if child shows neurological symptoms (e.g., seizures, altered consciousness)`,
      };
    }

    // Low Temperature (Hypothermia)
    if (temperature < 36.5) {
      return {
        status: "Low Temperature (Hypothermia)",
        color: "bg-red-100 text-red-800",
        intervention: `1. Immediate Intervention:
• Recheck temperature to confirm reading and ensure accurate placement
• Move child to a warm, dry environment
• Remove wet or damp clothing
• Wrap in blankets and prioritize warming neck, chest, and groin areas
• Offer warm fluids (e.g., broth or water) if child is alert and can swallow safely

2. Urgent Intervention:
• Monitor for warning signs:
  - Fever lasting more than 72 hours
  - Seizures
  - Rash
  - Lethargy
  - Difficulty breathing
• Educate caregivers on proper dosing of antipyretics and signs of complications

3. Referral:
• Notify physician if fever persists or worsens despite interventions
• Referral to pediatrician or infectious disease specialist if serious infection is suspected
• Refer if child shows neurological symptoms (e.g., seizures, altered consciousness)`,
      };
    }

    return {
      status: "Unknown Status",
      color: "bg-gray-100 text-gray-800",
      intervention: "Please enter a valid temperature reading.",
    };
  };

  const getRespirationStatus = (rate: number): RespirationStatus => {
    // Normal Range (18-30 bpm)
    if (rate >= 18 && rate <= 30) {
      return {
        status: "Normal Respiratory Rate",
        color: "bg-green-100 text-green-800",
        intervention:
          "Respiratory rate is within normal range. Continue regular monitoring.",
      };
    }

    // Tachypnea (>30 bpm)
    if (rate > 30) {
      let intervention = "";
      if (rate <= 32) {
        intervention = `Immediate intervention (30-32 bpm):
1. Monitor respiratory rate, rhythm, and depth.
2. Observe for signs of increased work of breathing (nasal flaring, use of accessory muscles).
3. Position the child in a way that promotes optimal lung expansion, such as in a prone or side-lying position.
4. Provide a calm, reassuring presence and explain procedures to the child.
5. Encourage fluid intake if appropriate to help thin secretions and promote airway clearance.`;
      } else if (rate <= 35) {
        intervention = `Urgent intervention (32-35 bpm):
1. Monitor respiratory rate, depth, and rhythm for any signs of distress
2. Use a pulse oximeter to measure oxygen saturation (SpO2).
3. If SpO2 is below 90% or the patient is showing signs of respiratory distress, administer oxygen as ordered.
4. Position the patient in a position of comfort, often a high-Fowler's position or leaning forward, to help expand lung capacity.
5. Encourage coughing and deep breathing to help clear secretions
6. Administer medications as ordered.`;
      } else {
        intervention = `Referral intervention (>35 bpm):
1. Notify attending physician if chest pain, difficulty breathing, or bluish or grayish skin/lips are present.
2. Refer to a specialist if RR remains more than 30 breaths per minute.`;
      }

      return {
        status: "Tachypnea",
        color: "bg-yellow-100 text-yellow-800",
        intervention: intervention,
      };
    }

    // Bradypnea (<18 bpm)
    if (rate < 18) {
      let intervention = "";
      if (rate >= 16) {
        intervention = `Immediate intervention (16-17 bpm):
• Assess and maintain airway patency—ensure the student is not choking or obstructed and reposition if needed (e.g., head tilt-chin lift).
• Call for emergency medical services (EMS) if respiratory rate is critically low or if the student is unresponsive.
• Monitor respiratory rate, depth, and pattern, and document changes every 2–3 minutes.
• Administer oxygen if available and per school protocol, especially if signs of hypoxia are present (e.g., cyanosis, confusion).
• Stay with the student and provide continuous reassurance to reduce anxiety, which can worsen respiratory function.`;
      } else if (rate >= 13) {
        intervention = `Urgent intervention (13-15 bpm):
• Assess respiratory rate, depth, and pattern; compare to age-appropriate norms and identify any associated symptoms (e.g., drowsiness, cyanosis).
• Administer oxygen via nasal cannula if oxygen saturation drops below normal limits and as per school protocol or standing orders.
• Position the student upright to facilitate easier breathing and reduce work of breathing.
• Notify parent/guardian and school physician immediately for medical evaluation and possible transport.
• Prepare for emergency referral (e.g., call EMS) if the student shows signs of altered consciousness, oxygen desaturation, or worsening respiratory status.`;
      } else {
        intervention = `Referral intervention (<12 bpm):
• Notify the student's parent/guardian immediately and advise urgent medical evaluation due to abnormally slow breathing.
• Refer the student to a primary care provider or pediatrician for assessment of possible underlying causes (e.g., medication side effects, neurological conditions, metabolic imbalances).
• Coordinate with the school physician (if available) for an initial review and recommendation for next steps.
• Provide documentation of the observed respiratory rate, symptoms, and any triggering events to assist healthcare providers during evaluation.
• Recommend further referral to a pulmonologist or neurologist if bradypnea is recurrent or associated with other symptoms (e.g., fatigue, cyanosis, confusion).`;
      }

      return {
        status: "Bradypnea",
        color: "bg-red-100 text-red-800",
        intervention: intervention,
      };
    }

    return {
      status: "Unknown Status",
      color: "bg-gray-100 text-gray-800",
      intervention: "Please enter a valid respiratory rate.",
    };
  };

  const getPulseStatus = (rate: number): PulseStatus => {
    // Normal Range (70-110 bpm)
    if (rate >= 70 && rate <= 110) {
      return {
        status: "Normal Pulse Rate",
        color: "bg-green-100 text-green-800",
        intervention:
          "Pulse rate is within normal range. Continue regular monitoring.",
      };
    }

    // Tachycardia (>110 bpm)
    if (rate > 110) {
      let intervention = "";
      if (rate <= 111) {
        intervention = `Immediate Intervention (Borderline Tachycardia: 110-111 bpm):
• Reassess pulse after a period of rest.
• Ask about recent activity, stress, or stimulant intake (e.g., caffeine).
• Encourage calm breathing exercises.
• Monitor if pulse rate returns to normal within 15–30 minutes.
• If persistent, escalate to a physician for evaluation.`;
      } else if (rate <= 130) {
        intervention = `Urgent Intervention (Tachycardia: 112-130 bpm):
• Assess for underlying causes:
  - Fever
  - Pain
  - Anxiety or fear
  - Dehydration
  - Anemia or infection
• Recheck vital signs, especially temperature and respiratory rate.
• Promote rest and a calm environment.
• Encourage fluid intake if not contraindicated.
• Inform the physician for further assessment or orders.`;
      } else {
        intervention = `Referral Intervention (Severe Tachycardia: >130 bpm):
• Perform immediate assessment for palpitations, syncope, chest pain, or shortness of breath.
• Position the patient in a semi-Fowler's or comfortable position.
• Administer oxygen as ordered.
• Notify the physician STAT for further evaluation.

Referral is indicated if:
• Heart rate remains elevated despite rest and calming interventions.
• Accompanied by underlying cardiac disease, hyperthyroidism, sepsis, or pulmonary embolism.
• There's a risk of hemodynamic instability or decompensation (e.g., drop in blood pressure or consciousness).
• Physicians need to adjust medications, start antiarrhythmics, or perform further work-up.`;
      }

      return {
        status: "Tachycardia",
        color: "bg-yellow-100 text-yellow-800",
        intervention: intervention,
      };
    }

    // Bradycardia (<70 bpm)
    if (rate < 70) {
      let intervention = "";
      if (rate >= 69) {
        intervention = `Immediate Intervention (Borderline Bradycardia: 69-70 bpm):
• Reassess pulse after a period of rest and hydration.
• Ask about recent physical exertion, sleep, or emotional stress.
• Check if patient is taking rate-reducing agents (e.g., antihypertensives).
• Encourage slow breathing exercises and allow the patient to relax.
• Monitor for symptom resolution or pulse normalization.
• If the pulse remains borderline low or the patient becomes symptomatic, escalate for physician review.`;
      } else if (rate >= 60) {
        intervention = `Urgent Intervention (Bradycardia: 60-68 bpm):
• Assess for symptoms like dizziness, fatigue, weakness, chest pain, or shortness of breath.
• Check for contributing factors such as:
  - Medications (e.g., beta-blockers or digoxin)
  - Recent intense exercise
  - Hypothyroidism or electrolyte imbalances
• Monitor vital signs closely and document any patterns or changes.
• Notify the physician if bradycardia is persistent or symptomatic.`;
      } else {
        intervention = `Referral Intervention (Severely Slow: <60 bpm):
• Immediately assess for symptoms such as altered consciousness, hypotension, chest pain, or cyanosis.
• Monitor oxygen saturation and support airway if needed.
• Notify physician STAT for emergency evaluation.

Referral is indicated if:
• Bradycardia persists despite rest and initial interventions.
• There is a history of conduction disorders, recent myocardial infarction, sick sinus syndrome, or heart block.
• Patient is on medications that may require dosage adjustment (e.g., digoxin, beta-blockers) and only the physician can manage it.
• Symptoms severely affect daily functioning or consciousness.`;
      }

      return {
        status: "Bradycardia",
        color: "bg-red-100 text-red-800",
        intervention: intervention,
      };
    }

    return {
      status: "Unknown Status",
      color: "bg-gray-100 text-gray-800",
      intervention: "Please enter a valid pulse rate.",
    };
  };

  const getOxygenStatus = (saturation: number): OxygenStatus => {
    if (saturation >= 95 && saturation <= 100) {
      return {
        status: "Normal Oxygen Saturation",
        color: "bg-green-100 text-green-800",
        intervention:
          "Oxygen saturation is within normal range. Continue regular monitoring.",
      };
    }

    if (saturation > 100) {
      return {
        status: "Hyperoxia",
        color: "bg-yellow-100 text-yellow-800",
        intervention: `Immediate Intervention (SpO₂ > 100%):
• Lower the oxygen flow rate if the child is stable and not in respiratory distress.
• Review the oxygen prescription and confirm the target range for the child (typically 95–98%).
• Reassure the child and encourage calm breathing to help reduce anxiety-related over-breathing.
• Monitor SpO₂ continuously using a pulse oximeter and watch for any changes in breathing patterns or comfort.`,
      };
    }

    if (saturation < 95) {
      if (saturation >= 91) {
        return {
          status: "Mild Hypoxia",
          color: "bg-yellow-100 text-yellow-800",
          intervention: `Immediate Intervention (SpO₂ 91-94%):
• Reposition the child to High Fowler's or Semi-Fowler's position to promote lung expansion.
• Encourage calm deep breathing exercises to enhance oxygen intake.
• Check and ensure the oxygen delivery device (if in use) is properly placed and functioning.
• Continue to monitor oxygen saturation closely using a pulse oximeter for changes.`,
        };
      } else if (saturation >= 86) {
        return {
          status: "Moderate Hypoxia",
          color: "bg-orange-100 text-orange-800",
          intervention: `Urgent Intervention (SpO₂ 86-90%):
• Apply supplemental oxygen via nasal cannula or face mask as prescribed.
• Perform airway suctioning if secretions or obstructions are suspected.
• Administer prescribed bronchodilators or nebulized medications to improve airway patency.
• Continuously monitor vital signs and SpO₂ and observe for signs of respiratory distress.`,
        };
      } else {
        return {
          status: "Severe Hypoxia",
          color: "bg-red-100 text-red-800",
          intervention: `Referral Intervention (SpO₂ < 85%):
• Immediately administer high-flow oxygen using a non-rebreather mask.
• Activate the emergency response system or notify the healthcare provider urgently.
• Prepare for possible advanced airway management (e.g., bag-valve-mask ventilation, intubation).
• Stay with the child and offer reassurance while preparing for rapid medical intervention.`,
        };
      }
    }

    return {
      status: "Unknown Status",
      color: "bg-gray-100 text-gray-800",
      intervention: "Please enter a valid oxygen saturation value.",
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEntry((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Calculate BMI when height or weight changes
    if (name === "height" || name === "weight") {
      const height = name === "height" ? value : newEntry.height;
      const weight = name === "weight" ? value : newEntry.weight;

      if (height && weight) {
        const heightInMeters = parseFloat(height) / 100;
        const weightInKg = parseFloat(weight);

        if (
          !isNaN(heightInMeters) &&
          !isNaN(weightInKg) &&
          heightInMeters > 0
        ) {
          const calculatedBMI = (
            weightInKg /
            (heightInMeters * heightInMeters)
          ).toFixed(1);
          setBmi(calculatedBMI);
        } else {
          setBmi("");
        }
      } else {
        setBmi("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!patientName) {
      setError("Please select a patient before saving vital signs.");
      return;
    }

    if (!selectedNurse) {
      setError(
        "Please select a nurse from the profile page before saving vital signs."
      );
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
        setError(
          "Height must be less than 1000 cm. Please enter a valid height."
        );
        return;
      }

      if (weight > 999.99) {
        setError(
          "Weight must be less than 1000 kg. Please enter a valid weight."
        );
        return;
      }

      // Insert vital signs data
      const { error: insertError } = await supabase.from("vital_signs").insert([
        {
          full_name: patientName,
          physician_id: selectedNurse.id,
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
          setError(
            " Height values is too small. Please check your entries and try again."
          );
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
            id: record.id,
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
            physician: record.nurses
              ? `${record.nurses.full_name}, ${record.nurses.position}`
              : "Not recorded",
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
      router.push(
        `/health-assessment?patient=${encodeURIComponent(patientName || "")}`
      );
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
      router.push("/vital-signs");
    }
  };

  // Update the getTableCellColor function to include BMI
  const getTableCellColor = (
    type: string,
    value: number,
    age?: number,
    gender?: string
  ) => {
    switch (type) {
      case "oxygen":
        if (value > 100) return "bg-yellow-100";
        if (value >= 95 && value <= 100) return "bg-green-100";
        if (value >= 91) return "bg-yellow-100";
        if (value >= 86) return "bg-orange-100";
        return "bg-red-100";

      case "pulse":
        if (value >= 70 && value <= 110) return "bg-green-100";
        if (value > 110) return "bg-yellow-100";
        if (value < 70) return "bg-red-100";
        return "";

      case "respiration":
        if (value >= 18 && value <= 30) return "bg-green-100";
        if (value > 30) return "bg-yellow-100";
        if (value < 18) return "bg-red-100";
        return "";

      case "temperature":
        if (value >= 36.5 && value <= 37.5) return "bg-green-100";
        if (value > 37.5) return "bg-yellow-100";
        if (value < 36.5) return "bg-red-100";
        return "";

      case "bloodPressure":
        const [systolic, diastolic] = value.toString().split("/").map(Number);
        if (
          systolic >= 95 &&
          systolic <= 110 &&
          diastolic >= 60 &&
          diastolic <= 73
        )
          return "bg-green-100";
        if (systolic >= 116 || diastolic >= 77) return "bg-yellow-100";
        if (systolic < 97 || diastolic < 57) return "bg-red-100";
        return "";

      case "bmi":
        if (!age || !gender) return "";
        const range = bmiRanges.find((r) => r.age === age);
        if (!range) return "";

        const genderRange =
          gender.toLowerCase() === "male" ? range.boys : range.girls;

        if (value <= genderRange.severelyUnderweight) return "bg-red-100";
        if (value >= genderRange.severelyOverweight) return "bg-red-100";
        if (
          value >= genderRange.underweight.min &&
          value <= genderRange.underweight.max
        )
          return "bg-yellow-100";
        if (
          value >= genderRange.overweight.min &&
          value <= genderRange.overweight.max
        )
          return "bg-yellow-100";
        if (value >= genderRange.normal.min && value <= genderRange.normal.max)
          return "bg-green-100";
        return "";

      default:
        return "";
    }
  };

  // Add this helper function before the return statement
  const getStatusTooltip = (
    type: string,
    value: number,
    age?: number,
    gender?: string
  ) => {
    switch (type) {
      case "oxygen":
        if (value > 100) return "Hyperoxia - Immediate intervention required";
        if (value >= 95 && value <= 100) return "Normal Oxygen Saturation";
        if (value >= 91)
          return "Mild Hypoxia - Immediate intervention required";
        if (value >= 86)
          return "Moderate Hypoxia - Urgent intervention required";
        return "Severe Hypoxia - Referral required";

      case "pulse":
        if (value >= 70 && value <= 110) return "Normal Pulse Rate";
        if (value > 110) {
          if (value <= 111)
            return "Borderline Tachycardia - Immediate intervention required";
          if (value <= 130) return "Tachycardia - Urgent intervention required";
          return "Severe Tachycardia - Referral required";
        }
        if (value < 70) {
          if (value >= 69)
            return "Borderline Bradycardia - Immediate intervention required";
          if (value >= 60) return "Bradycardia - Urgent intervention required";
          return "Severe Bradycardia - Referral required";
        }
        return "";

      case "respiration":
        if (value >= 18 && value <= 30) return "Normal Respiratory Rate";
        if (value > 30) {
          if (value <= 32) return "Tachypnea - Immediate intervention required";
          if (value <= 35) return "Tachypnea - Urgent intervention required";
          return "Severe Tachypnea - Referral required";
        }
        if (value < 18) {
          if (value >= 16) return "Bradypnea - Immediate intervention required";
          if (value >= 13) return "Bradypnea - Urgent intervention required";
          return "Severe Bradypnea - Referral required";
        }
        return "";

      case "temperature":
        if (value >= 36.5 && value <= 37.5) return "Normal Temperature";
        if (value > 37.5)
          return "Elevated Temperature - Immediate intervention required";
        if (value < 36.5)
          return "Low Temperature - Immediate intervention required";
        return "";

      case "bloodPressure":
        const [systolic, diastolic] = value.toString().split("/").map(Number);
        if (
          systolic >= 95 &&
          systolic <= 110 &&
          diastolic >= 60 &&
          diastolic <= 73
        )
          return "Normal Blood Pressure";
        if (systolic >= 116 || diastolic >= 77)
          return "Elevated Blood Pressure - Immediate intervention required";
        if (systolic < 97 || diastolic < 57)
          return "Low Blood Pressure - Immediate intervention required";
        return "";

      case "bmi":
        if (!age || !gender) return "";
        const range = bmiRanges.find((r) => r.age === age);
        if (!range) return "";

        const genderRange =
          gender.toLowerCase() === "male" ? range.boys : range.girls;

        if (value <= genderRange.severelyUnderweight)
          return "Severely Underweight - Referral required";
        if (value >= genderRange.severelyOverweight)
          return "Severely Overweight - Referral required";
        if (
          value >= genderRange.underweight.min &&
          value <= genderRange.underweight.max
        )
          return "Underweight - Urgent intervention required";
        if (
          value >= genderRange.overweight.min &&
          value <= genderRange.overweight.max
        )
          return "Overweight - Urgent intervention required";
        if (value >= genderRange.normal.min && value <= genderRange.normal.max)
          return "Normal BMI";
        return "";

      default:
        return "";
    }
  };

  const handleViewRecord = (record: VitalSign) => {
    if (!record) return;

    setNewEntry({
      bloodPressure: record.bloodPressure || "",
      temperature: record.temperature?.toString() || "",
      pulseRate: record.pulseRate?.toString() || "",
      respirationRate: record.respirationRate?.toString() || "",
      weight: record.weight?.toString() || "",
      height: record.height?.toString() || "",
      oxygen: record.oxygen?.toString() || "",
      painScale: record.painScale?.toString() || "",
      comments: record.comments || "",
    });

    if (record.height && record.weight) {
      setBmi(calculateBMI(record.height.toString(), record.weight.toString()));
    } else {
      setBmi("");
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!recordId) {
      setError("Invalid record ID");
      return;
    }

    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      const { error } = await supabase
        .from("vital_signs")
        .delete()
        .eq("id", recordId);

      if (error) throw error;

      // Refresh the vital signs data
      const { data: vitalSignsData, error: fetchError } = await supabase
        .from("vital_signs")
        .select("*")
        .eq("full_name", patientName)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      if (vitalSignsData) {
        setVitalSigns(
          vitalSignsData.map((record) => ({
            id: record.id,
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
            physician: record.nurses
              ? `${record.nurses.full_name}, ${record.nurses.position}`
              : "Not recorded",
          }))
        );
      }

      alert("Record deleted successfully!");
    } catch (error) {
      console.error("Error deleting record:", error);
      setError("Failed to delete record. Please try again.");
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
            <p className="mt-1 text-lg text-indigo-200">Vital Signs</p>
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
              Vital Signs Form
            </h2>
            <span className="text-l text-gray-200">
            To record a patient&apos;s vital signs, first type the patient&apos;s name
              in the search bar or choose from the list provided. Then, go to
              the &quot;Vital Signs&quot; section and enter the necessary information such
              as blood pressure, temperature, respiratory rate, pulse rate, and
              oxygen saturation. If you have any additional observations or
              notes, you can write them in the comments section. Once all the
              details are filled in, click the &quot;Save&quot; button to save the
              information.
            </span>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
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
                    onClick={() =>
                      router.push(`/patient-information?returnTo=/vital-signs`)
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      placeholder="e.g. 120/80"
                      required
                    />
                    {newEntry.bloodPressure &&
                      (() => {
                        const [systolic, diastolic] = newEntry.bloodPressure
                          .split("/")
                          .map(Number);
                        if (!isNaN(systolic) && !isNaN(diastolic)) {
                          const bpStatus = getBloodPressureStatus(
                            systolic,
                            diastolic
                          );
                          return (
                            <div
                              className={`mt-2 p-3 rounded ${bpStatus.color}`}
                            >
                              <p className="font-medium">{bpStatus.status}</p>
                              <p className="text-sm mt-1 whitespace-pre-line">
                                {bpStatus.intervention}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      placeholder="°C"
                      required
                    />
                    {newEntry.temperature &&
                      (() => {
                        const temp = parseFloat(newEntry.temperature);
                        if (!isNaN(temp)) {
                          const tempStatus = getTemperatureStatus(temp);
                          return (
                            <div
                              className={`mt-2 p-3 rounded ${tempStatus.color}`}
                            >
                              <p className="font-medium">{tempStatus.status}</p>
                              <p className="text-sm mt-1 whitespace-pre-line">
                                {tempStatus.intervention}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      placeholder="bpm"
                      required
                    />
                    {newEntry.pulseRate &&
                      (() => {
                        const rate = parseFloat(newEntry.pulseRate);
                        if (!isNaN(rate)) {
                          const pulseStatus = getPulseStatus(rate);
                          return (
                            <div
                              className={`mt-2 p-3 rounded ${pulseStatus.color}`}
                            >
                              <p className="font-medium">
                                {pulseStatus.status}
                              </p>
                              <p className="text-sm mt-1 whitespace-pre-line">
                                {pulseStatus.intervention}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      placeholder="breaths/min"
                      required
                    />
                    {newEntry.respirationRate &&
                      (() => {
                        const rate = parseFloat(newEntry.respirationRate);
                        if (!isNaN(rate)) {
                          const respStatus = getRespirationStatus(rate);
                          return (
                            <div
                              className={`mt-2 p-3 rounded ${respStatus.color}`}
                            >
                              <p className="font-medium">{respStatus.status}</p>
                              <p className="text-sm mt-1 whitespace-pre-line">
                                {respStatus.intervention}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                      placeholder="%"
                      required
                    />
                    {newEntry.oxygen &&
                      (() => {
                        const saturation = parseFloat(newEntry.oxygen);
                        if (!isNaN(saturation)) {
                          const oxygenStatus = getOxygenStatus(saturation);
                          return (
                            <div
                              className={`mt-2 p-3 rounded ${oxygenStatus.color}`}
                            >
                              <p className="font-medium">
                                {oxygenStatus.status}
                              </p>
                              <p className="text-sm mt-1 whitespace-pre-line">
                                {oxygenStatus.intervention}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
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

              {/* Add BMI display after height and weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  BMI
                </label>
                <input
                  type="text"
                  value={bmi}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  placeholder="BMI will be calculated automatically"
                />
                {bmi && (
                  <div
                    className={`mt-2 p-3 rounded ${getBMIStatus(bmi).color}`}
                  >
                    <p className="font-medium">{getBMIStatus(bmi).status}</p>
                    <p className="text-sm mt-1 whitespace-pre-line">
                      {getBMIStatus(bmi).intervention}
                    </p>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex justify-end space-x-4">
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
                  Save and Continue
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
                          Physician
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
                          BMI
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Oxygen
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comments
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
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
                        <th className="px-6 py-2 text-left text-xs text-gray-500"></th>
                        <th className="px-6 py-2 text-left text-xs text-gray-500"></th>
                        <th className="px-6 py-2 text-left text-xs text-gray-500"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vitalSigns.map((record, index) => {
                        const heightInMeters = record.height / 100;
                        const bmi =
                          record.weight / (heightInMeters * heightInMeters);

                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {record.dateTime}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {record.physician}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="group relative">
                                <div className="absolute left-0 bottom-full mb-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[200px] max-w-[400px]">
                                  <div className="text-sm whitespace-normal">
                                    {getStatusTooltip(
                                      "bloodPressure",
                                      parseFloat(
                                        record.bloodPressure.split("/")[0]
                                      )
                                    )}
                                  </div>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded ${getTableCellColor(
                                    "bloodPressure",
                                    parseFloat(
                                      record.bloodPressure.split("/")[0]
                                    )
                                  )}`}
                                >
                                  {record.bloodPressure} mmHg
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="group relative">
                                <div className="absolute left-0 bottom-full mb-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[200px] max-w-[400px]">
                                  <div className="text-sm whitespace-normal">
                                    {getStatusTooltip(
                                      "temperature",
                                      record.temperature
                                    )}
                                  </div>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded ${getTableCellColor(
                                    "temperature",
                                    record.temperature
                                  )}`}
                                >
                                  {record.temperature}°C
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="group relative">
                                <div className="absolute left-0 bottom-full mb-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[200px] max-w-[400px]">
                                  <div className="text-sm whitespace-normal">
                                    {getStatusTooltip(
                                      "pulse",
                                      record.pulseRate
                                    )}
                                  </div>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded ${getTableCellColor(
                                    "pulse",
                                    record.pulseRate
                                  )}`}
                                >
                                  {record.pulseRate} bpm
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="group relative">
                                <div className="absolute left-0 bottom-full mb-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[200px] max-w-[400px]">
                                  <div className="text-sm whitespace-normal">
                                    {getStatusTooltip(
                                      "respiration",
                                      record.respirationRate
                                    )}
                                  </div>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded ${getTableCellColor(
                                    "respiration",
                                    record.respirationRate
                                  )}`}
                                >
                                  {record.respirationRate} breaths/min
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {record.weight} kg
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {record.height} cm
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="group relative">
                                <div className="absolute left-0 bottom-full mb-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[200px] max-w-[400px]">
                                  <div className="text-sm whitespace-normal">
                                    {getStatusTooltip(
                                      "bmi",
                                      bmi,
                                      parseInt(patientInfo.age),
                                      patientInfo.gender
                                    )}
                                  </div>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded ${getTableCellColor(
                                    "bmi",
                                    bmi,
                                    parseInt(patientInfo.age),
                                    patientInfo.gender
                                  )}`}
                                >
                                  {bmi.toFixed(1)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="group relative">
                                <div className="absolute left-0 bottom-full mb-1 p-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[200px] max-w-[400px]">
                                  <div className="text-sm whitespace-normal">
                                    {getStatusTooltip("oxygen", record.oxygen)}
                                  </div>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded ${getTableCellColor(
                                    "oxygen",
                                    record.oxygen
                                  )}`}
                                >
                                  {record.oxygen}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {record.comments}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleViewRecord(record)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRecord(record.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </div>
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
        </div>
      </div>
    </div>
  );
}
