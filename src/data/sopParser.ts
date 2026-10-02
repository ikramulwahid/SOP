/**
 * Universal Laboratory SOP Parser & Multi-Domain Template Engine
 * Supports Analytical Chemistry, Microbiology, Water/Environmental, Fuels, Food, and Pharma Labs.
 */

import { formatFormulaToHtml } from '../components/MathFormulaRenderer';

export interface SopApparatusItem {
  name: string;
  spec: string;
  tolerance?: string;
  calibDue?: string;
}

export interface SopProcedureStep {
  step: number;
  title: string;
  text: string;
}

export interface SopProcedureStage {
  stageName: string;
  steps: SopProcedureStep[];
}

export interface SopFormulaVariable {
  symbol: string;
  description: string;
  unit?: string;
  defaultValue?: number;
}

export interface SopCalculationItem {
  name: string;
  formula: string;
  explanation?: string;
  variables?: SopFormulaVariable[];
  calculatedValue?: number;
}

export interface SopSignatory {
  role: string;
  name: string;
  designation: string;
  date: string;
}

export interface SopRevisionEntry {
  rev: string;
  date: string;
  description: string;
  preparedBy: string;
  approvedBy: string;
}

export interface StructuredSopDocument {
  companyName: string;
  companySubtitle: string;
  companyAddress: string;
  documentTitle: string;
  documentNumber: string;
  revisionNumber: string;
  effectiveDate: string;
  reviewDate: string;
  pageCount: string;
  department: string;
  isoStandard: string;
  purpose: string;
  scope: string;
  definitions: { term: string; definition: string }[];
  safetyPrecautions: { title: string; desc: string; level: 'Mandatory' | 'Critical Caution' | 'Standard' }[];
  apparatus: SopApparatusItem[];
  reagents: string;
  sampleHandling: string;
  procedureStages: SopProcedureStage[];
  calculations: SopCalculationItem[];
  qualityControl?: string;
  references: string[];
  signatories: SopSignatory[];
  revisionHistory: SopRevisionEntry[];
}

/**
 * 1. Coal & Solid Fuel Laboratory Template (User's Initial Input)
 */
export const TEMPLATE_COAL_MOISTURE = `# SMJ Sustainable Fuel Lab Pvt. Ltd.

**Document No.:** SMJ/SOP/LAB/01  
**Revision No.:** 00  
**Effective Date:** 01/07/2024  
**Page:** 1 of 2

# Determination of Moisture in Coal

## Purpose

To describe the methods for the determination of total moisture present in coal samples.

## Scope

This procedure applies to the determination of total moisture in coal samples analyzed at SMJ Lab.

## Definitions and Abbreviations

**Total Moisture:** The coal which has been exposed to contact with water in the seam or in a washery or during transportation may contain free moisture (surface moisture) in addition to inherent bed moisture. Total moisture is the sum of both the free moisture and the inherent moisture present in the coal.

## Safety Precautions

- Use appropriate personal protective equipment (PPE), such as heat-resistant gloves, safety goggles, and particulate dust respirator.
- Ensure proper ventilation when operating the drying oven and muffle furnace; verify the fume exhaust system is functioning.
- Use tongs and heat-resistant pads when handling hot weighing vessels or metal trays from the oven.
- Ensure the desiccator lid is securely greased with vacuum grease and opened by sliding horizontally, not lifting directly.
- Follow all laboratory safety protocols and guidelines, including emergency power shut-off procedures.

## Apparatus

- **Ventilated Air Oven:** Drying oven in which a constant and uniform temperature of 105°C to 110°C can be maintained, with adequate air circulation (3 to 5 air changes per hour).
- **Non-corrodible or S.S. Tray:** Approximately 1000 sq. cm in area with depth of not less than 2.5 cm capable of holding 1 kg coal sample.
- **Weighing Vessel:** Shallow, approximately 40 cm² in area (diameter ~70 mm, depth ~20 mm) of glass or silica with ground-glass lid.
- **Analytical Balance:** Sensitive to 0.1 mg (0.0001 g) for Residual Moisture determinations.
- **Laboratory Heavy Balance:** Sensitive to 0.5 g (capacity 2 to 5 kg) for gross air-drying sample determination.
- **IS Sieves:** 2.90 mm aperture wire-cloth sieve (as per IS 460) with receiver pan and lid.
- **Desiccator:** Desiccator charged with freshly regenerated blue silica gel.

## Reagents

None required for this test method. (Dry inert nitrogen gas if drying is performed under inert atmosphere for coals prone to oxidation).

## Sample Handling and Preparation

Obtain a special moisture sample of 1 kg of coal crushed to pass through 12.5 mm / 2.90 mm sieve as per IS 436 (Part 1): 2024. The sample must be delivered in an airtight, non-permeable moisture-proof container immediately after sampling to prevent any loss of moisture during transit.

## Procedure

Determination of Total Moisture is carried out in two stages:

1. Air Drying
2. Oven Drying

### Air Drying

1. Accurately weigh the sample and the container to the nearest 0.5 g (M₁).
2. Transfer the sample from the container to a pre-weighed metal tray (~1000 cm²) and spread it in a uniform layer.
3. Dry the empty container in air until all adhering coal particles dry.
4. Weigh the dry empty container to the nearest 0.5 g (M₂).
5. Calculate and record the mass of the sample taken for the test (M₁ − M₂).
6. Allow the material on the tray to air-dry at ambient room temperature in an atmosphere free from dust.
7. Periodically weigh the tray and sample at 1-hour intervals.
8. Consider air-drying complete when the change in mass during an hour is less than 0.1% of original sample mass.
9. Record the final mass after air-drying (M₃).

### Oven Drying

1. Heat an empty weighing vessel and its cover in the ventilated oven at 105°C–110°C for 30 minutes.
2. After heating, allow the empty vessel to cool for 20 minutes in a desiccator and weigh to 0.1 mg (W₁).
3. Crush the air-dried coal sample to pass through a 2.90 mm IS sieve.
4. Spread approximately 10 g of the prepared sample evenly across the bottom of the weighing vessel. Replace cover and weigh immediately to 0.1 mg (W₂).
5. Place the uncovered vessel and its lid in the ventilated oven maintained strictly at 105°C to 110°C.
6. Continue heating for 1.5 to 3.0 hours until there is no further loss in mass (constant weight).
7. After drying, replace the cover immediately upon removal.
8. Allow the covered vessel to cool in the desiccator for 20 minutes to room temperature.
9. Weigh the covered vessel containing the dried sample (W₃).

## Calculation

### Air Dry Loss (ADL)

$$
X = \\frac{100(M_1-M_3)}{M_1-M_2}
$$

Where:
- M_1 = Mass of sample + container as received (g) [Default: 1485.0]
- M_2 = Mass of dry empty container (g) [Default: 245.0]
- M_3 = Mass of tray + sample after air-drying (g) [Default: 1392.0]

### Residual Moisture

$$
Y = \\frac{100(W_2-W_3)}{W_2-W_1}
$$

Where:
- W_1 = Mass of empty vessel + cover (g) [Default: 28.4520]
- W_2 = Mass of vessel + cover + test sample before drying (g) [Default: 38.5140]
- W_3 = Mass of vessel + cover + dried sample after oven drying (g) [Default: 37.8920]

### Total Moisture (TM %)

$$
TM\\ (\\%) = X + Y \\times \\left(1 - \\frac{X}{100}\\right)
$$

## References

- Indian Standard IS 436 (Part 1): 2024, Methods for Sampling of Coal and Coke.
- Indian Standard IS 1350 (Part 1): 2025, Methods of Test for Coal and Coke - Proximate Analysis.
- ISO 589:2008, Hard coal — Determination of total moisture.`;

