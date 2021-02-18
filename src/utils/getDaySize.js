export default function getDaySize(
  propsDaySize,
  horizontalMonthPadding,
  appendToInput,
  container,
  reactDatesTheme,
) {
  return container && appendToInput
    ? (
      container.clientWidth
      - (horizontalMonthPadding * 2)
      - (reactDatesTheme.spacing.dayPickerHorizontalPadding * 2)
    )
    / 7
    : propsDaySize;
}
