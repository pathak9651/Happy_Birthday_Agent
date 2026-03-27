import { buildPrompt } from "./promptBuilder.js";

const starters = {
  funny: [
    "Happy birthday to the only person who can turn chaos into a personal brand",
    "Another year older, another year closer to becoming the neighborhood legend nobody asked for"
  ],
  emotional: [
    "Happy birthday to someone whose presence quietly makes life feel lighter",
    "Some people arrive in your life and leave a mark that time only deepens"
  ],
  romantic: [
    "Happy birthday to the person who makes ordinary days feel like my favorite chapter",
    "Loving you has made even the smallest moments feel golden"
  ],
  savage: [
    "Happy birthday to the human proof that confidence really can outrun common sense",
    "You age like a premium meme: somehow more chaotic and more iconic every year"
  ],
  formal: [
    "Wishing you a birthday marked by joy, grace, and well-earned celebration",
    "May this occasion reflect the warmth and respect you inspire in others"
  ],
  dramatic: [
    "Picture the background score rising, the wind machine switching on, and your grand entry stealing the scene",
    "If birthdays had opening credits, yours would absolutely come with slow motion and a standing ovation"
  ],
  rap: [
    "Birthday beat drop, spotlight on, today your whole vibe levels up",
    "Mic check, cake check, legend in the room and we all know who it is"
  ],
  voice: [
    "Today is not just another date on the calendar... it is your moment",
    "Pause for a second... because someone special deserves a proper celebration"
  ]
};

function pick(list, seedText) {
  const source = list?.length ? list : starters.funny;
  const seed = Array.from(seedText).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return source[seed % source.length];
}

function createFallbackMessage(input) {
  const opener = pick(starters[input.style], `${input.name}${input.relationship}`);
  const interests = input.interests?.length
    ? `From ${input.interests.join(" and ")} to the way you bring your own energy into every room,`
    : "From your one-of-a-kind energy to the way you make ordinary moments better,";

  const middleByStyle = {
    funny: `you somehow make being wildly unserious look like a talent. Honestly, it is impressive that you've made ${input.age ? `${input.age}` : "this stage of life"} look like an ongoing comedy special.`,
    emotional: `you have a way of making people feel seen, safe, and appreciated. That kind of presence is rare, and I hope today gives even a fraction of that back to you.`,
    romantic: `being close to you has made life softer, brighter, and more meaningful. You are home in human form, and I hope today wraps you in the same love you give so naturally.`,
    savage: `you continue to age with boldness, audacity, and suspicious levels of confidence. It is honestly inspiring to watch someone roast life before life gets the chance to roast them.`,
    formal: `your character, dedication, and warmth leave a lasting impression on the people around you. May this new year bring fresh opportunities worthy of your spirit.`,
    dramatic: `your birthday deserves full cinematic treatment: lights, dialogue, confetti, and a close-up worthy of the big screen. No side character energy is allowed today.`,
    rap: `your vibe stays loud, your circle stays proud, and your story keeps leveling up bar by bar. Today is yours, so let the whole room say it back out loud.`,
    voice: `You deserve a day that feels unhurried... joyful... and unmistakably yours. Let the laughter stay a little longer, and let every kind word truly land.`
  };

  const endingByStyle = {
    funny: `Stay ridiculous, stay iconic, and try not to scare the cake with your birthday energy.`,
    emotional: `May this year hold gentle surprises, real peace, and the kind of joy that stays.`,
    romantic: `Happy birthday, my love. If I get to keep celebrating you, I will never run out of reasons to smile.`,
    savage: `Keep winning, keep glowing, and keep pretending the candles are just decorative.`,
    formal: `Happy birthday, and may the year ahead be as remarkable as the example you set.`,
    dramatic: `Take your bow, own the frame, and make this next chapter impossible to forget.`,
    rap: `New year, new heat, same unmatched glow. Happy birthday and let the whole world know.`,
    voice: `Happy birthday... and may this next chapter sound exactly like joy.`
  };

  return `${opener}. ${interests} ${middleByStyle[input.style] || middleByStyle.funny} ${endingByStyle[input.style] || endingByStyle.funny}`;
}

export async function generateMessage(input) {
  const prompt = buildPrompt(input);

  if (input.useLiveAi) {
    return {
      prompt,
      provider: "OpenAI",
      message: `Live AI mode is ready for your API integration. Prompt preview: ${prompt}`
    };
  }

  return {
    prompt,
    provider: "Local template engine",
    message: createFallbackMessage(input)
  };
}
