"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/app/context/SessionContext";
import { Suspense } from "react";

interface HairAssessmentRecord {
  id: string;
  full_name: string;
  physician_id: string;
  date_of_service: string;
  created_at: string;
  physician_info?: {
    full_name: string;
    position: string;
  };
  // Hair Type
  hair_type_straight: boolean;
  hair_type_wavy: boolean;
  hair_type_curly: boolean;
  hair_type_oily: boolean;
  // Hair Texture
  hair_texture_fine: boolean;
  hair_texture_medium: boolean;
  hair_texture_coarse: boolean;
  // Hair Color
  hair_color_natural: boolean;
  hair_color_dyed: boolean;
  hair_color_highlights_lowlights: boolean;
  // Hair Length
  hair_length_short: boolean;
  hair_length_medium: boolean;
  hair_length_long: boolean;
  // Scalp Sensitivity
  scalp_sensitivity_non_sensitive: boolean;
  scalp_sensitivity_mildly_sensitive: boolean;
  scalp_sensitivity_moderately_sensitive: boolean;
  scalp_sensitivity_highly_sensitive: boolean;
  // Scalp Condition
  scalp_condition_dry: boolean;
  scalp_condition_oily: boolean;
  scalp_condition_flaky: boolean;
  scalp_condition_irritated: boolean;
  scalp_condition_normal: boolean;
  // Hair Density
  hair_density_thick: boolean;
  hair_density_medium: boolean;
  hair_density_thin: boolean;
  // Hair Elasticity
  hair_elasticity_elastic: boolean;
  hair_elasticity_brittle: boolean;
  hair_elasticity_prone_to_breakage: boolean;
  // Hair Porosity
  hair_porosity_low: boolean;
  hair_porosity_normal: boolean;
  hair_porosity_high: boolean;
  // Dandruff
  dandruff_present: boolean;
  dandruff_amount: string;
  // Scalp Conditions
  scalp_condition_psoriasis: boolean;
  scalp_condition_seborrheic_dermatitis: boolean;
  scalp_condition_acne: boolean;
  scalp_condition_folliculitis: boolean;
  scalp_condition_na: boolean;
  // Hair Loss
  hair_loss_present: boolean;
  hair_loss_pattern: string;
  hair_loss_amount: string;
  hair_loss_duration: string;
  // Hair Breakage
  hair_breakage_present: boolean;
  hair_breakage_length: string;
  hair_breakage_frequency: string;
  hair_breakage_possible_causes: string;
  // Split Ends
  split_ends_present: boolean;
  split_ends_severity_mild: boolean;
  split_ends_severity_moderate: boolean;
  split_ends_severity_severe: boolean;
  split_ends_distribution_localized: boolean;
  split_ends_distribution_widespread: boolean;
  // Hair Care Routine
  hair_care_routine_shampoo: string;
  hair_care_routine_conditioner: string;
  hair_care_routine_styling_products: string;
  hair_care_routine_heat_styling: string;
  // Hair Growth
  hair_growth_symmetrical: boolean;
  hair_growth_asymmetrical: boolean;
  hair_growth_normal_amount: boolean;
  hair_growth_excessive_amount: boolean;
  // Body Hair
  body_hair_symmetrical: boolean;
  body_hair_asymmetrical: boolean;
  body_hair_normal_amount: boolean;
  body_hair_excessive_amount: boolean;
}

const HairAssessmentPage: NextPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HairAssessmentPageContent />
    </Suspense>
  );
};

const HairAssessmentPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientName = searchParams.get("patient");
  const { selectedNurse } = useSession();
  const [patients, setPatients] = useState<
    Array<{ full_name: string; age: number; gender: string }>
  >([]);
  const [selectedPatient, setSelectedPatient] = useState(patientName || "");
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(
    new Date().toLocaleDateString()
  );
  const [attending, setAttending] = useState(
    selectedNurse
      ? `${selectedNurse.full_name}, ${selectedNurse.position}`
      : "N/A"
  );
  const [historyRecords, setHistoryRecords] = useState<HairAssessmentRecord[]>(
    []
  );
  const [selectedRecord, setSelectedRecord] =
    useState<HairAssessmentRecord | null>(null);

  const [formData, setFormData] = useState({
    hairType: {
      straight: true,
      wavy: false,
      curly: false,
      oily: false,
    },
    hairTexture: {
      fine: true,
      medium: false,
      coarse: false,
    },
    hairColor: {
      natural: true,
      dyed: false,
      highlightsLowlights: false,
    },
    hairLength: {
      short: true,
      medium: false,
      long: false,
    },
    scalpSensitivity: {
      nonSensitive: true,
      mildlySensitive: false,
      moderatelySensitive: false,
      highlySensitive: false,
    },
    scalpCondition: {
      dry: false,
      oily: false,
      flaky: false,
      irritated: false,
      normal: true,
    },
    hairDensity: {
      thick: false,
      medium: true,
      thin: false,
    },
    hairElasticity: {
      elastic: true,
      brittle: false,
      proneToBreakage: false,
    },
    hairPorosity: {
      lowPorosity: false,
      normalPorosity: true,
      highPorosity: false,
    },
    dandruff: {
      yes: false,
      no: true,
      amount: "",
    },
    scalpConditions: {
      psoriasis: false,
      seborrheicDermatitis: false,
      scalpAcne: false,
      folliculitis: false,
      na: true,
    },
    hairLoss: {
      present: false,
      pattern: "",
      amount: "",
      duration: "",
    },
    hairBreakage: {
      present: false,
      length: "",
      frequency: "",
      possibleCauses: "",
    },
    splitEnds: {
      present: false,
      severity: {
        mild: false,
        moderate: false,
        severe: false,
      },
      distribution: {
        localized: false,
        widespread: false,
      },
    },
    hairCareRoutine: {
      shampoo: "O.D",
      conditioner: "O.D",
      stylingProducts: "NONE",
      heatStyling: "NONE",
    },
    hairGrowth: {
      symmetricallyDirection: true,
      asymmetricallyDistributed: false,
      normalAmount: false,
      excessiveAmount: false,
    },
    bodyHair: {
      symmetricallyDirection: true,
      asymmetricallyDistributed: false,
      normalAmount: false,
      excessiveAmount: false,
    },
  });

  // Add effect to update attending info when selectedNurse changes
  useEffect(() => {
    if (selectedNurse) {
      setAttending(`${selectedNurse.full_name}, ${selectedNurse.position}`);
    }
  }, [selectedNurse]);

  // Only redirect if we're on the main hair assessment page without a patient
  useEffect(() => {
    if (!selectedNurse && !patientName) {
      alert("Please select a staff from the dashboard first.");
      router.push("/");
    }
  }, [selectedNurse, patientName, router]);

  // Fetch all patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data, error } = await supabase
          .from("patients")
          .select("full_name, age, gender")
          .order("full_name");

        if (error) throw error;
        setPatients(data || []);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setError("Failed to load patients. Please try again.");
      }
    };

    fetchPatients();
  }, []);

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedPatient(selectedName);
    if (selectedName) {
      router.push(
        `/hair-assessment?patient=${encodeURIComponent(selectedName)}`
      );
    } else {
      router.push("/hair-assessment");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      const [parent, child, subChild] = name.split(".");

      if (subChild) {
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent]?.[child],
              [subChild]: checked,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: checked,
          },
        }));
      }
    } else {
      const [parent, child, subChild] = name.split(".");

      if (subChild) {
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent]?.[child],
              [subChild]: value,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        }));
      }
    }
  };

  const selectedPatientData = patients.find(
    (p) => p.full_name === selectedPatient
  );

  const fetchHistoryRecords = async () => {
    if (!selectedPatient) return;

    try {
      const { data: records, error } = await supabase
        .from("hair_assessment_records")
        .select("*")
        .eq("full_name", selectedPatient)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Enrich records with physician info
      const enrichedRecords = await Promise.all(
        records.map(async (record) => {
          const { data: physicianData } = await supabase
            .from("nurses")
            .select("full_name, position")
            .eq("id", record.physician_id)
            .single();

          return {
            ...record,
            physician_info: physicianData || null,
          };
        })
      );

      setHistoryRecords(enrichedRecords);
    } catch (error) {
      console.error("Error fetching history records:", error);
    }
  };

  useEffect(() => {
    if (selectedPatient) {
      fetchHistoryRecords();
    }
  }, [selectedPatient]);

  const handleViewRecord = (record: HairAssessmentRecord) => {
    setSelectedRecord(record);
    const formDataFromRecord = {
      hairType: {
        straight: Boolean(record.hair_type_straight),
        wavy: Boolean(record.hair_type_wavy),
        curly: Boolean(record.hair_type_curly),
        oily: Boolean(record.hair_type_oily),
      },
      hairTexture: {
        fine: Boolean(record.hair_texture_fine),
        medium: Boolean(record.hair_texture_medium),
        coarse: Boolean(record.hair_texture_coarse),
      },
      hairColor: {
        natural: Boolean(record.hair_color_natural),
        dyed: Boolean(record.hair_color_dyed),
        highlightsLowlights: Boolean(record.hair_color_highlights_lowlights),
      },
      hairLength: {
        short: Boolean(record.hair_length_short),
        medium: Boolean(record.hair_length_medium),
        long: Boolean(record.hair_length_long),
      },
      scalpSensitivity: {
        nonSensitive: Boolean(record.scalp_sensitivity_non_sensitive),
        mildlySensitive: Boolean(record.scalp_sensitivity_mildly_sensitive),
        moderatelySensitive: Boolean(
          record.scalp_sensitivity_moderately_sensitive
        ),
        highlySensitive: Boolean(record.scalp_sensitivity_highly_sensitive),
      },
      scalpCondition: {
        dry: Boolean(record.scalp_condition_dry),
        oily: Boolean(record.scalp_condition_oily),
        flaky: Boolean(record.scalp_condition_flaky),
        irritated: Boolean(record.scalp_condition_irritated),
        normal: Boolean(record.scalp_condition_normal),
      },
      hairDensity: {
        thick: Boolean(record.hair_density_thick),
        medium: Boolean(record.hair_density_medium),
        thin: Boolean(record.hair_density_thin),
      },
      hairElasticity: {
        elastic: Boolean(record.hair_elasticity_elastic),
        brittle: Boolean(record.hair_elasticity_brittle),
        proneToBreakage: Boolean(record.hair_elasticity_prone_to_breakage),
      },
      hairPorosity: {
        lowPorosity: Boolean(record.hair_porosity_low),
        normalPorosity: Boolean(record.hair_porosity_normal),
        highPorosity: Boolean(record.hair_porosity_high),
      },
      dandruff: {
        yes: Boolean(record.dandruff_present),
        no: !Boolean(record.dandruff_present),
        amount: record.dandruff_amount || "",
      },
      scalpConditions: {
        psoriasis: Boolean(record.scalp_condition_psoriasis),
        seborrheicDermatitis: Boolean(
          record.scalp_condition_seborrheic_dermatitis
        ),
        scalpAcne: Boolean(record.scalp_condition_acne),
        folliculitis: Boolean(record.scalp_condition_folliculitis),
        na: Boolean(record.scalp_condition_na),
      },
      hairLoss: {
        present: Boolean(record.hair_loss_present),
        pattern: record.hair_loss_pattern || "",
        amount: record.hair_loss_amount || "",
        duration: record.hair_loss_duration || "",
      },
      hairBreakage: {
        present: Boolean(record.hair_breakage_present),
        length: record.hair_breakage_length || "",
        frequency: record.hair_breakage_frequency || "",
        possibleCauses: record.hair_breakage_possible_causes || "",
      },
      splitEnds: {
        present: Boolean(record.split_ends_present),
        severity: {
          mild: Boolean(record.split_ends_severity_mild),
          moderate: Boolean(record.split_ends_severity_moderate),
          severe: Boolean(record.split_ends_severity_severe),
        },
        distribution: {
          localized: Boolean(record.split_ends_distribution_localized),
          widespread: Boolean(record.split_ends_distribution_widespread),
        },
      },
      hairCareRoutine: {
        shampoo: record.hair_care_routine_shampoo || "",
        conditioner: record.hair_care_routine_conditioner || "",
        stylingProducts: record.hair_care_routine_styling_products || "",
        heatStyling: record.hair_care_routine_heat_styling || "",
      },
      hairGrowth: {
        symmetricallyDirection: Boolean(record.hair_growth_symmetrical),
        asymmetricallyDistributed: Boolean(record.hair_growth_asymmetrical),
        normalAmount: Boolean(record.hair_growth_normal_amount),
        excessiveAmount: Boolean(record.hair_growth_excessive_amount),
      },
      bodyHair: {
        symmetricallyDirection: Boolean(record.body_hair_symmetrical),
        asymmetricallyDistributed: Boolean(record.body_hair_asymmetrical),
        normalAmount: Boolean(record.body_hair_normal_amount),
        excessiveAmount: Boolean(record.body_hair_excessive_amount),
      },
    };
    setFormData(formDataFromRecord);
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      const { error } = await supabase
        .from("hair_assessment_records")
        .delete()
        .eq("id", recordId);

      if (error) throw error;

      await fetchHistoryRecords();
      alert("Record deleted successfully");
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Failed to delete record");
    }
  };

  const handleNewRecord = () => {
    setSelectedRecord(null);
    setFormData({
      hairType: {
        straight: false,
        wavy: false,
        curly: false,
        oily: false,
      },
      hairTexture: {
        fine: false,
        medium: false,
        coarse: false,
      },
      hairColor: {
        natural: false,
        dyed: false,
        highlightsLowlights: false,
      },
      hairLength: {
        short: false,
        medium: false,
        long: false,
      },
      scalpSensitivity: {
        nonSensitive: false,
        mildlySensitive: false,
        moderatelySensitive: false,
        highlySensitive: false,
      },
      scalpCondition: {
        dry: false,
        oily: false,
        flaky: false,
        irritated: false,
        normal: false,
      },
      hairDensity: {
        thick: false,
        medium: false,
        thin: false,
      },
      hairElasticity: {
        elastic: false,
        brittle: false,
        proneToBreakage: false,
      },
      hairPorosity: {
        lowPorosity: false,
        normalPorosity: false,
        highPorosity: false,
      },
      dandruff: {
        yes: false,
        no: false,
        amount: "",
      },
      scalpConditions: {
        psoriasis: false,
        seborrheicDermatitis: false,
        scalpAcne: false,
        folliculitis: false,
        na: false,
      },
      hairLoss: {
        present: false,
        pattern: "",
        amount: "",
        duration: "",
      },
      hairBreakage: {
        present: false,
        length: "",
        frequency: "",
        possibleCauses: "",
      },
      splitEnds: {
        present: false,
        severity: {
          mild: false,
          moderate: false,
          severe: false,
        },
        distribution: {
          localized: false,
          widespread: false,
        },
      },
      hairCareRoutine: {
        shampoo: "",
        conditioner: "",
        stylingProducts: "",
        heatStyling: "",
      },
      hairGrowth: {
        symmetricallyDirection: false,
        asymmetricallyDistributed: false,
        normalAmount: false,
        excessiveAmount: false,
      },
      bodyHair: {
        symmetricallyDirection: false,
        asymmetricallyDistributed: false,
        normalAmount: false,
        excessiveAmount: false,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
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
        full_name: decodeURIComponent(selectedPatient),
        physician_id: selectedNurse.id,
        date_of_service: new Date().toISOString().split("T")[0],
        // Hair Type
        hair_type_straight: formData.hairType.straight,
        hair_type_wavy: formData.hairType.wavy,
        hair_type_curly: formData.hairType.curly,
        hair_type_oily: formData.hairType.oily,
        // Hair Texture
        hair_texture_fine: formData.hairTexture.fine,
        hair_texture_medium: formData.hairTexture.medium,
        hair_texture_coarse: formData.hairTexture.coarse,
        // Hair Color
        hair_color_natural: formData.hairColor.natural,
        hair_color_dyed: formData.hairColor.dyed,
        hair_color_highlights_lowlights: formData.hairColor.highlightsLowlights,
        // Hair Length
        hair_length_short: formData.hairLength.short,
        hair_length_medium: formData.hairLength.medium,
        hair_length_long: formData.hairLength.long,
        // Scalp Sensitivity
        scalp_sensitivity_non_sensitive: formData.scalpSensitivity.nonSensitive,
        scalp_sensitivity_mildly_sensitive:
          formData.scalpSensitivity.mildlySensitive,
        scalp_sensitivity_moderately_sensitive:
          formData.scalpSensitivity.moderatelySensitive,
        scalp_sensitivity_highly_sensitive:
          formData.scalpSensitivity.highlySensitive,
        // Scalp Condition
        scalp_condition_dry: formData.scalpCondition.dry,
        scalp_condition_oily: formData.scalpCondition.oily,
        scalp_condition_flaky: formData.scalpCondition.flaky,
        scalp_condition_irritated: formData.scalpCondition.irritated,
        scalp_condition_normal: formData.scalpCondition.normal,
        // Hair Density
        hair_density_thick: formData.hairDensity.thick,
        hair_density_medium: formData.hairDensity.medium,
        hair_density_thin: formData.hairDensity.thin,
        // Hair Elasticity
        hair_elasticity_elastic: formData.hairElasticity.elastic,
        hair_elasticity_brittle: formData.hairElasticity.brittle,
        hair_elasticity_prone_to_breakage:
          formData.hairElasticity.proneToBreakage,
        // Hair Porosity
        hair_porosity_low: formData.hairPorosity.lowPorosity,
        hair_porosity_normal: formData.hairPorosity.normalPorosity,
        hair_porosity_high: formData.hairPorosity.highPorosity,
        // Dandruff
        dandruff_present: formData.dandruff.yes,
        dandruff_amount: formData.dandruff.amount,
        // Scalp Conditions
        scalp_condition_psoriasis: formData.scalpConditions.psoriasis,
        scalp_condition_seborrheic_dermatitis:
          formData.scalpConditions.seborrheicDermatitis,
        scalp_condition_acne: formData.scalpConditions.scalpAcne,
        scalp_condition_folliculitis: formData.scalpConditions.folliculitis,
        scalp_condition_na: formData.scalpConditions.na,
        // Hair Loss
        hair_loss_present: formData.hairLoss.present,
        hair_loss_pattern: formData.hairLoss.pattern,
        hair_loss_amount: formData.hairLoss.amount,
        hair_loss_duration: formData.hairLoss.duration,
        // Hair Breakage
        hair_breakage_present: formData.hairBreakage.present,
        hair_breakage_length: formData.hairBreakage.length,
        hair_breakage_frequency: formData.hairBreakage.frequency,
        hair_breakage_possible_causes: formData.hairBreakage.possibleCauses,
        // Split Ends
        split_ends_present: formData.splitEnds.present,
        split_ends_severity_mild: formData.splitEnds.severity.mild,
        split_ends_severity_moderate: formData.splitEnds.severity.moderate,
        split_ends_severity_severe: formData.splitEnds.severity.severe,
        split_ends_distribution_localized:
          formData.splitEnds.distribution.localized,
        split_ends_distribution_widespread:
          formData.splitEnds.distribution.widespread,
        // Hair Care Routine
        hair_care_routine_shampoo: formData.hairCareRoutine.shampoo,
        hair_care_routine_conditioner: formData.hairCareRoutine.conditioner,
        hair_care_routine_styling_products:
          formData.hairCareRoutine.stylingProducts,
        hair_care_routine_heat_styling: formData.hairCareRoutine.heatStyling,
        // Hair Growth
        hair_growth_symmetrical: formData.hairGrowth.symmetricallyDirection,
        hair_growth_asymmetrical: formData.hairGrowth.asymmetricallyDistributed,
        hair_growth_normal_amount: formData.hairGrowth.normalAmount,
        hair_growth_excessive_amount: formData.hairGrowth.excessiveAmount,
        // Body Hair
        body_hair_symmetrical: formData.bodyHair.symmetricallyDirection,
        body_hair_asymmetrical: formData.bodyHair.asymmetricallyDistributed,
        body_hair_normal_amount: formData.bodyHair.normalAmount,
        body_hair_excessive_amount: formData.bodyHair.excessiveAmount,
      };

      console.log("Submitting data:", submissionData);

      const { error } = await supabase
        .from("hair_assessment_records")
        .upsert(submissionData);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      alert("Hair assessment saved successfully!");
      await fetchHistoryRecords();
      handleNewRecord();
    } catch (error) {
      console.error("Error saving assessment:", error);
      alert("Error saving assessment. Please try again.");
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
            <p className="mt-1 text-lg text-indigo-200">Hair Assessment</p>
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
              Hair Assessment Form
            </h2>
          </div>

          <div className="p-8 space-y-10">
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

            <form onSubmit={handleSubmit}>
              {/* Patient Selection */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Patient
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/patient-information?returnTo=/hair-assessment`
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Patient Name
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPatientData?.full_name || "Not selected"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Date of Service
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nurse</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {attending || "Not available"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPatientData?.age || "Not available"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPatientData?.gender || "Not available"}
                  </p>
                </div>
              </div>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">
                  Hair Characteristics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-4">
                      Hair Type
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(formData.hairType).map(([key, value]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            name={`hairType.${key}`}
                            checked={value}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-4">
                      Hair Texture
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(formData.hairTexture).map(
                        ([key, value]) => (
                          <label key={key} className="flex items-center">
                            <input
                              type="checkbox"
                              name={`hairTexture.${key}`}
                              checked={value}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-4">
                      Hair Color
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(formData.hairColor).map(
                        ([key, value]) => (
                          <label key={key} className="flex items-center">
                            <input
                              type="checkbox"
                              name={`hairColor.${key}`}
                              checked={value}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {key === "natural"
                                ? "Natural"
                                : key === "dyed"
                                ? "Dyed"
                                : key === "highlightsLowlights"
                                ? "Highlights/Lowlights"
                                : key.charAt(0).toUpperCase() + key.slice(1)}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-4">
                      Hair Length
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(formData.hairLength).map(
                        ([key, value]) => (
                          <label key={key} className="flex items-center">
                            <input
                              type="checkbox"
                              name={`hairLength.${key}`}
                              checked={value}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {key.charAt(0).toUpperCase() + key.slice(1)}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">
                  Scalp Assessment
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-4">
                      Scalp Sensitivity
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(formData.scalpSensitivity).map(
                        ([key, value]) => (
                          <label key={key} className="flex items-center">
                            <input
                              type="checkbox"
                              name={`scalpSensitivity.${key}`}
                              checked={value}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {key === "nonSensitive"
                                ? "Non Sensitive"
                                : key === "mildlySensitive"
                                ? "Mildly Sensitive"
                                : key === "moderatelySensitive"
                                ? "Moderately Sensitive"
                                : key === "highlySensitive"
                                ? "Highly Sensitive"
                                : key.charAt(0).toUpperCase() + key.slice(1)}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-4">
                      Scalp Condition
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(formData.scalpCondition).map(
                        ([key, value]) => (
                          <label key={key} className="flex items-center">
                            <input
                              type="checkbox"
                              name={`scalpCondition.${key}`}
                              checked={value}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {key === "dry"
                                ? "Dry"
                                : key === "oily"
                                ? "Oily"
                                : key === "flaky"
                                ? "Flaky"
                                : key === "irritated"
                                ? "Irritated"
                                : key === "normal"
                                ? "Normal"
                                : key.charAt(0).toUpperCase() + key.slice(1)}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-lg font-medium text-gray-700 mb-4">
                    Presence of Dandruff
                  </h4>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="dandruff.yes"
                        checked={formData.dandruff.yes}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="dandruff.no"
                        checked={formData.dandruff.no}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount of Visibility
                    </label>
                    <input
                      type="text"
                      name="dandruff.amount"
                      value={formData.dandruff.amount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-lg font-medium text-gray-700 mb-4">
                    Presence of Scalp Conditions
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(formData.scalpConditions).map(
                      ([key, value]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            name={`scalpConditions.${key}`}
                            checked={value}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {key === "psoriasis"
                              ? "Psoriasis"
                              : key === "seborrheicDermatitis"
                              ? "Seborrheic Dermatitis"
                              : key === "scalpAcne"
                              ? "Scalp Acne"
                              : key === "folliculitis"
                              ? "Folliculitis"
                              : key === "na"
                              ? "N/A"
                              : key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">
                  Hair Health Assessment
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-4">
                      Hair Density
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(formData.hairDensity).map(
                        ([key, value]) => (
                          <label key={key} className="flex items-center">
                            <input
                              type="checkbox"
                              name={`hairDensity.${key}`}
                              checked={value}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {key === "thick"
                                ? "Thick"
                                : key === "medium"
                                ? "Medium"
                                : key === "thin"
                                ? "Thin"
                                : key.charAt(0).toUpperCase() + key.slice(1)}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-4">
                      Hair Elasticity
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(formData.hairElasticity).map(
                        ([key, value]) => (
                          <label key={key} className="flex items-center">
                            <input
                              type="checkbox"
                              name={`hairElasticity.${key}`}
                              checked={value}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {key === "elastic"
                                ? "Elastic"
                                : key === "brittle"
                                ? "Brittle"
                                : key === "proneToBreakage"
                                ? "Prone to Breakage"
                                : key.charAt(0).toUpperCase() + key.slice(1)}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-4">
                      Hair Porosity
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(formData.hairPorosity).map(
                        ([key, value]) => (
                          <label key={key} className="flex items-center">
                            <input
                              type="checkbox"
                              name={`hairPorosity.${key}`}
                              checked={value}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {key === "lowPorosity"
                                ? "Low Porosity"
                                : key === "normalPorosity"
                                ? "Normal Porosity"
                                : key === "highPorosity"
                                ? "High Porosity"
                                : key.charAt(0).toUpperCase() + key.slice(1)}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-4">
                      Hair Loss or Thinning
                    </h4>
                    <div className="flex space-x-4 mb-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="hairLoss.present"
                          checked={!formData.hairLoss.present}
                          onChange={() =>
                            setFormData((prev) => ({
                              ...prev,
                              hairLoss: { ...prev.hairLoss, present: false },
                            }))
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          NOT PRESENT
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="hairLoss.present"
                          checked={formData.hairLoss.present}
                          onChange={() =>
                            setFormData((prev) => ({
                              ...prev,
                              hairLoss: { ...prev.hairLoss, present: true },
                            }))
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          PRESENT
                        </span>
                      </label>
                    </div>

                    {formData.hairLoss.present && (
                      <div className="space-y-4 pl-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pattern
                          </label>
                          <input
                            type="text"
                            name="hairLoss.pattern"
                            value={formData.hairLoss.pattern}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount
                          </label>
                          <input
                            type="text"
                            name="hairLoss.amount"
                            value={formData.hairLoss.amount}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration
                          </label>
                          <input
                            type="text"
                            name="hairLoss.duration"
                            value={formData.hairLoss.duration}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-4">
                      Hair Breakage
                    </h4>
                    <div className="flex space-x-4 mb-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="hairBreakage.present"
                          checked={!formData.hairBreakage.present}
                          onChange={() =>
                            setFormData((prev) => ({
                              ...prev,
                              hairBreakage: {
                                ...prev.hairBreakage,
                                present: false,
                              },
                            }))
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          NOT PRESENT
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="hairBreakage.present"
                          checked={formData.hairBreakage.present}
                          onChange={() =>
                            setFormData((prev) => ({
                              ...prev,
                              hairBreakage: {
                                ...prev.hairBreakage,
                                present: true,
                              },
                            }))
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          PRESENT
                        </span>
                      </label>
                    </div>

                    {formData.hairBreakage.present && (
                      <div className="space-y-4 pl-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Length of hair breakage
                          </label>
                          <input
                            type="text"
                            name="hairBreakage.length"
                            value={formData.hairBreakage.length}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Frequency
                          </label>
                          <input
                            type="text"
                            name="hairBreakage.frequency"
                            value={formData.hairBreakage.frequency}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Possible causes (e.g., heat damage, chemical
                            treatments)
                          </label>
                          <input
                            type="text"
                            name="hairBreakage.possibleCauses"
                            value={formData.hairBreakage.possibleCauses}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-4">
                      Presence of Split Ends
                    </h4>
                    <div className="flex space-x-4 mb-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="splitEnds.present"
                          checked={!formData.splitEnds.present}
                          onChange={() =>
                            setFormData((prev) => ({
                              ...prev,
                              splitEnds: { ...prev.splitEnds, present: false },
                            }))
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          NOT PRESENT
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="splitEnds.present"
                          checked={formData.splitEnds.present}
                          onChange={() =>
                            setFormData((prev) => ({
                              ...prev,
                              splitEnds: { ...prev.splitEnds, present: true },
                            }))
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          PRESENT
                        </span>
                      </label>
                    </div>

                    {formData.splitEnds.present && (
                      <div className="space-y-4 pl-6">
                        <div>
                          <h5 className="text-md font-medium text-gray-700 mb-2">
                            Severity
                          </h5>
                          <div className="space-y-2">
                            {Object.entries(formData.splitEnds.severity).map(
                              ([key, value]) => (
                                <label key={key} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    name={`splitEnds.severity.${key}`}
                                    checked={value}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">
                                    {key === "mild"
                                      ? "Mild"
                                      : key === "moderate"
                                      ? "Moderate"
                                      : key === "severe"
                                      ? "Severe"
                                      : key.charAt(0).toUpperCase() +
                                        key.slice(1)}
                                  </span>
                                </label>
                              )
                            )}
                          </div>
                        </div>

                        <div>
                          <h5 className="text-md font-medium text-gray-700 mb-2">
                            Distribution
                          </h5>
                          <div className="space-y-2">
                            {Object.entries(
                              formData.splitEnds.distribution
                            ).map(([key, value]) => (
                              <label key={key} className="flex items-center">
                                <input
                                  type="checkbox"
                                  name={`splitEnds.distribution.${key}`}
                                  checked={value}
                                  onChange={handleInputChange}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                  {key === "localized"
                                    ? "Localized"
                                    : key === "widespread"
                                    ? "Widespread"
                                    : key.charAt(0).toUpperCase() +
                                      key.slice(1)}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">
                  Hair Care Routine
                </h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hair Care Routine
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Frequency
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Shampoo
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name="hairCareRoutine.shampoo"
                            value={formData.hairCareRoutine.shampoo}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Conditioner
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name="hairCareRoutine.conditioner"
                            value={formData.hairCareRoutine.conditioner}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Styling products
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name="hairCareRoutine.stylingProducts"
                            value={formData.hairCareRoutine.stylingProducts}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Heat styling
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            name="hairCareRoutine.heatStyling"
                            value={formData.hairCareRoutine.heatStyling}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">
                  Hair Growth Assessment
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-4">
                      Amount of Body Hair
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(formData.bodyHair).map(([key, value]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            name={`bodyHair.${key}`}
                            checked={value}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {key === "symmetricallyDirection"
                              ? "Symmetrically Direction"
                              : key === "asymmetricallyDistributed"
                              ? "Asymmetrically Distributed"
                              : key === "normalAmount"
                              ? "Normal Amount"
                              : key === "excessiveAmount"
                              ? "Excessive Amount"
                              : key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-4">
                      Evaluation of Hair Growth Patterns
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(formData.hairGrowth).map(
                        ([key, value]) => (
                          <label key={key} className="flex items-center">
                            <input
                              type="checkbox"
                              name={`hairGrowth.${key}`}
                              checked={value}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {key === "symmetricallyDirection"
                                ? "Symmetrically Direction"
                                : key === "asymmetricallyDistributed"
                                ? "Asymmetrically Distributed"
                                : key === "normalAmount"
                                ? "Normal Amount"
                                : key === "excessiveAmount"
                                ? "Excessive Amount"
                                : key.charAt(0).toUpperCase() + key.slice(1)}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </section>

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

            {/* History Table */}
            {historyRecords.length > 0 && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
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
                            selectedRecord?.id === record.id
                              ? "bg-indigo-50"
                              : ""
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(
                              record.date_of_service
                            ).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(record.created_at).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.physician_info
                              ? `${record.physician_info.full_name}, ${record.physician_info.position}`
                              : "Unknown"}
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
    </div>
  );
};

export default HairAssessmentPage;
