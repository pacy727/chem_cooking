// lib/data/reactions.ts

export interface ChemicalReaction {
  id: number;
  level: number;
  reactants: { formula: string; coefficient: number }[];
  products: { formula: string; coefficient: number }[];
  equation: string;
}

export const CHEMICAL_REACTIONS: ChemicalReaction[] = [
  // Level 1 - 基本的な反応
  { id: 1, level: 1, reactants: [{ formula: 'H₂', coefficient: 2 }, { formula: 'O₂', coefficient: 1 }], products: [{ formula: 'H₂O', coefficient: 2 }], equation: '2H₂ + O₂ → 2H₂O' },
  { id: 2, level: 1, reactants: [{ formula: 'Mg', coefficient: 2 }, { formula: 'O₂', coefficient: 1 }], products: [{ formula: 'MgO', coefficient: 2 }], equation: '2Mg + O₂ → 2MgO' },
  { id: 3, level: 1, reactants: [{ formula: 'Al', coefficient: 4 }, { formula: 'O₂', coefficient: 3 }], products: [{ formula: 'Al₂O₃', coefficient: 2 }], equation: '4Al + 3O₂ → 2Al₂O₃' },
  { id: 4, level: 1, reactants: [{ formula: 'N₂', coefficient: 1 }, { formula: 'H₂', coefficient: 3 }], products: [{ formula: 'NH₃', coefficient: 2 }], equation: 'N₂ + 3H₂ → 2NH₃' },
  { id: 5, level: 1, reactants: [{ formula: 'Zn', coefficient: 1 }, { formula: 'HCl', coefficient: 2 }], products: [{ formula: 'ZnCl₂', coefficient: 1 }, { formula: 'H₂', coefficient: 1 }], equation: 'Zn + 2HCl → ZnCl₂ + H₂' },
  { id: 6, level: 1, reactants: [{ formula: 'Fe', coefficient: 1 }, { formula: 'HCl', coefficient: 2 }], products: [{ formula: 'FeCl₂', coefficient: 1 }, { formula: 'H₂', coefficient: 1 }], equation: 'Fe + 2HCl → FeCl₂ + H₂' },
  { id: 7, level: 1, reactants: [{ formula: 'Mg', coefficient: 1 }, { formula: 'HCl', coefficient: 2 }], products: [{ formula: 'MgCl₂', coefficient: 1 }, { formula: 'H₂', coefficient: 1 }], equation: 'Mg + 2HCl → MgCl₂ + H₂' },
  { id: 8, level: 1, reactants: [{ formula: 'Al', coefficient: 2 }, { formula: 'HCl', coefficient: 6 }], products: [{ formula: 'AlCl₃', coefficient: 2 }, { formula: 'H₂', coefficient: 3 }], equation: '2Al + 6HCl → 2AlCl₃ + 3H₂' },
  { id: 9, level: 1, reactants: [{ formula: 'Zn', coefficient: 1 }, { formula: 'H₂SO₄', coefficient: 1 }], products: [{ formula: 'ZnSO₄', coefficient: 1 }, { formula: 'H₂', coefficient: 1 }], equation: 'Zn + H₂SO₄ → ZnSO₄ + H₂' },
  { id: 10, level: 1, reactants: [{ formula: 'Fe', coefficient: 1 }, { formula: 'H₂SO₄', coefficient: 1 }], products: [{ formula: 'FeSO₄', coefficient: 1 }, { formula: 'H₂', coefficient: 1 }], equation: 'Fe + H₂SO₄ → FeSO₄ + H₂' },
  { id: 11, level: 1, reactants: [{ formula: 'Mg', coefficient: 1 }, { formula: 'H₂SO₄', coefficient: 1 }], products: [{ formula: 'MgSO₄', coefficient: 1 }, { formula: 'H₂', coefficient: 1 }], equation: 'Mg + H₂SO₄ → MgSO₄ + H₂' },
  { id: 12, level: 1, reactants: [{ formula: 'Al', coefficient: 2 }, { formula: 'H₂SO₄', coefficient: 3 }], products: [{ formula: 'Al₂(SO₄)₃', coefficient: 1 }, { formula: 'H₂', coefficient: 3 }], equation: '2Al + 3H₂SO₄ → Al₂(SO₄)₃ + 3H₂' },
  { id: 13, level: 1, reactants: [{ formula: 'Ca', coefficient: 1 }, { formula: 'HCl', coefficient: 2 }], products: [{ formula: 'CaCl₂', coefficient: 1 }, { formula: 'H₂', coefficient: 1 }], equation: 'Ca + 2HCl → CaCl₂ + H₂' },
  { id: 14, level: 1, reactants: [{ formula: 'Cu', coefficient: 2 }, { formula: 'O₂', coefficient: 1 }], products: [{ formula: 'CuO', coefficient: 2 }], equation: '2Cu + O₂ → 2CuO' },
  { id: 15, level: 1, reactants: [{ formula: 'Fe', coefficient: 4 }, { formula: 'O₂', coefficient: 3 }], products: [{ formula: 'Fe₂O₃', coefficient: 2 }], equation: '4Fe + 3O₂ → 2Fe₂O₃' },
  { id: 16, level: 1, reactants: [{ formula: 'H₂', coefficient: 1 }, { formula: 'Cl₂', coefficient: 1 }], products: [{ formula: 'HCl', coefficient: 2 }], equation: 'H₂ + Cl₂ → 2HCl' },
  { id: 17, level: 1, reactants: [{ formula: 'Na', coefficient: 2 }, { formula: 'Cl₂', coefficient: 1 }], products: [{ formula: 'NaCl', coefficient: 2 }], equation: '2Na + Cl₂ → 2NaCl' },

  // Level 2 - 有機化合物の燃焼
  { id: 18, level: 2, reactants: [{ formula: 'CH₄', coefficient: 1 }, { formula: 'O₂', coefficient: 2 }], products: [{ formula: 'CO₂', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: 'CH₄ + 2O₂ → CO₂ + 2H₂O' },
  { id: 19, level: 2, reactants: [{ formula: 'C₂H₆', coefficient: 2 }, { formula: 'O₂', coefficient: 7 }], products: [{ formula: 'CO₂', coefficient: 4 }, { formula: 'H₂O', coefficient: 6 }], equation: '2C₂H₆ + 7O₂ → 4CO₂ + 6H₂O' },
  { id: 20, level: 2, reactants: [{ formula: 'C₃H₈', coefficient: 1 }, { formula: 'O₂', coefficient: 5 }], products: [{ formula: 'CO₂', coefficient: 3 }, { formula: 'H₂O', coefficient: 4 }], equation: 'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O' },
  { id: 21, level: 2, reactants: [{ formula: 'C₂H₄', coefficient: 1 }, { formula: 'O₂', coefficient: 3 }], products: [{ formula: 'CO₂', coefficient: 2 }, { formula: 'H₂O', coefficient: 2 }], equation: 'C₂H₄ + 3O₂ → 2CO₂ + 2H₂O' },
  { id: 22, level: 2, reactants: [{ formula: 'C₂H₂', coefficient: 2 }, { formula: 'O₂', coefficient: 5 }], products: [{ formula: 'CO₂', coefficient: 4 }, { formula: 'H₂O', coefficient: 2 }], equation: '2C₂H₂ + 5O₂ → 4CO₂ + 2H₂O' },
  { id: 23, level: 2, reactants: [{ formula: 'C₆H₆', coefficient: 2 }, { formula: 'O₂', coefficient: 15 }], products: [{ formula: 'CO₂', coefficient: 12 }, { formula: 'H₂O', coefficient: 6 }], equation: '2C₆H₆ + 15O₂ → 12CO₂ + 6H₂O' },
  { id: 24, level: 2, reactants: [{ formula: 'C₄H₁₀', coefficient: 2 }, { formula: 'O₂', coefficient: 13 }], products: [{ formula: 'CO₂', coefficient: 8 }, { formula: 'H₂O', coefficient: 10 }], equation: '2C₄H₁₀ + 13O₂ → 8CO₂ + 10H₂O' },

  // Level 3 - 酸塩基反応（完全中和のみ）
  // HCl系
  { id: 25, level: 3, reactants: [{ formula: 'HCl', coefficient: 1 }, { formula: 'NaOH', coefficient: 1 }], products: [{ formula: 'NaCl', coefficient: 1 }, { formula: 'H₂O', coefficient: 1 }], equation: 'HCl + NaOH → NaCl + H₂O' },
  { id: 29, level: 3, reactants: [{ formula: 'HCl', coefficient: 2 }, { formula: 'Ca(OH)₂', coefficient: 1 }], products: [{ formula: 'CaCl₂', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: '2HCl + Ca(OH)₂ → CaCl₂ + 2H₂O' },
  { id: 32, level: 3, reactants: [{ formula: 'HCl', coefficient: 1 }, { formula: 'KOH', coefficient: 1 }], products: [{ formula: 'KCl', coefficient: 1 }, { formula: 'H₂O', coefficient: 1 }], equation: 'HCl + KOH → KCl + H₂O' },
  { id: 34, level: 3, reactants: [{ formula: 'HCl', coefficient: 3 }, { formula: 'Al(OH)₃', coefficient: 1 }], products: [{ formula: 'AlCl₃', coefficient: 1 }, { formula: 'H₂O', coefficient: 3 }], equation: '3HCl + Al(OH)₃ → AlCl₃ + 3H₂O' },
  { id: 66, level: 3, reactants: [{ formula: 'HCl', coefficient: 2 }, { formula: 'Mg(OH)₂', coefficient: 1 }], products: [{ formula: 'MgCl₂', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: '2HCl + Mg(OH)₂ → MgCl₂ + 2H₂O' },
  { id: 67, level: 3, reactants: [{ formula: 'HCl', coefficient: 2 }, { formula: 'Ba(OH)₂', coefficient: 1 }], products: [{ formula: 'BaCl₂', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: '2HCl + Ba(OH)₂ → BaCl₂ + 2H₂O' },
  
  // H₂SO₄系
  { id: 26, level: 3, reactants: [{ formula: 'H₂SO₄', coefficient: 1 }, { formula: 'NaOH', coefficient: 2 }], products: [{ formula: 'Na₂SO₄', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: 'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O' },
  { id: 30, level: 3, reactants: [{ formula: 'H₂SO₄', coefficient: 1 }, { formula: 'Ca(OH)₂', coefficient: 1 }], products: [{ formula: 'CaSO₄', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: 'H₂SO₄ + Ca(OH)₂ → CaSO₄ + 2H₂O' },
  { id: 33, level: 3, reactants: [{ formula: 'H₂SO₄', coefficient: 1 }, { formula: 'KOH', coefficient: 2 }], products: [{ formula: 'K₂SO₄', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: 'H₂SO₄ + 2KOH → K₂SO₄ + 2H₂O' },
  { id: 35, level: 3, reactants: [{ formula: 'H₂SO₄', coefficient: 1 }, { formula: 'Mg(OH)₂', coefficient: 1 }], products: [{ formula: 'MgSO₄', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: 'H₂SO₄ + Mg(OH)₂ → MgSO₄ + 2H₂O' },
  { id: 68, level: 3, reactants: [{ formula: 'H₂SO₄', coefficient: 3 }, { formula: 'Al(OH)₃', coefficient: 2 }], products: [{ formula: 'Al₂(SO₄)₃', coefficient: 1 }, { formula: 'H₂O', coefficient: 6 }], equation: '3H₂SO₄ + 2Al(OH)₃ → Al₂(SO₄)₃ + 6H₂O' },
  { id: 69, level: 3, reactants: [{ formula: 'H₂SO₄', coefficient: 1 }, { formula: 'Ba(OH)₂', coefficient: 1 }], products: [{ formula: 'BaSO₄', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: 'H₂SO₄ + Ba(OH)₂ → BaSO₄ + 2H₂O' },
  
  // HNO₃系
  { id: 28, level: 3, reactants: [{ formula: 'HNO₃', coefficient: 1 }, { formula: 'KOH', coefficient: 1 }], products: [{ formula: 'KNO₃', coefficient: 1 }, { formula: 'H₂O', coefficient: 1 }], equation: 'HNO₃ + KOH → KNO₃ + H₂O' },
  { id: 31, level: 3, reactants: [{ formula: 'HNO₃', coefficient: 2 }, { formula: 'Ca(OH)₂', coefficient: 1 }], products: [{ formula: 'Ca(NO₃)₂', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: '2HNO₃ + Ca(OH)₂ → Ca(NO₃)₂ + 2H₂O' },
  { id: 70, level: 3, reactants: [{ formula: 'HNO₃', coefficient: 1 }, { formula: 'NaOH', coefficient: 1 }], products: [{ formula: 'NaNO₃', coefficient: 1 }, { formula: 'H₂O', coefficient: 1 }], equation: 'HNO₃ + NaOH → NaNO₃ + H₂O' },
  { id: 71, level: 3, reactants: [{ formula: 'HNO₃', coefficient: 2 }, { formula: 'Mg(OH)₂', coefficient: 1 }], products: [{ formula: 'Mg(NO₃)₂', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: '2HNO₃ + Mg(OH)₂ → Mg(NO₃)₂ + 2H₂O' },
  { id: 72, level: 3, reactants: [{ formula: 'HNO₃', coefficient: 3 }, { formula: 'Al(OH)₃', coefficient: 1 }], products: [{ formula: 'Al(NO₃)₃', coefficient: 1 }, { formula: 'H₂O', coefficient: 3 }], equation: '3HNO₃ + Al(OH)₃ → Al(NO₃)₃ + 3H₂O' },
  { id: 73, level: 3, reactants: [{ formula: 'HNO₃', coefficient: 2 }, { formula: 'Ba(OH)₂', coefficient: 1 }], products: [{ formula: 'Ba(NO₃)₂', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: '2HNO₃ + Ba(OH)₂ → Ba(NO₃)₂ + 2H₂O' },
  
  // CH₃COOH系
  { id: 27, level: 3, reactants: [{ formula: 'CH₃COOH', coefficient: 1 }, { formula: 'NaOH', coefficient: 1 }], products: [{ formula: 'CH₃COONa', coefficient: 1 }, { formula: 'H₂O', coefficient: 1 }], equation: 'CH₃COOH + NaOH → CH₃COONa + H₂O' },
  { id: 36, level: 3, reactants: [{ formula: 'CH₃COOH', coefficient: 1 }, { formula: 'KOH', coefficient: 1 }], products: [{ formula: 'CH₃COOK', coefficient: 1 }, { formula: 'H₂O', coefficient: 1 }], equation: 'CH₃COOH + KOH → CH₃COOK + H₂O' },
  { id: 74, level: 3, reactants: [{ formula: 'CH₃COOH', coefficient: 2 }, { formula: 'Ca(OH)₂', coefficient: 1 }], products: [{ formula: 'Ca(CH₃COO)₂', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: '2CH₃COOH + Ca(OH)₂ → Ca(CH₃COO)₂ + 2H₂O' },
  { id: 75, level: 3, reactants: [{ formula: 'CH₃COOH', coefficient: 2 }, { formula: 'Mg(OH)₂', coefficient: 1 }], products: [{ formula: 'Mg(CH₃COO)₂', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: '2CH₃COOH + Mg(OH)₂ → Mg(CH₃COO)₂ + 2H₂O' },
  { id: 76, level: 3, reactants: [{ formula: 'CH₃COOH', coefficient: 2 }, { formula: 'Ba(OH)₂', coefficient: 1 }], products: [{ formula: 'Ba(CH₃COO)₂', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: '2CH₃COOH + Ba(OH)₂ → Ba(CH₃COO)₂ + 2H₂O' },
  
  // その他の中和反応
  { id: 37, level: 3, reactants: [{ formula: 'CO₂', coefficient: 1 }, { formula: 'Ca(OH)₂', coefficient: 1 }], products: [{ formula: 'CaCO₃', coefficient: 1 }, { formula: 'H₂O', coefficient: 1 }], equation: 'CO₂ + Ca(OH)₂ → CaCO₃ + H₂O' },
  { id: 38, level: 3, reactants: [{ formula: 'NH₃', coefficient: 1 }, { formula: 'HCl', coefficient: 1 }], products: [{ formula: 'NH₄Cl', coefficient: 1 }], equation: 'NH₃ + HCl → NH₄Cl' },
  { id: 39, level: 3, reactants: [{ formula: 'NH₃', coefficient: 2 }, { formula: 'H₂SO₄', coefficient: 1 }], products: [{ formula: '(NH₄)₂SO₄', coefficient: 1 }], equation: '2NH₃ + H₂SO₄ → (NH₄)₂SO₄' },
  { id: 40, level: 3, reactants: [{ formula: 'H₂S', coefficient: 1 }, { formula: 'NaOH', coefficient: 2 }], products: [{ formula: 'Na₂S', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: 'H₂S + 2NaOH → Na₂S + 2H₂O' },
  { id: 41, level: 3, reactants: [{ formula: 'H₂S', coefficient: 1 }, { formula: 'KOH', coefficient: 2 }], products: [{ formula: 'K₂S', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: 'H₂S + 2KOH → K₂S + 2H₂O' },
  { id: 42, level: 3, reactants: [{ formula: 'H₂S', coefficient: 1 }, { formula: 'Ca(OH)₂', coefficient: 1 }], products: [{ formula: 'CaS', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: 'H₂S + Ca(OH)₂ → CaS + 2H₂O' },
  { id: 43, level: 3, reactants: [{ formula: 'H₂S', coefficient: 1 }, { formula: 'Ba(OH)₂', coefficient: 1 }], products: [{ formula: 'BaS', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: 'H₂S + Ba(OH)₂ → BaS + 2H₂O' },
  { id: 44, level: 3, reactants: [{ formula: 'NH₃', coefficient: 1 }, { formula: 'HNO₃', coefficient: 1 }], products: [{ formula: 'NH₄NO₃', coefficient: 1 }], equation: 'NH₃ + HNO₃ → NH₄NO₃' },
  { id: 45, level: 3, reactants: [{ formula: 'NH₃', coefficient: 1 }, { formula: 'CH₃COOH', coefficient: 1 }], products: [{ formula: 'CH₃COONH₄', coefficient: 1 }], equation: 'NH₃ + CH₃COOH → CH₃COONH₄' },
  { id: 46, level: 3, reactants: [{ formula: 'NH₃', coefficient: 1 }, { formula: 'HF', coefficient: 1 }], products: [{ formula: 'NH₄F', coefficient: 1 }], equation: 'NH₃ + HF → NH₄F' },
  { id: 47, level: 3, reactants: [{ formula: 'NaOH', coefficient: 1 }, { formula: 'HF', coefficient: 1 }], products: [{ formula: 'NaF', coefficient: 1 }, { formula: 'H₂O', coefficient: 1 }], equation: 'NaOH + HF → NaF + H₂O' },
  { id: 48, level: 3, reactants: [{ formula: 'KOH', coefficient: 1 }, { formula: 'HF', coefficient: 1 }], products: [{ formula: 'KF', coefficient: 1 }, { formula: 'H₂O', coefficient: 1 }], equation: 'KOH + HF → KF + H₂O' },
  { id: 49, level: 3, reactants: [{ formula: 'Ca(OH)₂', coefficient: 1 }, { formula: 'HF', coefficient: 2 }], products: [{ formula: 'CaF₂', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: 'Ca(OH)₂ + 2HF → CaF₂ + 2H₂O' },

  // Level 4 - 酸化還元反応
  { id: 50, level: 4, reactants: [{ formula: 'MnO₂', coefficient: 1 }, { formula: 'HCl', coefficient: 4 }], products: [{ formula: 'MnCl₂', coefficient: 1 }, { formula: 'Cl₂', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: 'MnO₂ + 4HCl → MnCl₂ + Cl₂ + 2H₂O' },
  { id: 51, level: 4, reactants: [{ formula: 'Br₂', coefficient: 1 }, { formula: 'KI', coefficient: 2 }], products: [{ formula: 'KBr', coefficient: 2 }, { formula: 'I₂', coefficient: 1 }], equation: 'Br₂ + 2KI → 2KBr + I₂' },
  { id: 52, level: 4, reactants: [{ formula: 'KMnO₄', coefficient: 2 }, { formula: 'HCl', coefficient: 16 }], products: [{ formula: 'MnCl₂', coefficient: 2 }, { formula: 'Cl₂', coefficient: 5 }, { formula: 'H₂O', coefficient: 8 }, { formula: 'KCl', coefficient: 2 }], equation: '2KMnO₄ + 16HCl → 2MnCl₂ + 5Cl₂ + 8H₂O + 2KCl' },
  { id: 53, level: 4, reactants: [{ formula: 'Cu', coefficient: 1 }, { formula: 'H₂SO₄', coefficient: 2 }], products: [{ formula: 'CuSO₄', coefficient: 1 }, { formula: 'SO₂', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: 'Cu + 2H₂SO₄ → CuSO₄ + SO₂ + 2H₂O' },
  { id: 54, level: 4, reactants: [{ formula: 'Zn', coefficient: 1 }, { formula: 'H₂SO₄', coefficient: 2 }], products: [{ formula: 'ZnSO₄', coefficient: 1 }, { formula: 'SO₂', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: 'Zn + 2H₂SO₄ → ZnSO₄ + SO₂ + 2H₂O' },
  { id: 55, level: 4, reactants: [{ formula: 'Cu', coefficient: 3 }, { formula: 'HNO₃', coefficient: 8 }], products: [{ formula: 'Cu(NO₃)₂', coefficient: 3 }, { formula: 'NO', coefficient: 2 }, { formula: 'H₂O', coefficient: 4 }], equation: '3Cu + 8HNO₃ → 3Cu(NO₃)₂ + 2NO + 4H₂O' },
  { id: 56, level: 4, reactants: [{ formula: 'Cu', coefficient: 1 }, { formula: 'HNO₃', coefficient: 4 }], products: [{ formula: 'Cu(NO₃)₂', coefficient: 1 }, { formula: 'NO₂', coefficient: 2 }, { formula: 'H₂O', coefficient: 2 }], equation: 'Cu + 4HNO₃ → Cu(NO₃)₂ + 2NO₂ + 2H₂O' },
  { id: 57, level: 4, reactants: [{ formula: 'Al', coefficient: 2 }, { formula: 'Fe₂O₃', coefficient: 1 }], products: [{ formula: 'Al₂O₃', coefficient: 1 }, { formula: 'Fe', coefficient: 2 }], equation: '2Al + Fe₂O₃ → Al₂O₃ + 2Fe' },
  { id: 58, level: 4, reactants: [{ formula: 'NH₃', coefficient: 4 }, { formula: 'O₂', coefficient: 5 }], products: [{ formula: 'NO', coefficient: 4 }, { formula: 'H₂O', coefficient: 6 }], equation: '4NH₃ + 5O₂ → 4NO + 6H₂O' },
  { id: 59, level: 4, reactants: [{ formula: 'H₂S', coefficient: 2 }, { formula: 'O₂', coefficient: 3 }], products: [{ formula: 'SO₂', coefficient: 2 }, { formula: 'H₂O', coefficient: 2 }], equation: '2H₂S + 3O₂ → 2SO₂ + 2H₂O' },
  { id: 60, level: 4, reactants: [{ formula: 'Cl₂', coefficient: 1 }, { formula: 'H₂O', coefficient: 1 }], products: [{ formula: 'HCl', coefficient: 1 }, { formula: 'HClO', coefficient: 1 }], equation: 'Cl₂ + H₂O → HCl + HClO' },
  { id: 61, level: 4, reactants: [{ formula: 'P₄', coefficient: 1 }, { formula: 'O₂', coefficient: 5 }], products: [{ formula: 'P₄O₁₀', coefficient: 1 }], equation: 'P₄ + 5O₂ → P₄O₁₀' },
  { id: 62, level: 4, reactants: [{ formula: 'C', coefficient: 1 }, { formula: 'O₂', coefficient: 1 }], products: [{ formula: 'CO₂', coefficient: 1 }], equation: 'C + O₂ → CO₂' },
  { id: 63, level: 4, reactants: [{ formula: 'S', coefficient: 1 }, { formula: 'O₂', coefficient: 1 }], products: [{ formula: 'SO₂', coefficient: 1 }], equation: 'S + O₂ → SO₂' },
  { id: 64, level: 4, reactants: [{ formula: 'Ag', coefficient: 1 }, { formula: 'HNO₃', coefficient: 2 }], products: [{ formula: 'AgNO₃', coefficient: 1 }, { formula: 'NO₂', coefficient: 1 }, { formula: 'H₂O', coefficient: 1 }], equation: 'Ag + 2HNO₃ → AgNO₃ + NO₂ + H₂O' },
  { id: 65, level: 4, reactants: [{ formula: 'Ag', coefficient: 3 }, { formula: 'HNO₃', coefficient: 4 }], products: [{ formula: 'AgNO₃', coefficient: 3 }, { formula: 'NO', coefficient: 1 }, { formula: 'H₂O', coefficient: 2 }], equation: '3Ag + 4HNO₃ → 3AgNO₃ + NO + 2H₂O' }
];

// 反応を検索する関数（レベル制限なし）
export function findReaction(formula1: string, formula2: string): ChemicalReaction | null {
  // 2つの物質で可能な反応を探索
  for (const reaction of CHEMICAL_REACTIONS) {
    // 反応物が2つの場合のみ対応（ケミ鍋の制限）
    if (reaction.reactants.length !== 2) continue;
    
    const reactant1 = reaction.reactants[0].formula;
    const reactant2 = reaction.reactants[1].formula;
    
    // 両方向でマッチング確認
    if ((formula1 === reactant1 && formula2 === reactant2) ||
        (formula1 === reactant2 && formula2 === reactant1)) {
      return reaction;
    }
  }
  
  return null;
}

// mol計算を行う関数
export function calculateReactionMols(
  reaction: ChemicalReaction,
  mol1: number,
  mol2: number,
  formula1: string,
  formula2: string
): {
  limitingReactant: string;
  producedMols: { formula: string; mols: number }[];
  remainingMols: { formula: string; mols: number }[];
} {
  // 反応物の係数を取得
  const reactant1 = reaction.reactants[0];
  const reactant2 = reaction.reactants[1];
  
  // 入力された物質と反応物の対応を確認
  let coeff1, coeff2, inputMol1, inputMol2;
  
  if (formula1 === reactant1.formula) {
    coeff1 = reactant1.coefficient;
    coeff2 = reactant2.coefficient;
    inputMol1 = mol1;
    inputMol2 = mol2;
  } else {
    coeff1 = reactant2.coefficient;
    coeff2 = reactant1.coefficient;
    inputMol1 = mol1;
    inputMol2 = mol2;
  }
  
  // 制限反応剤を決定
  const ratio1 = inputMol1 / coeff1;
  const ratio2 = inputMol2 / coeff2;
  const limitingRatio = Math.min(ratio1, ratio2);
  const limitingReactant = ratio1 < ratio2 ? formula1 : formula2;
  
  // 生成物の計算
  const producedMols = reaction.products.map(product => ({
    formula: product.formula,
    mols: limitingRatio * product.coefficient
  }));
  
  // 残存反応物の計算
  const remainingMols: { formula: string; mols: number }[] = [];
  const consumed1 = limitingRatio * coeff1;
  const consumed2 = limitingRatio * coeff2;
  
  if (inputMol1 - consumed1 > 0.001) {
    remainingMols.push({ formula: formula1, mols: inputMol1 - consumed1 });
  }
  if (inputMol2 - consumed2 > 0.001) {
    remainingMols.push({ formula: formula2, mols: inputMol2 - consumed2 });
  }
  
  return {
    limitingReactant,
    producedMols,
    remainingMols
  };
}