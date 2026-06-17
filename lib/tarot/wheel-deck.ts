/**
 * The Tarot Wheel deck — 21 hand-painted Major Arcana cards by Chris,
 * adapted from the Original Botanica "Tarot Today" wheel.
 *
 * Each card carries an upright reading and a reversed ("upside down")
 * reading, in the artist's own voice. The daily wheel draws one card per
 * member per day, deterministically, and fixes its orientation for the day,
 * so it holds steady from morning to night the way the horoscope does.
 *
 * Card art and readings are Chris's work. Images live at
 * /public/tarot-wheel/card_{n}.png (n = 1..21).
 */

import { botanicaDayKey } from "./deck";

export type WheelCard = {
  /** Position on the wheel, 1–21, matching the image file card_{n}.png. */
  n: number;
  /** Stable slug. */
  id: string;
  /** Display name as printed on the card. */
  name: string;
  /** Public path to the card art. */
  image: string;
  /** The upright reading, in the artist's voice. */
  upright: string;
  /** The reversed ("upside down") reading. */
  reversed: string;
};

export const WHEEL_DECK: WheelCard[] = [
  {
    n: 1,
    id: "the-magician",
    name: "The Magician",
    image: "/tarot-wheel/card_1.png",
    upright: `This MAGICIAN knows things are not what they seem. Look deep--something doesn't feel right. Dig a bit and discover what's going on under your nose. Don't be tricked!`,
    reversed: `The MAGICIAN UPSIDE DOWN regrets to inform you there is no magic happening today. Sweat is the answer! Roll up your sleeves and embrace it. The beauty is in doing the hard work.`,
  },
  {
    n: 2,
    id: "the-high-priestess",
    name: "The High Priestess",
    image: "/tarot-wheel/card_2.png",
    upright: `THE HIGH PRIESTESS wants you to allow your Spiritual Departed Guides into your life today. Follow their guidance as they look down upon you and connect with someone special you still love.`,
    reversed: `THE HIGH PRIESTESS UPSIDE DOWN insists that you go with your gut today. Let your instincts and spiritual senses guide your decisions. Trust your intuition and go with it!`,
  },
  {
    n: 3,
    id: "the-empress",
    name: "The Empress",
    image: "/tarot-wheel/card_3.png",
    upright: `Today THE EMPRESS wants you to know that you cannot be responsible for someone else's happiness. You may offer unconditional love and support, but you should not take on the burden of trying to make others happy. You are only responsible for your own happiness.`,
    reversed: `THE EMPRESS UPSIDE DOWN implores you to spread your good karma out into the world today. Believe in it, and don't let others stop you from spreading the good vibes.`,
  },
  {
    n: 4,
    id: "the-emperor",
    name: "The Emperor",
    image: "/tarot-wheel/card_4.png",
    upright: `THE EMPEROR wants you to know that you have enough. Appreciate deeply what blessings you have in your life today and let that be good enough!`,
    reversed: `THE EMPEROR UPSIDE DOWN wants you to get off the couch and face your obstacles, insecurities, and demons head on. Get over your lazy ways! Today is for action.`,
  },
  {
    n: 5,
    id: "the-hierophant",
    name: "The Hierophant",
    image: "/tarot-wheel/card_5.png",
    upright: `THE HIEROPHANT implores you to make your own mistakes today. Where is the beauty in following others' missteps? There is much wisdom to be gained by learning from your own!`,
    reversed: `THE HIEROPHANT UPSIDE DOWN wants you to put others ahead of yourself today. Think of someone else! Pray for them and wish them goodwill and prosperity.`,
  },
  {
    n: 6,
    id: "the-lovers",
    name: "The Lovers",
    image: "/tarot-wheel/card_6.png",
    upright: `THE LOVERS CARD urges you to be open, ready, and willing to let love into your life today. Smile at a stranger. Look into their eyes. Find someone and don't let them go!`,
    reversed: `THE LOVERS UPSIDE DOWN says take a breath and slow down with your love interest today. Step back and reevaluate the situation. Hold off making a commitment and declaration of love for a bit.`,
  },
  {
    n: 7,
    id: "the-chariot",
    name: "The Chariot",
    image: "/tarot-wheel/card_7.png",
    upright: `Today THE CHARIOT urges you to find the courage and conviction to realize that now may be the time to move on to a new, fresh situation. THE CHARIOT is waiting. Jump in!`,
    reversed: `THE CHARIOT UPSIDE DOWN demands that you stand your ground and find the courage to get behind something that you truly believe in. Be bold. Do not shy away from the challenges you face today!`,
  },
  {
    n: 8,
    id: "strength",
    name: "Strength",
    image: "/tarot-wheel/card_8.png",
    upright: `Today THE STRENGTH CARD empowers you to confront The Wolf in your life. When you're alone in the middle of the night and The Wolf Appears--don't run. Face him. Look fearlessly into those eyes with strength and courage!`,
    reversed: `THE STRENGTH CARD UPSIDE DOWN signifies the need to recognize your demons. Today is not the day to ignore the dark side. Instead--be humble. Respect the power it holds!`,
  },
  {
    n: 9,
    id: "justice",
    name: "Justice",
    image: "/tarot-wheel/card_9.png",
    upright: `THE JUSTICE CARD wants you to resist the urge to sabotage yourself today. Do not create imaginary obstacles because you do not believe you deserve happiness and success. You do!`,
    reversed: `THE JUSTICE UPSIDE DOWN CARD orders you not to bully another soul mentally or physically today. Don't talk down to anyone, no matter how justified it feels. Move to a higher ground. Remember--no one likes a bully!`,
  },
  {
    n: 10,
    id: "wheel-of-fortune",
    name: "Wheel of Fortune",
    image: "/tarot-wheel/card_10.png",
    upright: `THE WHEEL OF FORTUNE CARD urges you to enjoy your ride today. Life is short and precious--so take advantage of every minute. You never know, so live today like it means everything. We all eventually return home to where we came from, so no worries!`,
    reversed: `THE WHEEL OF FORTUNE UPSIDE DOWN encourages you to stop making the same mistake over and over. Stop spinning your wheels and understand where you are always going wrong and stop it! Break the chain today.`,
  },
  {
    n: 11,
    id: "the-hermit",
    name: "The Hermit",
    image: "/tarot-wheel/card_11.png",
    upright: `THE HERMIT'S message for you today is simple: don't fear nor worry about future problems and obstacles that probably won't actually exist down the road. So don't dwell on them today!`,
    reversed: `THE HERMIT UPSIDE DOWN warns of danger lurking today. Be ready for it where you least expect it. Don't let your guard down. Stay awake to the danger!`,
  },
  {
    n: 12,
    id: "the-hanged-man",
    name: "The Hanged Man",
    image: "/tarot-wheel/card_12.png",
    upright: `THE HANGED MAN'S message today: do not take any pleasure in others' misfortune or pain. A person's suffering should not make you feel better about yourself. Rise above this negativity!`,
    reversed: `THE HANGED MAN UPSIDE DOWN is your lucky charm today. Be ready to flex your good fortune and reap the prosperity it can offer!`,
  },
  {
    n: 13,
    id: "death",
    name: "Death",
    image: "/tarot-wheel/card_13.png",
    upright: `THE DEATH CARD'S message is clear and direct. Let go of the destructive behavior of comparing yourself to others. Comparing leads to bitter jealousy and jealousy leads to the death of your soul. Be content in your own skin. You're special. Accept who you are!`,
    reversed: `DEATH UPSIDE DOWN urges you to experience today like it may be your last day. Take nothing for granted. Feel the earth under your feet and the breeze on your skin. Take the time to taste the sweet berries in your life!`,
  },
  {
    n: 14,
    id: "temperance",
    name: "Temperance",
    image: "/tarot-wheel/card_14.png",
    upright: `THE TEMPERANCE CARD wants you to start what you've been delaying. Do it today. However big or small, take the initiative to begin the journey and enjoy the process. Procrastination is a killer!`,
    reversed: `THE TEMPERANCE UPSIDE DOWN CARD is trying to tell you to finish what you have started. Don't wait for tomorrow--today is the day to wrap it up and let it live in our world!`,
  },
  {
    n: 15,
    id: "the-devil",
    name: "The Devil",
    image: "/tarot-wheel/card_15.png",
    upright: `THE DEVIL says do not let fear stop you today. Experience it, push through it, and accept it. But do not let it stop you from achieving your desired goals. Feel the fear. Do it anyway!`,
    reversed: `THE DEVIL UPSIDE DOWN understands your need to contact and connect with Departed Spirits. Send them love and appreciation today. Let this love connection be the motor to charge your spiritual blessings.`,
  },
  {
    n: 16,
    id: "the-tower",
    name: "The Tower",
    image: "/tarot-wheel/card_16.png",
    upright: `THE TOWER CARD empowers you to say YES today. Your first reaction may always be 'no', but today, find the strength and courage to say 'yes'. There is much power to be gained from just a word. Say it now. Say yes!`,
    reversed: `THE TOWER UPSIDE DOWN wants you to reach out to others spiritually today. Help them climb the spiritual ladder of life. Develop your own spiritual eye by aiding others. Find the beauty in it!`,
  },
  {
    n: 17,
    id: "the-star",
    name: "The Star",
    image: "/tarot-wheel/card_17.png",
    upright: `Today THE STAR CARD introduces you to the Law of Prosperity. It's simple--the more you give, the more will come back to you. Give without reservations and accept with an open heart. The beauty is in the giving!`,
    reversed: `THE STAR UPSIDE DOWN has a blunt message: you are not the star today. Be humble and accept your supporting role. Not everything has to be about you! Let someone else shine and find contentment in that.`,
  },
  {
    n: 18,
    id: "the-moon",
    name: "The Moon",
    image: "/tarot-wheel/card_18.png",
    upright: `Today THE MOON CARD is all about forgiving and believing in second chances. Let go of the hate and scorn you are holding onto. Let the animosity slip away. Hold no grudges today!`,
    reversed: `THE MOON UPSIDE DOWN is all about cleansing your stale behaviors and old ways. Gain a new perspective today. Bring some fresh and inspiring ideas into your world!`,
  },
  {
    n: 19,
    id: "the-sun",
    name: "The Sun",
    image: "/tarot-wheel/card_19.png",
    upright: `THE SUN CARD says to lighten up today! Don't be so serious and find some humor in your day. Be loose, flexible and funny. Today is for laughing. Chill out!`,
    reversed: `THE SUN CARD UPSIDE DOWN encourages you to embrace the unknown today. Walk in the shadows and darkness of the Sun. It's okay to not have every answer--you are not expected to. Just realize the mysteries of life can be very exciting and quite rewarding too!`,
  },
  {
    n: 20,
    id: "judgment",
    name: "Judgment",
    image: "/tarot-wheel/card_20.png",
    upright: `THE JUDGMENT CARD asks you to resist the urge to take the easy road. Take the path that is more difficult today. Embrace the obstacles of life. Find the beauty in doing things the hard way, instead of looking for the easy way. It's worth it!`,
    reversed: `THE JUDGMENT CARD UPSIDE DOWN pushes you to get out of your head today. Pay no attention to those obsessive thoughts. Do not be a slave to your own thinking. Rather--be a person of action. A doer!`,
  },
  {
    n: 21,
    id: "the-world",
    name: "The World",
    image: "/tarot-wheel/card_21.png",
    upright: `THE WORLD wants you to spread your vibes all over the planet today. Your goal and mission is simple: leave a positive, lasting fingerprint somewhere. Let your life be heard and felt, no matter how small it may be!`,
    reversed: `THE WORLD UPSIDE DOWN CARD indicates turbulence and strife. Your goal today is to let go of anger and pettiness. Let the negative stuff just melt away. It's all small stuff anyway!`,
  },
];