/**
 * 2. Water Quality & Environmental Laboratory Template (BOD Determination)
 */
export const TEMPLATE_WATER_BOD = `# EnviroAnalytics Laboratories Ltd.

**Document No.:** EAL/SOP/ENV/04  
**Revision No.:** 02  
**Effective Date:** 10/08/2024  
**Page:** 1 of 2

# Determination of Biochemical Oxygen Demand (BOD5 at 20°C)

## Purpose

To describe the standardized 5-day incubation method for the quantitative determination of Biochemical Oxygen Demand (BOD₅) in surface water, municipal wastewater, and industrial effluents.

## Scope

This method is applicable to all natural waters, domestic wastewater, and industrial discharges with BOD values between 2 mg/L and 6000 mg/L (with suitable dilution) analyzed at EnviroAnalytics Laboratories.

## Definitions and Abbreviations

**BOD5:** Biochemical Oxygen Demand after 5 days of incubation at 20°C ± 1°C in the dark, representing the dissolved oxygen consumed by aerobic microorganisms during biochemical oxidation of organic carbon.
- **DO:** Dissolved Oxygen (mg/L)
- **APHA:** American Public Health Association Standard Methods

## Safety Precautions

- Wear chemical-resistant nitrile gloves, lab coat, and protective eye goggles when handling raw sewage, microbial seed, and acidic reagents.
- Autoclave or chemically disinfect all contaminated glassware and incubator bottles before washing.
- Handle manganese sulfate and alkali-iodide-azide reagents inside an operational fume hood.

## Apparatus

- **BOD Incubator:** Thermostatically controlled at 20.0°C ± 1.0°C with dark interior chamber and calibrated temperature sensor.
- **BOD Incubation Bottles:** 300 mL capacity with flared neck and ground-glass tapered stoppers.
- **Dissolved Oxygen Meter:** Calibrated luminescent optical / polarographic DO probe sensitive to 0.01 mg/L.
- **Volumetric Glassware:** Class A graduated pipettes (1 mL to 50 mL) and 1000 mL volumetric flasks.
- **Aeration System:** Oil-free diaphragm air pump with glass diffuser for preparing oxygen-saturated dilution water.

## Reagents

1. Phosphate buffer solution (pH 7.2)
2. Magnesium sulfate solution (22.5 g/L MgSO₄·7H₂O)
3. Calcium chloride solution (27.5 g/L anhydrous CaCl₂)
4. Ferric chloride solution (0.25 g/L FeCl₃·6H₂O)
5. Synthetic Glucose-Glutamic Acid (GGA) check standard (198 mg/L ± 30 mg/L)

## Sample Handling and Preparation

Collect samples in non-toxic borosilicate glass or high-density polyethylene bottles without air headspace. Transport on ice at 2°C to 4°C and commence analysis within 24 hours of collection. Dechlorinate if residual chlorine is detected.

## Procedure

### Stage 1: Preparation of Dilution Water
1. Aerate high-purity deionized water with clean filtered air for 2 hours to achieve oxygen saturation at 20°C (approx 9.1 mg/L DO).
2. Add 1.0 mL each of Phosphate buffer, MgSO₄, CaCl₂, and FeCl₃ solutions per 1 liter of aerated water.
3. Bring dilution water temperature to 20°C ± 1°C before use.

### Stage 2: Bottle Inoculation & Incubation
1. Prepare dilution series in 300 mL BOD bottles based on anticipated organic load (e.g. 1%, 5%, 20%).
2. Fill each bottle carefully with dilution water without bubbling or entraining air.
3. Measure the initial Dissolved Oxygen of each test bottle immediately and record as D₁.
4. Measure the initial Dissolved Oxygen of unseeded dilution water blank and record as B₁.
5. Stopper bottles firmly, add water seal in the neck flare, and place in BOD incubator at 20°C ± 1°C for exactly 5 days.
6. After 5 days (120 hours ± 2 hours), measure final Dissolved Oxygen in sample bottles (D₂) and blanks (B₂).

## Calculation

### 5-Day Biochemical Oxygen Demand (BOD₅)

$$
BOD_5\\ (mg/L) = \\frac{(D_1 - D_2) - (B_1 - B_2) \\times f}{P}
$$

Where:
- D_1 = Initial DO of diluted sample immediately after preparation (mg/L) [Default: 8.60]
- D_2 = Final DO of diluted sample after 5 days incubation at 20°C (mg/L) [Default: 3.40]
- B_1 = Initial DO of dilution water blank (mg/L) [Default: 8.90]
- B_2 = Final DO of dilution water blank after 5 days (mg/L) [Default: 8.70]
- f = Seed correction ratio (volume of seed in sample / volume of seed in blank) [Default: 1.0]
- P = Decimal volumetric fraction of sample used (Volume of sample / Total 300 mL) [Default: 0.10]

## References

- IS 3025 (Part 44): 2023, Methods of Sampling and Test for Water and Wastewater — Biochemical Oxygen Demand.
- APHA 5210 B, Standard Methods for the Examination of Water and Wastewater (24th Edition).`;

/**
 * 3. Analytical Chemistry Laboratory Template (Acid-Base Standardization)
 */
