import PropTypes from 'prop-types';
import { useState } from 'react';
import DropdownField from '../../../../../../components/DropdownInput/Dropdown';
import {
  CARER_OPTIONS,
  TYPE_OPTIONS,
  PAY_RATE_OPTIONS,
  CHARGE_RATE_OPTIONS,
} from '../../../../../../data/clients/clientVisitConstantData';

const AddCarerModal = ({ onCancel, onAssign, setSelectedCarer }) => {
  const [selectedCarer, setSelectedCarerValue] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [payRateCard, setPayRateCard] = useState(PAY_RATE_OPTIONS[0]);
  const [chargeRateCard, setChargeRateCard] = useState(CHARGE_RATE_OPTIONS[0]);

  const handleAssign = () => {
    if (!selectedCarer || !selectedType) {
      alert('Please select both a carer and a type');
      return;
    }

    // Plain object payload
    const payload = {
      carer: selectedCarer,
      type: selectedType,
      payRateCard: payRateCard?.value || 'DEFAULT_PAY_RATE_CARD',
      chargeRateCard: chargeRateCard?.value || 'DEFAULT_CHARGE_RATE_CARD',
    };

    // Add to parent state array
    setSelectedCarer((prev) => [...prev, payload]);

    // Optional: call API here with `payload`
    // await api.post('/api/assign-caregiver', payload);

    onAssign(); // Close modal or continue
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl">
        <div className="p-6">
          <h2 className="text-xl text-customBlack1 poppins-medium mb-6">Add another type of carer</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-customBlack2 mb-1">
                Carer <span className="text-customEventCardBorder">*</span>
              </label>
              <DropdownField
                name="carer"
                value={selectedCarer}
                valueChange={(value) => setSelectedCarerValue(value.target.value)}
                options={CARER_OPTIONS}
                componentName="FormikValidation"
                placeholder="Select carer"
              />
            </div>

            <div>
              <label className="block text-sm text-customBlack2 mb-1">
                Type <span className="text-customEventCardBorder">*</span>
              </label>
              <DropdownField
                name="type"
                value={selectedType}
                valueChange={(value) => setSelectedType(value.target.value)}
                options={TYPE_OPTIONS}
                componentName="FormikValidation"
                placeholder="Select type"
              />
            </div>

            <div>
              <label className="block text-sm text-customBlack2 mb-1">Pay rate card</label>
              <DropdownField
                name="payRateCard"
                value={payRateCard}
                valueChange={setPayRateCard}
                options={PAY_RATE_OPTIONS}
                componentName="FormikValidation"
                placeholder="Select pay rate card"
              />
            </div>

            <div>
              <label className="block text-sm text-customBlack2 mb-1">Charge rate card</label>
              <DropdownField
                name="chargeRateCard"
                value={chargeRateCard}
                valueChange={setChargeRateCard}
                options={CHARGE_RATE_OPTIONS}
                componentName="FormikValidation"
                placeholder="Select charge rate card"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onCancel}
            className="rounded-md px-4 py-2 text-sm text-customBlack2 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            className="rounded-md bg-customDropdownBorder px-4 py-2 text-sm text-white hover:bg-customDropdownBorder/90"
          >
            Assign caregiver
          </button>
        </div>
      </div>
    </div>
  );
};

AddCarerModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onAssign: PropTypes.func.isRequired,
  setSelectedCarer: PropTypes.func.isRequired,
};

export default AddCarerModal
