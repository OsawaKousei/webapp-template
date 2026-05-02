import { addMinutes, format, formatDistanceToNow } from 'date-fns';
import { DemoPlaygroundView } from '../components/demo-playground-view';
import { useDemoStore } from '../stores/use-demo-store';
import { safeDivideResult } from '../utils/safe-math-result';

export const DemoPlaygroundWidget = () => {
  const counter = useDemoStore((state) => state.counter);
  const denominatorInput = useDemoStore((state) => state.denominatorInput);
  const denominator = useDemoStore((state) => state.denominator);
  const validationState = useDemoStore((state) => state.validationState);
  const lastUpdatedAt = useDemoStore((state) => state.lastUpdatedAt);
  const actions = useDemoStore((state) => state.actions);

  const divideResult = safeDivideResult({
    dividend: counter,
    divisor: denominator,
  });

  const divisionText = divideResult.match(
    (value) => {
      return `Result: ${counter} / ${denominator} = ${value.toFixed(2)}`;
    },
    (error) => {
      return error.message;
    },
  );

  const lastUpdatedText = formatDistanceToNow(lastUpdatedAt, {
    addSuffix: true,
  });

  const nextSyncText = format(addMinutes(lastUpdatedAt, 30), 'HH:mm:ss');

  return (
    <DemoPlaygroundView
      counter={counter}
      denominatorInput={denominatorInput}
      divisionText={divisionText}
      validationState={validationState}
      lastUpdatedText={lastUpdatedText}
      nextSyncText={nextSyncText}
      onIncrement={actions.increment}
      onDecrement={actions.decrement}
      onReset={actions.reset}
      onChangeDenominator={actions.setDenominatorInput}
    />
  );
};