export const TEMPLATE_CHEMISTRY_TITRATION = `# Precision Chemical Testing Laboratories

**Document No.:** PCL/SOP/CHEM/07  
**Revision No.:** 01  
**Effective Date:** 01/06/2024  
**Page:** 1 of 2

# Preparation and Standardization of 0.1 N Sodium Hydroxide (NaOH)

## Purpose

To describe the preparation and primary standardization of 0.1 N (Normal) Sodium Hydroxide volumetric solution using Potassium Hydrogen Phthalate (KHP) as primary standard.

## Scope

This SOP applies to all 0.1 N secondary standard NaOH solutions prepared for volumetric titrations in the Analytical Chemistry Division.

## Definitions and Abbreviations

**Primary Standard:** A reagent of known high purity (≥ 99.9%), stable in air, non-hygroscopic, and of high equivalent weight used to accurately standardize secondary titrant solutions.
- **KHP:** Potassium Hydrogen Phthalate ($C_8H_5KO_4$, Equivalent Weight = 204.22 g/eq)
- **N:** Normality (equivalents per liter of solution)

## Safety Precautions

- Sodium hydroxide pellets and concentrated solutions are highly corrosive and cause severe chemical burns. Wear chemical splash goggles, neoprene gloves, and protective apron.
- Adding NaOH to water causes an exothermic reaction (heat evolution); always add NaOH pellets slowly to water in an ice bath, never water to pellets.

## Apparatus

- **Analytical Balance:** Accurate and sensitive to 0.1 mg (0.0001 g) with valid calibration.
- **Burette:** Class A 50 mL burette with PTFE stopcock (subdivided to 0.10 mL).
- **Volumetric Flasks:** Class A 1000 mL borosilicate flasks.
- **Conical Flasks:** 250 mL wide-mouth Erlenmeyer flasks.
- **Drying Oven:** Maintained at 110°C ± 5°C for drying primary standard KHP.

## Reagents

1. Sodium Hydroxide pellets (AR grade, purity ≥ 98.0%).
2. Potassium Hydrogen Phthalate (KHP, Primary Standard Grade, dried at 110°C for 2 hours).
3. Phenolphthalein indicator solution (0.5% in 50% ethanol).
4. Freshly boiled and cooled carbon dioxide-free distilled water.

## Procedure

### Stage 1: Preparation of ~0.1 N NaOH Solution
1. Dissolve 4.2 g of AR grade NaOH pellets in 100 mL of CO₂-free distilled water in a beaker.
2. Cool to room temperature and transfer quantitatively to a 1000 mL volumetric flask.
3. Dilute to volume with CO₂-free distilled water and mix thoroughly.

### Stage 2: Standardization against KHP
1. Weigh accurately approximately 0.4000 g to 0.5000 g of dried KHP into a 250 mL conical flask and record mass as W.
2. Dissolve in 50 mL of CO₂-free distilled water.
3. Add 2 to 3 drops of 0.5% Phenolphthalein indicator solution.
4. Fill the 50 mL Class A burette with prepared NaOH solution, record initial reading (V₁).
5. Titrate with NaOH solution with continuous swirling until a faint, persistent pink color forms for 30 seconds.
6. Record final burette reading (V₂) and calculate net volume consumed: V = V₂ − V₁.
7. Perform titration in triplicate (Runs A, B, and C). The results must agree within ± 0.0005 N.

## Calculation

### Normality of Sodium Hydroxide (N)

$$
Normality\\ (N) = \\frac{W \\times 1000}{V \\times 204.22}
$$

Where:
- W = Weight of primary standard KHP taken (g) [Default: 0.4502]
- V = Net volume of NaOH solution consumed in titration (mL) [Default: 22.05]
- 204.22 = Equivalent weight of Potassium Hydrogen Phthalate (g/eq)

## References

- Indian Standard IS 2316: 2020, Methods of Preparation of Standard Solutions for Chemical Analysis.
- United States Pharmacopeia (USP-NF), General Chapter <541> Titrimetry.`;

/**
 * 4. Pharmaceutical Quality Control Laboratory Template (Spectrophotometric Assay)
 */
export const TEMPLATE_PHARMA_ASSAY = `# Apex BioPharm Quality Control Laboratories

**Document No.:** ABPL/SOP/QC/18  
**Revision No.:** 03  
**Effective Date:** 20/09/2024  
**Page:** 1 of 2

# Assay of Paracetamol in Finished Tablets by UV-Vis Spectrophotometry

## Purpose

To describe the validated analytical procedure for the assay of Paracetamol (Acetaminophen) in finished commercial tablet dosage forms using UV-Visible spectrophotometry.

## Scope

Applies to quality release testing of Paracetamol 500 mg and 650 mg tablets at Apex BioPharm QC laboratory in compliance with Indian Pharmacopoeia (IP) and USP specifications.

## Definitions and Abbreviations

**Assay (% Label Claim):** The percentage of active pharmaceutical ingredient (API) present in the dosage unit relative to the stated label amount (Acceptance limit: 95.0% to 105.0% of label claim).
- **A(1%, 1 cm):** Specific absorbance of Paracetamol in 0.1 M NaOH at 257 nm = 715.

## Safety Precautions

- Wear safety glasses, nitrile gloves, and cleanroom lab coat.
- Prepare and dispense 0.1 M Sodium Hydroxide in an eye-wash equipped wet testing station.

## Apparatus

- **UV-Visible Double Beam Spectrophotometer:** 1.0 cm matched quartz cuvettes, wavelength accuracy ±0.3 nm, calibrated with holmium oxide glass.
- **Micro-Analytical Balance:** Sensitive to 0.01 mg (0.00001 g) with valid daily calibration check.
- **Ultrasonic Bath:** 40 kHz frequency for complete drug extraction.
- **Membrane Filter:** 0.45 μm PTFE syringe filters.

## Reagents

1. Paracetamol Working Standard (Purity 99.8% on as-is basis).
2. Sodium Hydroxide (0.1 M NaOH solution).
3. Millipore Purified Water (Resistivity ≥ 18.2 MΩ·cm).

## Procedure

1. Weigh accurately 20 intact tablets and calculate the Average Tablet Weight (W_avg).
2. Crush and pulverize tablets into fine uniform powder using clean agate mortar and pestle.
3. Accurately weigh powder equivalent to 100 mg of Paracetamol (W_sample) into 100 mL volumetric flask.
4. Add 50 mL of 0.1 M NaOH, sonicate for 15 minutes, cool, and dilute to volume with 0.1 M NaOH (Stock Solution, 1000 μg/mL).
5. Filter through 0.45 μm PTFE filter; discard initial 5 mL filtrate.
6. Dilute 1.0 mL of filtrate to 100 mL with 0.1 M NaOH (Test Solution, approx 10 μg/mL).
7. Prepare Paracetamol Reference Standard solution of 10.0 μg/mL in 0.1 M NaOH concurrently.
8. Measure absorbance of Test Solution (A_sample) and Standard Solution (A_std) at 257 nm against 0.1 M NaOH blank.

## Calculation

### Percentage of Label Claim (% Assay)

$$
Assay\\ (\\%) = \\frac{A_{sample}}{A_{std}} \\times \\frac{W_{std}}{D_{std}} \\times \\frac{D_{sample}}{W_{sample}} \\times \\frac{W_{avg}}{Label\\ Claim} \\times P \\times 100
$$

Where:
- A_sample = Absorbance of test sample solution at 257 nm [Default: 0.718]
- A_std = Absorbance of reference standard solution at 257 nm [Default: 0.715]
- W_std = Weight of reference standard taken (mg) [Default: 100.2]
- W_sample = Weight of powdered tablet sample taken (mg) [Default: 125.4]
- W_avg = Average weight of 20 intact tablets (mg) [Default: 627.0]
- Label_Claim = Stated API content per tablet (mg) [Default: 500.0]
- P = Potency / Purity fraction of reference standard [Default: 0.998]

## References

- Indian Pharmacopoeia (IP 2022), Monograph on Paracetamol Tablets.
- United States Pharmacopeia (USP 43-NF 38), Acetaminophen Tablets.`;

