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
  /**
   * The upright reading(s), in the artist's voice. May be a single fortune or
   * a list of fortunes for variety — the daily draw picks one (stable per day).
   */
  upright: string | string[];
  /** The reversed ("upside down") reading(s). Single fortune or a list. */
  reversed: string | string[];
};

export const WHEEL_DECK: WheelCard[] = [
  {
    n: 1,
    id: "the-magician",
    name: "The Magician",
    image: "/tarot-wheel/card_1.png",
    upright: [
      `This MAGICIAN knows things are not what they seem. Look deep--something doesn't feel right. Dig a bit and discover what's going on under your nose. Don't be tricked!`,
      `THE MAGICIAN reminds you that you already hold every tool you need today. Stop waiting for permission. Wave your own wand and make the first move!`,
      `THE MAGICIAN says today is yours to shape. Set one clear intention this morning and watch the pieces start to move. You are the magic!`,
    ],
    reversed: [
      `The MAGICIAN UPSIDE DOWN regrets to inform you there is no magic happening today. Sweat is the answer! Roll up your sleeves and embrace it. The beauty is in doing the hard work.`,
      `THE MAGICIAN UPSIDE DOWN smells smoke and mirrors today. Somebody is selling you a story. Trust what you can prove, not what you're promised!`,
      `THE MAGICIAN UPSIDE DOWN warns you not to fool yourself today. The excuse you keep repeating isn't true and you know it. Drop the act and get honest!`,
    ],
  },
  {
    n: 2,
    id: "the-high-priestess",
    name: "The High Priestess",
    image: "/tarot-wheel/card_2.png",
    upright: [
      `THE HIGH PRIESTESS wants you to allow your Spiritual Departed Guides into your life today. Follow their guidance as they look down upon you and connect with someone special you still love.`,
      `THE HIGH PRIESTESS asks you to get quiet today. The answer you're chasing is already whispering inside you. Stop talking and listen!`,
      `THE HIGH PRIESTESS reminds you that not everything needs to be shared today. Hold your secret close and let its power grow in the silence!`,
    ],
    reversed: [
      `THE HIGH PRIESTESS UPSIDE DOWN insists that you go with your gut today. Let your instincts and spiritual senses guide your decisions. Trust your intuition and go with it!`,
      `THE HIGH PRIESTESS UPSIDE DOWN says you're ignoring a feeling you shouldn't. That little knot in your stomach is trying to protect you. Pay attention today!`,
      `THE HIGH PRIESTESS UPSIDE DOWN warns against overthinking today. You've researched it to death. Close the laptop and let your spirit decide!`,
    ],
  },
  {
    n: 3,
    id: "the-empress",
    name: "The Empress",
    image: "/tarot-wheel/card_3.png",
    upright: [
      `Today THE EMPRESS wants you to know that you cannot be responsible for someone else's happiness. You may offer unconditional love and support, but you should not take on the burden of trying to make others happy. You are only responsible for your own happiness.`,
      `THE EMPRESS wants you to nurture something today. A plant, a friendship, a dream, yourself. Pour your love into it and watch it bloom!`,
      `THE EMPRESS reminds you that you are abundant today. Stop counting what's missing and start tending what's already growing in your garden!`,
    ],
    reversed: [
      `THE EMPRESS UPSIDE DOWN implores you to spread your good karma out into the world today. Believe in it, and don't let others stop you from spreading the good vibes.`,
      `THE EMPRESS UPSIDE DOWN asks who's been pouring from an empty cup. You can't give what you don't have. Fill yourself back up first today!`,
      `THE EMPRESS UPSIDE DOWN says stop neglecting yourself for everyone else. Today, mother yourself the way you mother the world!`,
    ],
  },
  {
    n: 4,
    id: "the-emperor",
    name: "The Emperor",
    image: "/tarot-wheel/card_4.png",
    upright: [
      `THE EMPEROR wants you to know that you have enough. Appreciate deeply what blessings you have in your life today and let that be good enough!`,
      `THE EMPEROR tells you to take charge today. Quit waiting for someone to hand you a plan. Build your own structure and lead the way!`,
      `THE EMPEROR reminds you that discipline is freedom. Do the boring, important thing today and tomorrow will thank you for it!`,
    ],
    reversed: [
      `THE EMPEROR UPSIDE DOWN wants you to get off the couch and face your obstacles, insecurities, and demons head on. Get over your lazy ways! Today is for action.`,
      `THE EMPEROR UPSIDE DOWN warns you not to be a tyrant today, especially to yourself. Loosen the grip. Not everything needs controlling!`,
      `THE EMPEROR UPSIDE DOWN says rigid things break. Bend a little today. There is real strength in knowing when to soften!`,
    ],
  },
  {
    n: 5,
    id: "the-hierophant",
    name: "The Hierophant",
    image: "/tarot-wheel/card_5.png",
    upright: [
      `THE HIEROPHANT implores you to make your own mistakes today. Where is the beauty in following others' missteps? There is much wisdom to be gained by learning from your own!`,
      `THE HIEROPHANT invites you to learn something today. Ask the question you're afraid sounds foolish. The student always outgrows the know-it-all!`,
      `THE HIEROPHANT reminds you that tradition carries wisdom. Call an elder today and really listen. There is gold in the old ways!`,
    ],
    reversed: [
      `THE HIEROPHANT UPSIDE DOWN wants you to put others ahead of yourself today. Think of someone else! Pray for them and wish them goodwill and prosperity.`,
      `THE HIEROPHANT UPSIDE DOWN says question the rule that no longer fits you. Just because it's always been done that way doesn't make it yours. Break it today!`,
      `THE HIEROPHANT UPSIDE DOWN tells you to trust your own compass today. You don't need anyone's permission to live your truth!`,
    ],
  },
  {
    n: 6,
    id: "the-lovers",
    name: "The Lovers",
    image: "/tarot-wheel/card_6.png",
    upright: [
      `THE LOVERS CARD urges you to be open, ready, and willing to let love into your life today. Smile at a stranger. Look into their eyes. Find someone and don't let them go!`,
      `THE LOVERS remind you that love starts in the mirror today. Be as kind to yourself as you'd be to the one you adore. Fall for your own life first!`,
      `THE LOVERS CARD urges you to choose today, not just drift. Say how you feel out loud. The heart that risks is the heart that's rewarded!`,
    ],
    reversed: [
      `THE LOVERS UPSIDE DOWN says take a breath and slow down with your love interest today. Step back and reevaluate the situation. Hold off making a commitment and declaration of love for a bit.`,
      `THE LOVERS UPSIDE DOWN ask one honest question today: is this the real thing, or just the fear of being alone? Choose from your heart, not your loneliness!`,
      `THE LOVERS UPSIDE DOWN say repair what's worth keeping today. A small, honest conversation can mend more than you think. Reach out first!`,
    ],
  },
  {
    n: 7,
    id: "the-chariot",
    name: "The Chariot",
    image: "/tarot-wheel/card_7.png",
    upright: [
      `Today THE CHARIOT urges you to find the courage and conviction to realize that now may be the time to move on to a new, fresh situation. THE CHARIOT is waiting. Jump in!`,
      `THE CHARIOT says pick one direction today and GO. Half your power is leaking out from trying to drive two roads at once. Commit and ride!`,
      `THE CHARIOT reminds you that momentum loves a decision. Take the first small step today and the path will rise up to meet you!`,
    ],
    reversed: [
      `THE CHARIOT UPSIDE DOWN demands that you stand your ground and find the courage to get behind something that you truly believe in. Be bold. Do not shy away from the challenges you face today!`,
      `THE CHARIOT UPSIDE DOWN says slow the horses today. You're pushing so hard you've lost the reins. Get back in control before you charge ahead!`,
      `THE CHARIOT UPSIDE DOWN warns that speed isn't the same as progress. Stop, check your map, then move. Rushing will only cost you today!`,
    ],
  },
  {
    n: 8,
    id: "strength",
    name: "Strength",
    image: "/tarot-wheel/card_8.png",
    upright: [
      `Today THE STRENGTH CARD empowers you to confront The Wolf in your life. When you're alone in the middle of the night and The Wolf Appears--don't run. Face him. Look fearlessly into those eyes with strength and courage!`,
      `THE STRENGTH CARD reminds you that gentleness is power today. You don't have to roar to be strong. Handle it with a calm, steady hand!`,
      `THE STRENGTH CARD says you've survived harder than this. Look back at what you've already carried, then square your shoulders and carry on!`,
    ],
    reversed: [
      `THE STRENGTH CARD UPSIDE DOWN signifies the need to recognize your demons. Today is not the day to ignore the dark side. Instead--be humble. Respect the power it holds!`,
      `THE STRENGTH CARD UPSIDE DOWN whispers that it's okay to rest today. Even the lion sleeps. Real strength knows when to lay the weight down!`,
      `THE STRENGTH CARD UPSIDE DOWN says stop bullying yourself into it. Speak to yourself like someone you love today. That's where true power begins!`,
    ],
  },
  {
    n: 9,
    id: "justice",
    name: "Justice",
    image: "/tarot-wheel/card_9.png",
    upright: [
      `THE JUSTICE CARD wants you to resist the urge to sabotage yourself today. Do not create imaginary obstacles because you do not believe you deserve happiness and success. You do!`,
      `THE JUSTICE CARD asks you to tell the truth today, even when it costs you. A clean conscience is worth more than an easy lie!`,
      `THE JUSTICE CARD says what goes around is coming around in your favor today. You've been fair and patient. Get ready to collect what you're owed!`,
    ],
    reversed: [
      `THE JUSTICE UPSIDE DOWN CARD orders you not to bully another soul mentally or physically today. Don't talk down to anyone, no matter how justified it feels. Move to a higher ground. Remember--no one likes a bully!`,
      `THE JUSTICE CARD UPSIDE DOWN warns you to own your part today. Stop keeping score of everyone else's wrongs. Clean your own side of the street first!`,
      `THE JUSTICE CARD UPSIDE DOWN says life isn't always fair, and dwelling on it changes nothing. Accept what you can't fix and free yourself today!`,
    ],
  },
  {
    n: 10,
    id: "wheel-of-fortune",
    name: "Wheel of Fortune",
    image: "/tarot-wheel/card_10.png",
    upright: [
      `THE WHEEL OF FORTUNE CARD urges you to enjoy your ride today. Life is short and precious--so take advantage of every minute. You never know, so live today like it means everything. We all eventually return home to where we came from, so no worries!`,
      `THE WHEEL OF FORTUNE is turning your way today. When luck knocks, don't overthink it. Open the door and say yes. Fortune favors the ready!`,
      `THE WHEEL OF FORTUNE reminds you that everything changes, so plant a seed today. The wheel that's down will rise again. Bet on the turn!`,
    ],
    reversed: [
      `THE WHEEL OF FORTUNE UPSIDE DOWN encourages you to stop making the same mistake over and over. Stop spinning your wheels and understand where you are always going wrong and stop it! Break the chain today.`,
      `THE WHEEL OF FORTUNE UPSIDE DOWN says quit blaming bad luck today. The pattern you keep repeating is the one thing you can actually change!`,
      `THE WHEEL OF FORTUNE UPSIDE DOWN warns that a low moment is not the whole story. Hold on. This too is just a turn of the wheel!`,
    ],
  },
  {
    n: 11,
    id: "the-hermit",
    name: "The Hermit",
    image: "/tarot-wheel/card_11.png",
    upright: [
      `THE HERMIT'S message for you today is simple: don't fear nor worry about future problems and obstacles that probably won't actually exist down the road. So don't dwell on them today!`,
      `THE HERMIT tells you to take some time alone today. The noise has been drowning out your own voice. Step away and hear yourself think!`,
      `THE HERMIT reminds you that you already know the answer. Stop polling everyone you meet. Sit with yourself today and the truth will surface!`,
    ],
    reversed: [
      `THE HERMIT UPSIDE DOWN warns of danger lurking today. Be ready for it where you least expect it. Don't let your guard down. Stay awake to the danger!`,
      `THE HERMIT UPSIDE DOWN says you've isolated long enough. Come down from the mountain today. Let one person back in. You weren't meant to do it all alone!`,
      `THE HERMIT UPSIDE DOWN warns against hiding from your life today. The cave was for resting, not for living. Step back into the light!`,
    ],
  },
  {
    n: 12,
    id: "the-hanged-man",
    name: "The Hanged Man",
    image: "/tarot-wheel/card_12.png",
    upright: [
      `THE HANGED MAN'S message today: do not take any pleasure in others' misfortune or pain. A person's suffering should not make you feel better about yourself. Rise above this negativity!`,
      `THE HANGED MAN says flip your view today. The thing frustrating you looks completely different upside down. Surrender the struggle and see it fresh!`,
      `THE HANGED MAN reminds you that waiting is doing something. Don't force the door that won't open today. Be patient and let it come to you!`,
    ],
    reversed: [
      `THE HANGED MAN UPSIDE DOWN is your lucky charm today. Be ready to flex your good fortune and reap the prosperity it can offer!`,
      `THE HANGED MAN UPSIDE DOWN says stop stalling today. You've been hanging in limbo long enough. Make the call, take the step, end the waiting!`,
      `THE HANGED MAN UPSIDE DOWN warns that some sacrifices aren't worth it. If it only drains you, let it go today. Martyrdom is not a virtue!`,
    ],
  },
  {
    n: 13,
    id: "death",
    name: "Death",
    image: "/tarot-wheel/card_13.png",
    upright: [
      `THE DEATH CARD'S message is clear and direct. Let go of the destructive behavior of comparing yourself to others. Comparing leads to bitter jealousy and jealousy leads to the death of your soul. Be content in your own skin. You're special. Accept who you are!`,
      `THE DEATH CARD asks what you're still carrying that's already gone. A habit, a grudge, an old story. Set it down today and let something new be born!`,
      `THE DEATH CARD says the door is closing so a better one can open. Don't mourn the ending too long. Turn around and meet what's coming!`,
    ],
    reversed: [
      `DEATH UPSIDE DOWN urges you to experience today like it may be your last day. Take nothing for granted. Feel the earth under your feet and the breeze on your skin. Take the time to taste the sweet berries in your life!`,
      `DEATH UPSIDE DOWN whispers that endings are doorways. What feels like it's falling apart today may be falling into place. Trust the change and walk through!`,
      `DEATH UPSIDE DOWN says you're clinging to something that's run its course. Loosen your grip today. You cannot grow new leaves while holding the dead ones!`,
    ],
  },
  {
    n: 14,
    id: "temperance",
    name: "Temperance",
    image: "/tarot-wheel/card_14.png",
    upright: [
      `THE TEMPERANCE CARD wants you to start what you've been delaying. Do it today. However big or small, take the initiative to begin the journey and enjoy the process. Procrastination is a killer!`,
      `THE TEMPERANCE CARD asks for balance today. You've been all work or all worry. Mix in a little of what feeds your soul and even the scales!`,
      `THE TEMPERANCE CARD says slow and steady wins today. No wild swings. One patient, measured step at a time gets you all the way there!`,
    ],
    reversed: [
      `THE TEMPERANCE UPSIDE DOWN CARD is trying to tell you to finish what you have started. Don't wait for tomorrow--today is the day to wrap it up and let it live in our world!`,
      `THE TEMPERANCE CARD UPSIDE DOWN warns you're running on extremes today. Too much of anything turns to poison. Find the middle path and breathe!`,
      `THE TEMPERANCE CARD UPSIDE DOWN says stop pouring your energy into the wrong cup. Realign with what actually matters to you today!`,
    ],
  },
  {
    n: 15,
    id: "the-devil",
    name: "The Devil",
    image: "/tarot-wheel/card_15.png",
    upright: [
      `THE DEVIL says do not let fear stop you today. Experience it, push through it, and accept it. But do not let it stop you from achieving your desired goals. Feel the fear. Do it anyway!`,
      `THE DEVIL asks what's really got you chained today. That habit, that fear, that phone. Name it out loud. You can't break a chain you won't look at!`,
      `THE DEVIL reminds you that temptation is loudest right before you grow. Say no to the easy hit today and yes to the life you actually want!`,
    ],
    reversed: [
      `THE DEVIL UPSIDE DOWN understands your need to contact and connect with Departed Spirits. Send them love and appreciation today. Let this love connection be the motor to charge your spiritual blessings.`,
      `THE DEVIL UPSIDE DOWN says today is your prison break. The lock was never as strong as you believed. Walk out. You are free the moment you decide!`,
      `THE DEVIL UPSIDE DOWN tells you to cut the cord today. That thing you keep going back to gives you nothing. Release it and feel yourself get lighter!`,
    ],
  },
  {
    n: 16,
    id: "the-tower",
    name: "The Tower",
    image: "/tarot-wheel/card_16.png",
    upright: [
      `THE TOWER CARD empowers you to say YES today. Your first reaction may always be 'no', but today, find the strength and courage to say 'yes'. There is much power to be gained from just a word. Say it now. Say yes!`,
      `THE TOWER CARD says let it fall today. What's crumbling was never built on solid ground. Clear the rubble and you'll build something true!`,
      `THE TOWER CARD reminds you that a shock can be a gift. The ground shifting today is shaking you awake. Pay attention to what it reveals!`,
    ],
    reversed: [
      `THE TOWER UPSIDE DOWN wants you to reach out to others spiritually today. Help them climb the spiritual ladder of life. Develop your own spiritual eye by aiding others. Find the beauty in it!`,
      `THE TOWER UPSIDE DOWN says you saw the cracks coming, so act before it breaks today. A small honest fix now saves a collapse later!`,
      `THE TOWER UPSIDE DOWN warns you're holding up a wall that wants to fall. Stop the patch jobs. Let the old thing go and rebuild today!`,
    ],
  },
  {
    n: 17,
    id: "the-star",
    name: "The Star",
    image: "/tarot-wheel/card_17.png",
    upright: [
      `Today THE STAR CARD introduces you to the Law of Prosperity. It's simple--the more you give, the more will come back to you. Give without reservations and accept with an open heart. The beauty is in the giving!`,
      `THE STAR CARD asks you to make a wish today and actually believe it. Hope is not foolish, it's fuel. Aim high and let the universe catch up to you!`,
      `THE STAR CARD says the storm has passed. Lift your head today. Healing is here, and brighter days are already on their way to you!`,
    ],
    reversed: [
      `THE STAR UPSIDE DOWN has a blunt message: you are not the star today. Be humble and accept your supporting role. Not everything has to be about you! Let someone else shine and find contentment in that.`,
      `THE STAR UPSIDE DOWN says don't lose faith now. The light feels far today, but it hasn't gone out. Keep walking toward it!`,
      `THE STAR UPSIDE DOWN reminds you that you can't pour hope into others while starving your own. Refill your spirit today!`,
    ],
  },
  {
    n: 18,
    id: "the-moon",
    name: "The Moon",
    image: "/tarot-wheel/card_18.png",
    upright: [
      `Today THE MOON CARD is all about forgiving and believing in second chances. Let go of the hate and scorn you are holding onto. Let the animosity slip away. Hold no grudges today!`,
      `THE MOON CARD says not everything is as scary as it looks tonight. The shadow on the wall is just a coat on a chair. Walk toward the fear and watch it shrink!`,
      `THE MOON CARD asks you to trust the dream you keep having. Your subconscious is mailing you a letter. Open it today!`,
    ],
    reversed: [
      `THE MOON UPSIDE DOWN is all about cleansing your stale behaviors and old ways. Gain a new perspective today. Bring some fresh and inspiring ideas into your world!`,
      `THE MOON CARD UPSIDE DOWN says the fog is finally lifting today. What confused you is becoming clear. Trust what you're starting to see!`,
      `THE MOON CARD UPSIDE DOWN warns that someone or something isn't what it seems. The truth is surfacing today. Don't look away from it!`,
    ],
  },
  {
    n: 19,
    id: "the-sun",
    name: "The Sun",
    image: "/tarot-wheel/card_19.png",
    upright: [
      `THE SUN CARD says to lighten up today! Don't be so serious and find some humor in your day. Be loose, flexible and funny. Today is for laughing. Chill out!`,
      `THE SUN CARD says let yourself be seen today. Stop dimming your light to keep others comfortable. Shine, somebody out there needs the warmth!`,
      `THE SUN CARD reminds you that joy is allowed today. You don't have to earn it. Soak up one good moment and let it fill you all the way up!`,
    ],
    reversed: [
      `THE SUN CARD UPSIDE DOWN encourages you to embrace the unknown today. Walk in the shadows and darkness of the Sun. It's okay to not have every answer--you are not expected to. Just realize the mysteries of life can be very exciting and quite rewarding too!`,
      `THE SUN CARD UPSIDE DOWN says the clouds are temporary today. Your shine didn't disappear, it's just behind something. Be patient, it returns!`,
      `THE SUN CARD UPSIDE DOWN reminds you not to fake the smile today. It's okay to admit you're tired. Real light doesn't need to perform!`,
    ],
  },
  {
    n: 20,
    id: "judgment",
    name: "Judgment",
    image: "/tarot-wheel/card_20.png",
    upright: [
      `THE JUDGMENT CARD asks you to resist the urge to take the easy road. Take the path that is more difficult today. Embrace the obstacles of life. Find the beauty in doing things the hard way, instead of looking for the easy way. It's worth it!`,
      `THE JUDGMENT CARD calls you to rise today. That second chance you've been hoping for has arrived. Answer it. Don't let it pass!`,
      `THE JUDGMENT CARD asks you to forgive an old version of yourself today. You did the best you knew then. Let it go and step forward clean!`,
    ],
    reversed: [
      `THE JUDGMENT CARD UPSIDE DOWN pushes you to get out of your head today. Pay no attention to those obsessive thoughts. Do not be a slave to your own thinking. Rather--be a person of action. A doer!`,
      `THE JUDGMENT CARD UPSIDE DOWN says stop judging yourself so harshly today. You'd never speak to a friend the way you speak to you. Ease up!`,
      `THE JUDGMENT CARD UPSIDE DOWN warns against ignoring the call again. You know the change you need to make. Quit dodging it and begin today!`,
    ],
  },
  {
    n: 21,
    id: "the-world",
    name: "The World",
    image: "/tarot-wheel/card_21.png",
    upright: [
      `THE WORLD wants you to spread your vibes all over the planet today. Your goal and mission is simple: leave a positive, lasting fingerprint somewhere. Let your life be heard and felt, no matter how small it may be!`,
      `THE WORLD says a chapter is complete today. Pause and feel proud of how far you've come before you rush to the next thing. You did that!`,
      `THE WORLD reminds you that you belong here. Step fully into your life today, no shrinking. The whole world has room for you!`,
    ],
    reversed: [
      `THE WORLD UPSIDE DOWN CARD indicates turbulence and strife. Your goal today is to let go of anger and pettiness. Let the negative stuff just melt away. It's all small stuff anyway!`,
      `THE WORLD UPSIDE DOWN says you're so close, don't quit before the finish today. One last push completes the circle. See it through!`,
      `THE WORLD UPSIDE DOWN asks what loose end is keeping you stuck. Tie it off today. You can't start the new journey while the old one stays open!`,
    ],
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

  // Each side may hold a single fortune or a list. When it's a list, pick one
  // deterministically for the day (a separate seed), so the same card can
  // deliver a fresh fortune on a later day without ever changing mid-day.
  const pool = reversed
    ? Array.isArray(card.reversed) ? card.reversed : [card.reversed]
    : Array.isArray(card.upright) ? card.upright : [card.upright];
  const fortuneIndex =
    pool.length > 1 ? hashString(`${userId}:${dayKey}:fortune`) % pool.length : 0;

  return {
    card,
    index,
    reversed,
    reading: pool[fortuneIndex],
  };
}
