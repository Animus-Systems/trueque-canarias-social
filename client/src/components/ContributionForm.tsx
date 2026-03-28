import { useState } from 'react';
import { useTranslation } from '../i18n';

const UNIT_VALUES = ['hour', 'kg', 'unit', 'dozen', 'liter'] as const;
type BarterUnit = (typeof UNIT_VALUES)[number];

const DESCRIPTION_MAX = 600;

interface ContributionFormProps {
  isSubmitting: boolean;
  message: string | null;
  warning: string | null;
  onSubmit: (input: {
    skillName: string;
    itemName: string;
    ratio: number;
    offerUnit?: BarterUnit;
    receiveUnit?: BarterUnit;
    description: string;
    bananaValue?: number | null;
  }) => Promise<boolean>;
}

export function ContributionForm({
  isSubmitting,
  message,
  warning,
  onSubmit,
}: ContributionFormProps) {
  const { t } = useTranslation();
  const [skillName, setSkillName] = useState('');
  const [itemName, setItemName] = useState('');
  const [ratio, setRatio] = useState('1');
  const [offerUnit, setOfferUnit] = useState<BarterUnit>('hour');
  const [receiveUnit, setReceiveUnit] = useState<BarterUnit>('hour');
  const [bananaValue, setBananaValue] = useState('');
  const [description, setDescription] = useState('');

  const descriptionLength = description.length;
  const charCounterClass =
    descriptionLength >= DESCRIPTION_MAX
      ? 'char-counter at-limit'
      : descriptionLength >= DESCRIPTION_MAX * 0.9
        ? 'char-counter near-limit'
        : 'char-counter';

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{t('form.eyebrow')}</p>
          <h2>{t('form.heading')}</h2>
        </div>
        <p className="panel-copy">
          {t('form.copy')}
          <span className="required-indicator" aria-hidden="true"> *</span> {t('form.requiredNote')}
        </p>
      </div>

      <form
        className="contribution-form"
        onSubmit={async (event) => {
          event.preventDefault();

          const success = await onSubmit({
            skillName,
            itemName,
            ratio: Number(ratio),
            offerUnit,
            receiveUnit,
            description,
            bananaValue: bananaValue ? Number(bananaValue) : null,
          });

          if (success) {
            setSkillName('');
            setItemName('');
            setRatio('1');
            setOfferUnit('hour');
            setReceiveUnit('hour');
            setBananaValue('');
            setDescription('');
          }
        }}
      >
        <label>
          {t('form.skillLabel')}<span className="required-indicator" aria-hidden="true"> *</span>
          <input value={skillName} onChange={(e) => setSkillName(e.target.value)} maxLength={120} aria-required="true" />
        </label>

        <label>
          {t('form.offerUnitLabel')}
          <select className="unit-select" value={offerUnit} onChange={(e) => setOfferUnit(e.target.value as BarterUnit)}>
            <option value="hour">{t('unit.hour')}</option>
            <option value="kg">{t('unit.kg')}</option>
            <option value="unit">{t('unit.unit')}</option>
            <option value="dozen">{t('unit.dozen')}</option>
            <option value="liter">{t('unit.liter')}</option>
          </select>
        </label>

        <label>
          {t('form.itemLabel')}<span className="required-indicator" aria-hidden="true"> *</span>
          <input value={itemName} onChange={(e) => setItemName(e.target.value)} maxLength={120} aria-required="true" />
        </label>

        <label>
          {t('form.receiveUnitLabel')}
          <select className="unit-select" value={receiveUnit} onChange={(e) => setReceiveUnit(e.target.value as BarterUnit)}>
            <option value="hour">{t('unit.hour')}</option>
            <option value="kg">{t('unit.kg')}</option>
            <option value="unit">{t('unit.unit')}</option>
            <option value="dozen">{t('unit.dozen')}</option>
            <option value="liter">{t('unit.liter')}</option>
          </select>
        </label>

        <label>
          {t('form.ratioLabel')}<span className="required-indicator" aria-hidden="true"> *</span>
          <input type="number" min="0.01" max="9999" step="0.01" value={ratio} onChange={(e) => setRatio(e.target.value)} aria-required="true" />
        </label>

        <label>
          {t('form.bananaLabel')}
          <input type="number" min="0.1" max="9999" step="0.1" value={bananaValue} onChange={(e) => setBananaValue(e.target.value)} placeholder={t('form.bananaPlaceholder')} />
        </label>

        <label className="span-two">
          {t('form.contextLabel')}<span className="required-indicator" aria-hidden="true"> *</span>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('form.contextPlaceholder')}
            maxLength={DESCRIPTION_MAX}
            aria-required="true"
          />
          <span className={charCounterClass} aria-live="polite">
            {descriptionLength}/{DESCRIPTION_MAX}
          </span>
        </label>

        <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? t('form.submitting') : t('form.submit')}
        </button>
      </form>

      {message ? <p className="banner success" role="alert">{message}</p> : null}
      {warning ? <p className="banner warning" role="alert">{warning}</p> : null}
    </section>
  );
}