/**
 * 5. Food & Dairy Quality Laboratory Template (Gerber Fat Determination)
 */
export const TEMPLATE_FOOD_FAT = `# National Food & Dairy Testing Institute

**Document No.:** NFDI/SOP/DAIRY/12  
**Revision No.:** 01  
**Effective Date:** 05/05/2024  
**Page:** 1 of 2

# Determination of Fat Content in Milk by Gerber Method

## Purpose

To describe the rapid acid-butyrometric method for the accurate determination of milk fat percentage in raw, pasteurized, and standardized bovine milk.

## Scope

This standard operating procedure applies to all liquid whole, skimmed, and standardized milk samples analyzed at the Dairy Analysis Department.

## Definitions and Abbreviations

**Milk Fat Content:** The mass fraction of triglycerides, fatty acids, and associated lipids separated in the calibrated neck of a Gerber butyrometer, expressed as percentage by mass/volume (% w/v or g/100 mL).

## Safety Precautions

- **EXTREME CORROSIVE HAZARD:** Gerber sulfuric acid ($d_{20} = 1.820 - 1.825\text{ g/mL}$) causes immediate severe chemical burns and tissue destruction.
- Always wear full face shield, heavy-duty acid-resistant butyl rubber gloves, and rubber apron.
- Always add sulfuric acid FIRST to the butyrometer, followed by milk, then amyl alcohol. NEVER reverse the addition sequence.
- During centrifugation, lock centrifuge lid securely before starting; do not attempt to stop rotor by hand.

## Apparatus

- **Gerber Butyrometer:** 0% to 10% graduated scale, readable to 0.05% fat (IS 1223 certified).
- **Gerber Milk Pipette:** Calibrated to deliver 10.75 mL of milk at 20°C.
- **Automatic Acid Tilting Measure:** 10.0 mL capacity for dispensing sulfuric acid.
- **Automatic Alcohol Dispenser:** 1.0 mL capacity for iso-amyl alcohol.
- **Gerber Heated Centrifuge:** Capable of maintaining 1100 ± 50 rpm and 65°C ± 5°C.
- **Gerber Water Bath:** Controlled at 65°C ± 2°C with butyrometer rack.

## Reagents

1. Gerber Sulfuric Acid (Density $1.820\text{ to }1.825\text{ g/mL}$ at 20°C, clear and colorless).
2. Iso-Amyl Alcohol for Gerber test (Density $0.811\text{ to }0.813\text{ g/mL}$, boiling range 128°C–132°C).

## Procedure

1. Dispense 10.0 mL of Gerber sulfuric acid into clean, dry butyrometer using automatic measure.
2. Invert milk sample gently 10 times to mix cream uniformly (temperature 20°C ± 2°C).
3. Using Gerber 10.75 mL pipette, deliver milk down the side of the butyrometer neck without mixing with acid layer.
4. Add 1.0 mL of iso-amyl alcohol onto the milk layer.
5. Insert lock stopper securely. Wrap butyrometer in a protective cloth and shake vigorously until curd dissolves completely.
6. Invert the butyrometer 3 times to mix acid completely with contents.
7. Place butyrometers symmetrically in Gerber centrifuge (balanced pairs).
8. Centrifuge at 1100 rpm for 4 minutes at 65°C.
9. Transfer butyrometer to water bath at 65°C ± 2°C for 3 minutes.
10. Adjust stopper to bring lower meniscus of fat column to a whole scale mark (R₁) and read upper meniscus (R₂).

## Calculation

### Milk Fat Content (%)

$$
Fat\\ (\\%) = R_2 - R_1
$$

Where:
- R_2 = Upper reading on butyrometer neck scale [Default: 4.85]
- R_1 = Lower reading on butyrometer neck scale [Default: 0.50]

## References

- IS 1224 (Part 1): 2021, Determination of Fat in Whole Milk by the Gerber Method.
- ISO 2446:2008, Milk — Determination of fat content (Gerber method).`;

/**
 * 6. Coal & Coke Volatile Matter Laboratory Template (IS 1350 Part 1)
 */
export const TEMPLATE_COAL_VOLATILE = `# SMJ Sustainable Fuel Lab Pvt. Ltd.

**Document No.:** SMJ/SOP/LAB/03  
**Revision No.:** 00  
**Effective Date:** 01/08/2024  
**Page:** 1 of 2

# Determination of Volatile Matter in Coal & Coke

## Purpose

To describe the standardized test method for the determination of volatile matter in coal and coke by heating out of contact with air at 900°C ± 10°C in a specialized volatile furnace.

## Scope

This procedure applies to all coal and coke analysis samples prepared to pass through a 212-micron standard sieve analyzed at SMJ Sustainable Fuel Lab.

## Definitions and Abbreviations

**Volatile Matter:** The loss in mass, corrected for that due to moisture, when coal or coke is heated out of contact with air under standardized conditions of temperature (900°C) and duration (7 minutes).
- **VM:** Volatile Matter (%)
- **IS:** Indian Standard

## Safety Precautions

- Wear heavy-duty aluminized heat-resistant gloves (rated for 1000°C) and full-face shield when inserting or removing the crucible rack from the 900°C furnace.
- Ensure efficient local exhaust ventilation to extract toxic and combustible pyrolysis gases (CO, CH₄, H₂S).
- Place hot silica crucibles on a refractory firebrick tile to cool before transferring to a desiccator.

## Apparatus

- **Volatile Matter Furnace:** Electrically heated tubular or muffle furnace capable of maintaining a constant temperature zone of 900°C ± 10°C, with rapid temperature recovery (within 3 minutes).
- **Silica Crucible with Well-Fitting Lid:** Cylindrical fused silica crucible (height ~38 mm, external diameter ~25 mm) with ground contact lid preventing air ingress.
- **Analytical Balance:** Sensitive to 0.1 mg (0.0001 g).
- **Crucible Stand / Rack:** Lightweight nickel-chromium alloy rack to hold crucibles in the uniform heating zone.
- **Desiccator:** Dry desiccator without vacuum charged with self-indicating silica gel.

## Reagents

None required for this thermal decomposition method.

## Sample Handling and Preparation

The sample shall be the air-dried laboratory analysis coal sample crushed to pass through a 212-micron IS sieve. Mix thoroughly for at least 1 minute before weighing.

## Procedure

1. Heat a clean empty silica crucible and its lid in the volatile matter furnace at 900°C ± 10°C for 7 minutes.
2. Cool on a refractory tile for 5 minutes, then in a desiccator for 20 minutes, and weigh to 0.1 mg (W₁).
3. Weigh accurately 1.0000 g (± 0.05 g) of 212-micron coal sample into the crucible, replace lid, and weigh immediately to 0.1 mg (W₂).
4. Tap the crucible gently on a clean bench surface to form an even layer of coal across the bottom.
5. Place the covered crucible on the nickel-chromium rack.
6. Insert the rack into the 900°C uniform heating zone of the furnace and maintain heating for exactly 7.0 minutes (420 seconds).
7. Remove the rack promptly after 7 minutes. Allow the crucible to cool on a heat-resistant tile for 5 minutes.
8. Transfer the covered crucible into a desiccator, cool for 20 minutes, and weigh to the nearest 0.1 mg (W₃).

## Calculation

### Volatile Matter (Air-Dried Basis)

$$
\\text{Volatile Matter (\\%)} = \\frac{100 \\times (W_2 - W_3)}{W_2 - W_1} - M
$$

Where:
- W_1 = Mass of empty silica crucible with lid (g) [Default: 25.4120]
- W_2 = Mass of crucible with lid + test sample before heating (g) [Default: 26.4120]
- W_3 = Mass of crucible with lid + residue after heating at 900°C (g) [Default: 26.1120]
- M = Percentage moisture in the analysis sample (%) [Default: 2.50]

## References

- Indian Standard IS 1350 (Part 1): 2025, Methods of Test for Coal and Coke - Proximate Analysis.
- ISO 562:2010, Hard coal and coke — Determination of volatile matter.
- ASTM D3175, Standard Test Method for Volatile Matter in the Analysis Sample of Coal and Coke.`;

