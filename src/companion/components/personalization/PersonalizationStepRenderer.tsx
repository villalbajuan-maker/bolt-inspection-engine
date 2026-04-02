import type { RequestedField } from '../../domain/companion.types';
import { AddressStep } from './AddressStep';
import { DamageHistoryStep } from './DamageHistoryStep';
import { RoofTypeStep } from './RoofTypeStep';
import { YearBuiltStep } from './YearBuiltStep';
import { UserGoalStep } from './UserGoalStep';

type PersonalizationStepRendererProps = {
  field?: RequestedField;
  currentInput: string;
  onSubmitField: (field: RequestedField, value: string | string[]) => void;
};

export function PersonalizationStepRenderer({
  field,
  currentInput,
  onSubmitField,
}: PersonalizationStepRendererProps) {
  if (!field) {
    return null;
  }

  switch (field) {
    case 'exactAddress':
      return <AddressStep value={currentInput} onSubmit={(value) => onSubmitField('exactAddress', value)} />;
    case 'roofType':
      return <RoofTypeStep onSubmit={(value) => onSubmitField('roofType', value)} />;
    case 'yearBuilt':
      return <YearBuiltStep onSubmit={(value) => onSubmitField('yearBuilt', value)} />;
    case 'damageHistory':
      return <DamageHistoryStep onSubmit={(value) => onSubmitField('damageHistory', value)} />;
    case 'userGoal':
      return <UserGoalStep onSubmit={(value) => onSubmitField('userGoal', value)} />;
    default:
      return null;
  }
}
