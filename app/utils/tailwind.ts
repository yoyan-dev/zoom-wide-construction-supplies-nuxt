const progressWidthClasses: Record<number, string> = {
  0: "w-0",
  10: "w-[10%]",
  20: "w-[20%]",
  30: "w-[30%]",
  40: "w-[40%]",
  50: "w-1/2",
  60: "w-[60%]",
  70: "w-[70%]",
  80: "w-[80%]",
  90: "w-[90%]",
  100: "w-full",
};

export const progressWidthClass = (value: number) => {
  const boundedValue = Math.min(100, Math.max(0, Math.round(value)));

  if (boundedValue === 0) {
    return progressWidthClasses[0];
  }

  const step = Math.min(100, Math.max(10, Math.round(boundedValue / 10) * 10));

  return progressWidthClasses[step] ?? progressWidthClasses[0];
};