/**
 * All Available Templates Catalog
 */
export const LAB_TEMPLATES_CATALOG = [
  {
    id: 'coal_moisture',
    domain: 'Fuels & Energy Lab',
    title: 'Determination of Total Moisture in Coal',
    docNo: 'SMJ/SOP/LAB/01',
    standard: 'IS 436:2024 & IS 1350:2025',
    text: TEMPLATE_COAL_MOISTURE
  },
  {
    id: 'coal_volatile',
    domain: 'Fuels & Energy Lab',
    title: 'Determination of Volatile Matter in Coal',
    docNo: 'SMJ/SOP/LAB/03',
    standard: 'IS 1350 (Part 1) & ISO 562',
    text: TEMPLATE_COAL_VOLATILE
  },
  {
    id: 'water_bod',
    domain: 'Water & Environmental Lab',
    title: 'Biochemical Oxygen Demand (BOD5 at 20°C)',
    docNo: 'EAL/SOP/ENV/04',
    standard: 'IS 3025 (Part 44) & APHA 5210 B',
    text: TEMPLATE_WATER_BOD
  },
  {
    id: 'chemistry_titration',
    domain: 'Analytical Chemistry Lab',
    title: 'Preparation & Standardization of 0.1 N NaOH',
    docNo: 'PCL/SOP/CHEM/07',
    standard: 'IS 2316:2020 & USP <541>',
    text: TEMPLATE_CHEMISTRY_TITRATION
  },
  {
    id: 'pharma_assay',
    domain: 'Pharmaceutical & QC Lab',
    title: 'Assay of Paracetamol Tablets by UV-Vis',
    docNo: 'ABPL/SOP/QC/18',
    standard: 'Indian Pharmacopoeia & USP',
    text: TEMPLATE_PHARMA_ASSAY
  },
  {
    id: 'dairy_fat',
    domain: 'Food & Dairy Lab',
    title: 'Determination of Fat in Milk by Gerber Method',
    docNo: 'NFDI/SOP/DAIRY/12',
    standard: 'IS 1224:2021 & ISO 2446',
    text: TEMPLATE_FOOD_FAT
  }
];

export const INITIAL_USER_RAW_TEXT = TEMPLATE_COAL_MOISTURE;
export const ASH_SAMPLE_RAW_TEXT = TEMPLATE_WATER_BOD;

/**
 * Universal Deterministic Parser
 * Extracts any laboratory SOP text into StructuredSopDocument.
 */
