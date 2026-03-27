const styleGuides = {
  funny: {
    tone: "playful, witty, and human",
    extra: "Include one light roast that feels affectionate."
  },
  emotional: {
    tone: "warm, grateful, and reflective",
    extra: "Include meaningful appreciation and a memory-like detail."
  },
  romantic: {
    tone: "heartfelt, intimate, and sincere",
    extra: "Include one line that feels deeply personal and memorable."
  },
  savage: {
    tone: "sharp, teasing, and clever",
    extra: "Use sarcasm without sounding cruel or offensive."
  },
  formal: {
    tone: "polished, respectful, and elegant",
    extra: "Keep the language graceful and composed."
  },
  dramatic: {
    tone: "larger-than-life and cinematic",
    extra: "Add dramatic flair and one punchy line."
  },
  rap: {
    tone: "rhythmic, confident, and punchy",
    extra: "Use rhyme and cadence that sounds natural aloud."
  },
  voice: {
    tone: "smooth, expressive, and narration-friendly",
    extra: "Use pauses with ellipses and keep sentences easy to speak."
  }
};

export const promptPresets = [
  {
    id: "universal",
    label: "Universal Smart Prompt",
    description: "Balanced personalization for most birthday wishes."
  },
  {
    id: "funny",
    label: "Funny / Roast Prompt",
    description: "Adds playful exaggeration, sarcasm, and a wholesome close."
  },
  {
    id: "emotional",
    label: "Emotional Deep Prompt",
    description: "Leans into gratitude, appreciation, and poetic warmth."
  },
  {
    id: "dramatic",
    label: "Bollywood / Rap Prompt",
    description: "Can swing filmy and dramatic or switch into rap energy."
  },
  {
    id: "voice",
    label: "Voice Script Prompt",
    description: "Designed to sound natural when spoken aloud."
  }
];

function formatInterests(interests) {
  if (!interests?.length) {
    return "their unique vibe";
  }

  return interests.join(", ");
}

export function buildPrompt(input) {
  const guide = styleGuides[input.style] || styleGuides.funny;
  const promptType = input.promptType || "universal";
  const interests = formatInterests(input.interests);
  const ageText = input.age ? `${input.age}` : "not specified";

  return [
    "You are an advanced AI birthday assistant.",
    `Create a birthday message for ${input.name}, who is the user's ${input.relationship}.`,
    `Use a ${guide.tone} tone.`,
    `The selected prompt mode is ${promptType}.`,
    `Their interests include ${interests}.`,
    `Age: ${ageText}.`,
    guide.extra,
    "Avoid generic wishes completely.",
    "Write like a real person, not a greeting card template.",
    "Make the message memorable, specific, and engaging.",
    "End with a strong closing line."
  ].join(" ");
}