if (WHEEL_DECK.length !== 21) {
  throw new Error(`Tarot wheel must hold 21 cards. Found ${WHEEL_DECK.length}.`);
}

/** Re-exported for convenience so callers need only this module. */
export { botanicaDayKey };

/** A stable 32-bit FNV-1a hash. Deterministic across machines and runs. */
function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export type WheelDraw = {
  card: WheelCard;
  /** Zero-based index in WHEEL_DECK (0..20), useful for positioning. */
  index: number;
  /** True when the card lands "upside down". */
  reversed: boolean;
  /** The reading to show, chosen by orientation. */
  reading: string;
};

/**
 * The wheel result for a specific member on a given day. Deterministic: the
 * same person on the same date always lands on the same card and the same
 * orientation, so it holds steady through the day. Two members usually draw
 * different cards. No storage, no API — the member id plus the date is the
 * whole seed. Turns over at New York midnight, matching the rest of the app.
 */
export function drawWheelForUser(
  userId: string,
  dayKey: string = botanicaDayKey(),
): WheelDraw {
  const index = hashString(`${userId}:${dayKey}`) % WHEEL_DECK.length;
  // A separate seed for orientation so it is independent of which card lands.
  const reversed = hashString(`${userId}:${dayKey}:orientation`) % 2 === 1;
  const card = WHEEL_DECK[index];
  return {
    card,
    index,
    reversed,
    reading: reversed ? card.reversed : card.upright,
  };
}