export function parseRawSopText(rawText: string): StructuredSopDocument {
  const lines = rawText.split('\n');

  let companyName = 'Universal Laboratory Testing Services Ltd.';
  let documentTitle = 'Standard Laboratory Operating Procedure';
  let documentNumber = 'LAB/SOP/GEN/01';
  let revisionNumber = '00';
  let effectiveDate = '01/01/2025';
  let reviewDate = '31/12/2026';
  let pageCount = '1 of 2';
  let department = 'Analytical Testing & Quality Assurance Division';
  let isoStandard = 'ISO/IEC 17025:2017 & Standard Methods';

  let purpose = '';
  let scope = '';
  const definitions: { term: string; definition: string }[] = [];
  const safetyPrecautions: { title: string; desc: string; level: 'Mandatory' | 'Critical Caution' | 'Standard' }[] = [];
  const apparatus: SopApparatusItem[] = [];
  let reagents = 'Analytical grade reagents and purified water conforming to standard specifications.';
  let sampleHandling = '';
  const procedureStages: SopProcedureStage[] = [];
  const calculations: SopCalculationItem[] = [];
  const references: string[] = [];

  let currentSection = '';
  let currentStageName = '';
  let currentStepList: SopProcedureStep[] = [];
  let currentCalcName = '';
  let currentFormula = '';
  let currentCalcVariables: SopFormulaVariable[] = [];

  let h1Count = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check for H1 (# Company Name or # Document Title)
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      const heading = line.replace(/^#\s+/, '').trim();
      if (h1Count === 0) {
        if (heading.toLowerCase().includes('ltd') || heading.toLowerCase().includes('lab') || heading.toLowerCase().includes('corp') || heading.toLowerCase().includes('institute') || heading.toLowerCase().includes('inc') || heading.toLowerCase().includes('services')) {
          companyName = heading;
        } else {
          documentTitle = heading;
        }
        h1Count++;
      } else {
        documentTitle = heading;
      }
      continue;
    }

    // Document No.
    const docNoMatch = line.match(/(?:document\s*no\.?|doc\s*no\.?)\s*[:：]\s*\*{0,2}([^\*\n]+)/i);
    if (docNoMatch) {
      documentNumber = docNoMatch[1].trim().replace(/\*+/g, '');
    }

    // Revision No.
    const revMatch = line.match(/(?:revision\s*no\.?|rev\s*no\.?)\s*[:：]\s*\*{0,2}([^\*\n]+)/i);
    if (revMatch) {
      revisionNumber = revMatch[1].trim().replace(/\*+/g, '');
    }

    // Effective Date
    const effMatch = line.match(/(?:effective\s*date)\s*[:：]\s*\*{0,2}([^\*\n]+)/i);
    if (effMatch) {
      effectiveDate = effMatch[1].trim().replace(/\*+/g, '');
    }

    // Page
    const pageMatch = line.match(/(?:page)\s*[:：]\s*\*{0,2}([^\*\n]+)/i);
    if (pageMatch) {
      pageCount = pageMatch[1].trim().replace(/\*+/g, '');
    }

    // Section H2 detection
    if (line.startsWith('## ')) {
      const secTitle = line.replace(/^##\s+/, '').trim().toLowerCase();

      // Flush previous procedure stage if any
      if (currentStageName && currentStepList.length > 0) {
        procedureStages.push({
          stageName: currentStageName,
          steps: [...currentStepList]
        });
        currentStageName = '';
        currentStepList = [];
      }

      // Flush previous calculation if any
      if (currentCalcName && currentFormula) {
        calculations.push({
          name: currentCalcName,
          formula: currentFormula.replace(/\$\$/g, '').trim(),
          variables: [...currentCalcVariables]
        });
        currentCalcName = '';
        currentFormula = '';
        currentCalcVariables = [];
      }

      if (secTitle.includes('purpose')) currentSection = 'purpose';
      else if (secTitle.includes('scope')) currentSection = 'scope';
      else if (secTitle.includes('definition')) currentSection = 'definitions';
      else if (secTitle.includes('safety')) currentSection = 'safety';
      else if (secTitle.includes('apparatus') || secTitle.includes('equipment')) currentSection = 'apparatus';
      else if (secTitle.includes('reagent')) currentSection = 'reagents';
      else if (secTitle.includes('sample')) currentSection = 'sampleHandling';
      else if (secTitle.includes('procedure')) currentSection = 'procedure';
      else if (secTitle.includes('calculation')) currentSection = 'calculation';
      else if (secTitle.includes('reference')) currentSection = 'references';
      else currentSection = secTitle;
      continue;
    }

    // Section H3 detection
    if (line.startsWith('### ')) {
      const subTitle = line.replace(/^###\s+/, '').trim();
      if (currentSection === 'procedure') {
        if (currentStageName && currentStepList.length > 0) {
          procedureStages.push({
            stageName: currentStageName,
            steps: [...currentStepList]
          });
        }
        currentStepList = [];
        currentStageName = subTitle;
      } else if (currentSection === 'calculation') {
        if (currentCalcName && currentFormula) {
          calculations.push({
            name: currentCalcName,
            formula: currentFormula.replace(/\$\$/g, '').trim(),
            variables: [...currentCalcVariables]
          });
          currentFormula = '';
          currentCalcVariables = [];
        }
        currentCalcName = subTitle;
      }
      continue;
    }

    // Fill content according to currentSection
    if (currentSection === 'purpose') {
      purpose = purpose ? `${purpose} ${line}` : line;
    } else if (currentSection === 'scope') {
      scope = scope ? `${scope} ${line}` : line;
    } else if (currentSection === 'definitions') {
      const defMatch = line.match(/\*\*([^*]+)\*\*\s*[:：]\s*(.*)/);
      if (defMatch) {
        definitions.push({
          term: defMatch[1].trim(),
          definition: defMatch[2].trim()
        });
      } else if (line.includes(':')) {
        const parts = line.split(':');
        definitions.push({
          term: parts[0].replace(/[-*]/g, '').trim(),
          definition: parts.slice(1).join(':').trim()
        });
      }
    } else if (currentSection === 'safety') {
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const bulletText = line.replace(/^[-*]\s+/, '').trim();
        safetyPrecautions.push({
          title: bulletText.split(/[,:.]/)[0].trim(),
          desc: bulletText,
          level: bulletText.toLowerCase().includes('must') || bulletText.toLowerCase().includes('ppe') || bulletText.toLowerCase().includes('hazard') || bulletText.toLowerCase().includes('goggles') ? 'Mandatory' : 'Standard'
        });
      }
    } else if (currentSection === 'apparatus') {
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const bullet = line.replace(/^[-*]\s+/, '').trim();
        const boldMatch = bullet.match(/\*\*([^*]+)\*\*\s*[:：]?\s*(.*)/);
        if (boldMatch) {
          apparatus.push({
            name: boldMatch[1].trim(),
            spec: boldMatch[2].trim(),
            tolerance: boldMatch[1].toLowerCase().includes('balance') 
              ? (boldMatch[1].toLowerCase().includes('micro') ? '±0.01 mg' : '±0.1 mg') 
              : (boldMatch[1].toLowerCase().includes('oven') || boldMatch[1].toLowerCase().includes('bath') ? '±1.0 °C' : 'Standard')
          });
        } else if (bullet.includes(':')) {
          const [n, ...rest] = bullet.split(':');
          apparatus.push({
            name: n.trim(),
            spec: rest.join(':').trim(),
            tolerance: 'Standard'
          });
        }
      }
    } else if (currentSection === 'reagents') {
      reagents = reagents === 'Analytical grade reagents and purified water conforming to standard specifications.' ? line : `${reagents} ${line}`;
    } else if (currentSection === 'sampleHandling') {
      sampleHandling = sampleHandling ? `${sampleHandling} ${line}` : line;
    } else if (currentSection === 'procedure') {
      const stepMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (stepMatch) {
        const stepNum = parseInt(stepMatch[1], 10);
        const fullStepText = stepMatch[2].trim();
        const titleMatch = fullStepText.match(/\(([^)]+)\)/);
        const title = titleMatch ? `${titleMatch[1]} Determination` : fullStepText.slice(0, 32) + '...';
        currentStepList.push({
          step: stepNum,
          title: title,
          text: fullStepText
        });
      }
    } else if (currentSection === 'calculation') {
      if (line.includes('$$') || line.includes('\\frac') || line.includes('=')) {
        currentFormula = currentFormula ? `${currentFormula} ${line}` : line;
        if (!currentCalcName) {
          currentCalcName = 'Analytical Result';
        }
      } else if (line.startsWith('- ') && line.includes('=')) {
        const [sym, desc] = line.replace(/^[-*]\s+/, '').split('=');
        // Extract default value if provided like "[Default: 12.5]"
        const defValMatch = desc ? desc.match(/\[(?:default|val)\s*[:：]?\s*([0-9.]+)\]/i) : null;
        currentCalcVariables.push({
          symbol: sym.trim(),
          description: desc ? desc.replace(/\[[^\]]+\]/g, '').trim() : '',
          defaultValue: defValMatch ? parseFloat(defValMatch[1]) : 1.0
        });
      }
    } else if (currentSection === 'references') {
      if (line.startsWith('- ') || line.startsWith('* ')) {
        references.push(line.replace(/^[-*]\s+/, '').trim());
      }
    }
  }

  // Flush remaining stages
  if (currentStageName && currentStepList.length > 0) {
    procedureStages.push({
      stageName: currentStageName,
      steps: [...currentStepList]
    });
  } else if (currentStepList.length > 0) {
    procedureStages.push({
      stageName: 'Analytical Protocol',
      steps: [...currentStepList]
    });
  }

  // Flush remaining calculation
  if (currentCalcName && currentFormula) {
    calculations.push({
      name: currentCalcName,
      formula: currentFormula.replace(/\$\$/g, '').trim(),
      variables: [...currentCalcVariables]
    });
  }

  // Fallbacks if empty
  if (procedureStages.length === 0) {
    procedureStages.push({
      stageName: 'Operational Procedure',
      steps: [
        { step: 1, title: 'Instrument Calibration', text: 'Calibrate all analytical instruments against certified reference standards prior to test.' },
        { step: 2, title: 'Sample Analysis', text: 'Execute determination in duplicate in accordance with test method specifications.' }
      ]
    });
  }

  if (definitions.length === 0) {
    definitions.push({
      term: 'Analytical Sample',
      definition: 'Representative homogenous portion prepared and analyzed according to accredited laboratory methods.'
    });
  }

  if (references.length === 0) {
    references.push('ISO/IEC 17025:2017, General requirements for the competence of testing and calibration laboratories.');
  }

  return {
    companyName: companyName || 'Universal Laboratory Testing Services Ltd.',
    companySubtitle: 'Analytical Characterization & Quality Assurance Division',
    companyAddress: 'Central Laboratory Complex, Science & Technology Park',
    documentTitle: documentTitle || 'Standard Laboratory Operating Procedure',
    documentNumber: documentNumber || 'LAB/SOP/GEN/01',
    revisionNumber: revisionNumber || '00',
    effectiveDate: effectiveDate || '01/01/2025',
    reviewDate: reviewDate || '31/12/2026',
    pageCount: pageCount || '1 of 2',
    department: department || 'Analytical Testing Department',
    isoStandard: isoStandard,
    purpose: purpose || 'To establish standardized analytical procedure for testing and reporting.',
    scope: scope || 'Applies to all analytical determinations performed in this laboratory.',
    definitions,
    safetyPrecautions: safetyPrecautions.length > 0 ? safetyPrecautions : [
      { title: 'Personal Protective Equipment', desc: 'Wear approved safety goggles, lab coat, and protective gloves.', level: 'Mandatory' },
      { title: 'Ventilation', desc: 'Operate all volatile chemical procedures within a functional fume hood.', level: 'Mandatory' }
    ],
    apparatus: apparatus.length > 0 ? apparatus : [
      { name: 'Analytical Balance', spec: 'Readable to 0.1 mg (0.0001 g)', tolerance: '±0.1 mg' },
      { name: 'Calibrated Glassware', spec: 'Class A volumetric flasks and pipettes', tolerance: 'Class A' }
    ],
    reagents: reagents || 'Analytical reagent grade (AR) chemicals and purified water.',
    sampleHandling: sampleHandling || 'Collect, label, preserve, and transport samples in airtight containers under controlled conditions.',
    procedureStages,
    calculations: calculations.length > 0 ? calculations : [
      {
        name: 'Analyte Content',
        formula: 'Result = (A - B) * Factor / Sample_Weight',
        variables: [
          { symbol: 'A', description: 'Test reading / final value', defaultValue: 10.0 },
          { symbol: 'B', description: 'Blank reading / tare', defaultValue: 1.0 },
          { symbol: 'Sample_Weight', description: 'Weight or volume of test sample', defaultValue: 1.0 }
        ]
      }
    ],
    references,
    signatories: [
      { role: 'Prepared By', name: 'Analytical Chemist', designation: 'Senior Analyst', date: effectiveDate },
      { role: 'Reviewed By', name: 'Quality Manager', designation: 'QA/QC Lead', date: effectiveDate },
      { role: 'Approved By', name: 'Technical Director', designation: 'Head of Laboratory', date: effectiveDate }
    ],
    revisionHistory: [
      { rev: revisionNumber, date: effectiveDate, description: 'Initial standard release aligned with ISO/IEC 17025.', preparedBy: 'Senior Analyst', approvedBy: 'Head of Laboratory' }
    ]
  };
}

/**
 * Generate complete standalone HTML file with embedded CSS for ANY structured laboratory SOP.
 */
export function generateStandaloneHtmlForSop(sop: StructuredSopDocument): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${sop.documentNumber} - ${sop.documentTitle}</title>
  <style>
    :root {
      --primary: #0f172a;
      --secondary: #334155;
      --accent: #b45309;
      --border: #cbd5e1;
      --light-bg: #f8fafc;
      --text: #0f172a;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.55;
      color: var(--text);
      background: #e2e8f0;
      padding: 24px;
    }
    .document-container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid var(--border);
    }
    .page-sheet {
      padding: 40px;
      border-bottom: 2px dashed #94a3b8;
      position: relative;
    }
    .page-sheet:last-child {
      border-bottom: none;
    }
    @page {
      size: A4 portrait;
      margin: 12mm 12mm 15mm 28mm; /* 28mm Left filing margin for 2-hole/4-hole ring binder punch */
    }
    .document-container {
      max-width: 210mm;
      margin: 0 auto;
      background: #ffffff;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid var(--border);
    }
    .page-sheet {
      padding: 35px 35px 35px 85px; /* 85px left padding gives clean space for punch filing */
      border-bottom: 2px dashed #94a3b8;
      position: relative;
      min-height: 297mm;
      box-sizing: border-box;
    }
    /* Physical Punch Hole Target Guides */
    .punch-guide {
      position: absolute;
      left: 22px;
      width: 18px;
      height: 18px;
      border: 1px dashed #94a3b8;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.45;
    }
    .punch-guide::after {
      content: '+';
      font-size: 11px;
      color: #64748b;
      line-height: 1;
    }
    .punch-guide-1 { top: 38%; }
    .punch-guide-2 { top: 62%; }
    @media print {
      body { background: #fff; padding: 0; }
      .document-container { box-shadow: none; border: none; max-width: 100%; width: 210mm; }
      .page-sheet { 
        padding: 12mm 12mm 14mm 28mm !important; 
        page-break-after: always; 
        border-bottom: none; 
        min-height: 297mm; 
      }
      .no-print { display: none !important; }
      .punch-guide { display: block !important; left: 10mm !important; }
    }
    .doc-header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      border: 2px solid var(--primary);
    }
    .doc-header-table td, .doc-header-table th {
      border: 1px solid var(--border);
      padding: 8px 12px;
      font-size: 13px;
      vertical-align: middle;
    }
    .org-title {
      font-size: 17px;
      font-weight: 800;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .org-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .doc-title-cell {
      background: var(--light-bg);
      text-align: center;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: var(--primary);
      padding: 12px !important;
      border-top: 2px solid var(--primary) !important;
      border-bottom: 2px solid var(--primary) !important;
    }
    h2.section-header {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 4px;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    h3.sub-section-header {
      font-size: 12.5px;
      font-weight: 700;
      color: #1e293b;
      margin-top: 14px;
      margin-bottom: 6px;
      background: #f1f5f9;
      padding: 6px 10px;
      border-left: 3px solid #b45309;
    }
    p, li {
      font-size: 12.5px;
      color: #334155;
      text-align: justify;
    }
    ul, ol {
      margin-left: 20px;
      margin-bottom: 12px;
    }
    li {
      margin-bottom: 5px;
    }
    .table-data {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 12px;
    }
    .table-data th, .table-data td {
      border: 1px solid var(--border);
      padding: 6px 10px;
    }
    .table-data th {
      background: #f1f5f9;
      font-weight: 600;
      text-align: left;
    }
    .formula-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 12px 16px;
      margin: 12px 0;
    }
    .formula-expression {
      font-family: "Courier New", Courier, monospace;
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
      text-align: center;
    }
    .signatory-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }
    .signatory-box {
      border: 1px solid var(--border);
      padding: 10px;
      font-size: 11.5px;
      background: var(--light-bg);
      text-align: center;
    }
    .signatory-box .role {
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      font-size: 10.5px;
      margin-bottom: 6px;
    }
    .signatory-box .sig {
      font-family: "Brush Script MT", cursive, sans-serif;
      font-size: 20px;
      color: #1e3a8a;
      min-height: 28px;
    }
    .footer-note {
      font-size: 10.5px;
      color: #64748b;
      margin-top: 20px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
    }
  </style>
</head>
<body>

<div class="document-container">

  <!-- PAGE 1 -->
  <div class="page-sheet">
    <!-- Filing Punch Hole Target Guides (Standard ISO 838 80mm spacing) -->
    <div class="punch-guide punch-guide-1"></div>
    <div class="punch-guide punch-guide-2"></div>

    <table class="doc-header-table">
      <tr>
        <td rowspan="2" style="width: 25%; text-align: center; font-weight: 800; border-right: 2px solid var(--primary);">
          <div style="font-size: 20px; color: #b45309; letter-spacing: 1px;">LAB</div>
          <div style="font-size: 9px; color: #475569; font-weight: 600; text-transform: uppercase;">ISO 17025 ACCREDITED</div>
        </td>
        <td colspan="2">
          <div class="org-title">${sop.companyName}</div>
          <div class="org-sub">${sop.companySubtitle} | ISO/IEC 17025 Accredited Laboratory</div>
        </td>
      </tr>
      <tr>
        <td style="width: 35%;"><strong>Doc No:</strong> ${sop.documentNumber}</td>
        <td style="width: 40%;"><strong>Effective Date:</strong> ${sop.effectiveDate}</td>
      </tr>
      <tr>
        <td colspan="3" class="doc-title-cell">
          STANDARD OPERATING PROCEDURE<br>
          <span style="font-size: 17px; color: #b45309;">${sop.documentTitle.toUpperCase()}</span>
        </td>
      </tr>
      <tr>
        <td><strong>Revision No:</strong> ${sop.revisionNumber}</td>
        <td><strong>Review Frequency:</strong> Biennial (2 Years)</td>
        <td><strong>Page:</strong> 1 of 2</td>
      </tr>
    </table>

    <h2 class="section-header">1. Purpose</h2>
    <p>${sop.purpose}</p>

    <h2 class="section-header">2. Scope</h2>
    <p>${sop.scope}</p>

    <h2 class="section-header">3. Definitions and Abbreviations</h2>
    <ul>
      ${sop.definitions.map(d => `<li><strong>${d.term}:</strong> ${d.definition}</li>`).join('')}
    </ul>

    <h2 class="section-header">4. Safety Precautions</h2>
    <ul>
      ${sop.safetyPrecautions.map(s => `<li><strong>${s.title} (${s.level}):</strong> ${s.desc}</li>`).join('')}
    </ul>

    <h2 class="section-header">5. Apparatus & Equipment</h2>
    <table class="table-data">
      <tr>
        <th>Apparatus Name</th>
        <th>Specification / Requirement</th>
        <th>Tolerance</th>
      </tr>
      ${sop.apparatus.map(a => `<tr>
        <td><strong>${a.name}</strong></td>
        <td>${a.spec}</td>
        <td>${a.tolerance || 'Standard'}</td>
      </tr>`).join('')}
    </table>

    <h2 class="section-header">6. Reagents</h2>
    <p>${sop.reagents}</p>

    <h2 class="section-header">7. Sample Handling and Preparation</h2>
    <p>${sop.sampleHandling}</p>

    <div class="footer-note">
      ${sop.companyName} | Document No: ${sop.documentNumber} | Page 1 of 2
    </div>
  </div>

  <!-- PAGE 2 -->
  <div class="page-sheet">
    <!-- Filing Punch Hole Target Guides (Standard ISO 838 80mm spacing) -->
    <div class="punch-guide punch-guide-1"></div>
    <div class="punch-guide punch-guide-2"></div>

    <table class="doc-header-table">
      <tr>
        <td style="width: 25%; font-weight: 800; color: #b45309;">${sop.companyName.split(' ')[0]} Lab</td>
        <td style="width: 45%;"><strong>Doc No:</strong> ${sop.documentNumber} | Rev: ${sop.revisionNumber}</td>
        <td style="width: 30%;"><strong>Page:</strong> 2 of 2</td>
      </tr>
    </table>

    <h2 class="section-header">8. Procedure</h2>
    ${sop.procedureStages.map((stage, idx) => `
      <h3 class="sub-section-header">8.${idx + 1} ${stage.stageName}</h3>
      <ol>
        ${stage.steps.map(st => `<li><strong>${st.title}:</strong> ${st.text}</li>`).join('')}
      </ol>
    `).join('')}

    <h2 class="section-header">9. Calculations & Mathematical Formulations</h2>
    ${sop.calculations.map(calc => `
      <div class="formula-card">
        <div style="font-weight: 700; color: #b45309; margin-bottom: 4px;">${calc.name}:</div>
        ${formatFormulaToHtml(calc.formula)}
        ${calc.variables && calc.variables.length > 0 ? `
          <ul style="font-size: 11.5px; margin-top: 6px; list-style-type: none; margin-left: 0;">
            ${calc.variables.map(v => `<li><strong>${v.symbol}:</strong> ${v.description}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `).join('')}

    <h2 class="section-header">10. References & Standards</h2>
    <ul>
      ${sop.references.map(ref => `<li>${ref}</li>`).join('')}
    </ul>

    <h2 class="section-header">11. Document Authorization & Signatures</h2>
    <div class="signatory-grid">
      ${sop.signatories.map(sig => `
        <div class="signatory-box">
          <div class="role">${sig.role}</div>
          <div class="sig">${sig.name}</div>
          <div><strong>${sig.name}</strong></div>
          <div style="color: #64748b;">${sig.designation}</div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Date: ${sig.date}</div>
        </div>
      `).join('')}
    </div>

    <div class="footer-note">
      ${sop.companyName} | Document No: ${sop.documentNumber} | Revision: ${sop.revisionNumber} | Page 2 of 2 (End of Procedure)
    </div>
  </div>

</div>

</body>
</html>`;
}
