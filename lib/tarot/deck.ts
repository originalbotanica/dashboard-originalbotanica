/**
 * The tarot deck — 78 cards, written in the voice of the house.
 *
 * This powers the daily card on the member dashboard. The reading and the
 * question for each card are authored here (no LLM, no database), so the
 * card renders instantly, costs nothing per view, and reads in Original
 * Botanica's voice: grounded, warm, reverent without solemn. Upright only.
 * We do not deal in fear. A hard card is named honestly and met with
 * practice, not dread.
 *
 * The daily draw is deterministic. Everyone in the house sees the same card
 * on a given day, the way everyone of a Sun sign shares the day's horoscope.
 * The card turns at midnight in New York, so "today" tracks the botanica's
 * hours, not UTC.
 *
 * When the interactive wheel comes online later, it can draw from this same
 * deck. One source of truth for the cards.
 */

export type Arcana = "major" | "minor";
export type Suit = "wands" | "cups" | "swords" | "pentacles";

export type TarotCard = {
  /** Stable slug, e.g. "the-star", "three-of-cups". */
  id: string;
  /** Display name, e.g. "The Star", "Three of Cups". */
  name: string;
  arcana: Arcana;
  /** Only on minor arcana. */
  suit?: Suit;
  /** Roman numeral for majors (0 shown as "0"); rank label for minors. */
  numeral: string;
  /** One to three words. The card in a breath. */
  essence: string;
  /** The reading. Two to three short sentences, house voice, upright. */
  reading: string;
  /** A reflection to carry through the day. Not a forecast. */
  question: string;
};

/** What each suit governs. Used for the small line under the card name. */
export const SUIT_ELEMENT: Record<Suit, string> = {
  wands: "Fire. Will, drive, the work of the hands.",
  cups: "Water. Feeling, love, the life of the heart.",
  swords: "Air. Mind, truth, the things we must name.",
  pentacles: "Earth. Body, home, money, the daily ground.",
};

export const DECK: TarotCard[] = [
  // ── Major Arcana ──────────────────────────────────────────────────────
  {
    id: "the-fool",
    name: "The Fool",
    arcana: "major",
    numeral: "0",
    essence: "Beginnings. Trust.",
    reading:
      "A door stands open and you do not yet know the room. The Fool steps anyway, light in the bag, faith in the foot. Today rewards the honest beginning over the perfect plan.",
    question: "Where are you waiting to feel ready before you begin?",
  },
  {
    id: "the-magician",
    name: "The Magician",
    arcana: "major",
    numeral: "I",
    essence: "Will. Focus.",
    reading:
      "Everything you need is already on the table. The Magician does not wish. He gathers what is in front of him and sets it to work. Name the intention out loud and the day will hand you the tools.",
    question: "What would you do today if you trusted that you had enough?",
  },
  {
    id: "the-high-priestess",
    name: "The High Priestess",
    arcana: "major",
    numeral: "II",
    essence: "Intuition. Stillness.",
    reading:
      "Some things are known before they are explained. The High Priestess keeps her counsel and listens past the noise. Trust the quiet read you got before the reasons arrived.",
    question: "What does the still part of you already know?",
  },
  {
    id: "the-empress",
    name: "The Empress",
    arcana: "major",
    numeral: "III",
    essence: "Abundance. Care.",
    reading:
      "Growth does not hurry and it does not apologize. The Empress tends what is hers and lets it ripen. Today asks you to nourish something, including yourself.",
    question: "What in your life is asking to be fed, not fixed?",
  },
  {
    id: "the-emperor",
    name: "The Emperor",
    arcana: "major",
    numeral: "IV",
    essence: "Structure. Order.",
    reading:
      "Freedom is built on good walls. The Emperor brings the boundary, the schedule, the word kept. Today, one firm decision settles ten anxious ones.",
    question: "Where would a clear boundary bring you peace?",
  },
  {
    id: "the-hierophant",
    name: "The Hierophant",
    arcana: "major",
    numeral: "V",
    essence: "Tradition. Teaching.",
    reading:
      "The old ways earned their keep. The Hierophant points to the lineage, the elder, the ritual that worked long before us. Today, learn from someone who walked the road first.",
    question: "Whose wisdom have you been too proud or too busy to ask for?",
  },
  {
    id: "the-lovers",
    name: "The Lovers",
    arcana: "major",
    numeral: "VI",
    essence: "Union. Choice.",
    reading:
      "Love is also a decision, made again each morning. The Lovers stand at a fork where the heart and the values must agree. Choose the thing you could stand behind out loud.",
    question: "What choice today would honor both your heart and your values?",
  },
  {
    id: "the-chariot",
    name: "The Chariot",
    arcana: "major",
    numeral: "VII",
    essence: "Drive. Resolve.",
    reading:
      "Two horses pull in different directions and still the rider keeps the road. The Chariot is will held steady under pressure. Today moves when you stop negotiating with yourself.",
    question: "What deserves your full effort, undivided, today?",
  },
  {
    id: "strength",
    name: "Strength",
    arcana: "major",
    numeral: "VIII",
    essence: "Courage. Gentleness.",
    reading:
      "The lion is not beaten. It is befriended. Strength is the soft hand that does not flinch. Meet the hard thing today with patience instead of force.",
    question: "Where would gentleness be braver than force?",
  },
  {
    id: "the-hermit",
    name: "The Hermit",
    arcana: "major",
    numeral: "IX",
    essence: "Solitude. Search.",
    reading:
      "He carries his own light and walks apart on purpose. The Hermit knows some answers only come in silence. Give yourself one hour today with no one else in the room.",
    question: "What would you hear if you turned the noise all the way down?",
  },
  {
    id: "wheel-of-fortune",
    name: "Wheel of Fortune",
    arcana: "major",
    numeral: "X",
    essence: "Cycles. Turning.",
    reading:
      "The wheel turns for everyone, up and down in its time. What feels stuck is already moving. Meet the change with open hands instead of a tight grip.",
    question: "What are you holding too tightly while the season changes?",
  },
  {
    id: "justice",
    name: "Justice",
    arcana: "major",
    numeral: "XI",
    essence: "Truth. Balance.",
    reading:
      "The scale does not care for our excuses. Justice asks for the honest account and the fair share. Today, tell the truth plainly and let it set the weight.",
    question: "Where is it time to be honest, with someone or with yourself?",
  },
  {
    id: "the-hanged-man",
    name: "The Hanged Man",
    arcana: "major",
    numeral: "XII",
    essence: "Surrender. New view.",
    reading:
      "He hangs by choice and sees the world turned over. The Hanged Man trades control for a new angle. The thing you cannot push today may move when you stop pushing.",
    question: "What might you see if you let yourself stop forcing it?",
  },
  {
    id: "death",
    name: "Death",
    arcana: "major",
    numeral: "XIII",
    essence: "Endings. Renewal.",
    reading:
      "Death rarely means the body. It means the chapter that has already closed in your chest. Let the dead thing be dead so the new one has room to root.",
    question: "What ending have you been refusing to call by its name?",
  },
  {
    id: "temperance",
    name: "Temperance",
    arcana: "major",
    numeral: "XIV",
    essence: "Balance. Patience.",
    reading:
      "The angel pours water between two cups and loses not a drop. Temperance is the steady middle, the right measure, the slow blend. Today asks for patience over extremes.",
    question: "Where are you reaching for all or nothing when a little would do?",
  },
  {
    id: "the-devil",
    name: "The Devil",
    arcana: "major",
    numeral: "XV",
    essence: "Attachment. Honesty.",
    reading:
      "The chains in the picture are loose enough to slip. The Devil is the habit, the fear, the bargain that no longer serves you. Name what holds you and half its power is gone.",
    question: "What hold on your life have you stopped questioning?",
  },
  {
    id: "the-tower",
    name: "The Tower",
    arcana: "major",
    numeral: "XVI",
    essence: "Sudden change. Clearing.",
    reading:
      "What is built on a crack comes down so something true can stand. The Tower clears the ground without asking. Let what falls today fall, and tend to yourself in the dust.",
    question: "What in your life was already cracked before today shook it?",
  },
  {
    id: "the-star",
    name: "The Star",
    arcana: "major",
    numeral: "XVII",
    essence: "Hope. Healing.",
    reading:
      "After the hard night, the water is still cool and the sky is still wide. The Star is quiet hope and the slow return of faith. Pour something back into yourself today.",
    question: "Where is hope returning, even faintly, and how can you feed it?",
  },
  {
    id: "the-moon",
    name: "The Moon",
    arcana: "major",
    numeral: "XVIII",
    essence: "Mystery. The unseen.",
    reading:
      "The path runs through fog and the mind invents shapes in it. The Moon asks you to feel your way and not to trust every fear. Walk slow. Not everything in the dark is a threat.",
    question: "Which of today's fears is real, and which is the fog talking?",
  },
  {
    id: "the-sun",
    name: "The Sun",
    arcana: "major",
    numeral: "XIX",
    essence: "Joy. Clarity.",
    reading:
      "The Sun warms without conditions and asks nothing in return. This is plain joy, clear sight, the day that wants to be lived in the open. Let yourself be glad without earning it first.",
    question: "What simple thing could you let yourself enjoy today?",
  },
  {
    id: "judgement",
    name: "Judgement",
    arcana: "major",
    numeral: "XX",
    essence: "Awakening. Reckoning.",
    reading:
      "The trumpet sounds and the old self rises to answer for itself. Judgement is the honest look back and the call forward. Forgive what needs forgiving and step into who you are becoming.",
    question: "What are you being called to rise toward now?",
  },
  {
    id: "the-world",
    name: "The World",
    arcana: "major",
    numeral: "XXI",
    essence: "Completion. Wholeness.",
    reading:
      "The circle closes and the dancer stands at the center, whole. The World is the long work finished and the threshold of the next. Honor the thing you completed before you rush to the next.",
    question: "What deserves to be celebrated as finished before you move on?",
  },

  // ── Wands (Fire) ──────────────────────────────────────────────────────
  {
    id: "ace-of-wands",
    name: "Ace of Wands",
    arcana: "minor",
    suit: "wands",
    numeral: "Ace",
    essence: "Spark. Beginning.",
    reading:
      "A hand offers a single branch already greening. The Ace of Wands is the first spark of a new fire, an idea that warms the hands. Act on the impulse before the doubt talks you out of it.",
    question: "What new fire is asking you to pick it up today?",
  },
  {
    id: "two-of-wands",
    name: "Two of Wands",
    arcana: "minor",
    suit: "wands",
    numeral: "Two",
    essence: "Planning. Reach.",
    reading:
      "He holds the world small in his hand and looks past the wall he built. The Two of Wands is the moment after the spark, when you choose how far to aim. Decide the direction before you spend the energy.",
    question: "What would you reach for if the wall were not in the way?",
  },
  {
    id: "three-of-wands",
    name: "Three of Wands",
    arcana: "minor",
    suit: "wands",
    numeral: "Three",
    essence: "Expansion. Patience.",
    reading:
      "The ships are out and the work now is to wait well. The Three of Wands is the patience after the launch, eyes on the horizon. Trust what you set in motion to come back to you.",
    question: "What have you started that now needs your trust more than your hands?",
  },
  {
    id: "four-of-wands",
    name: "Four of Wands",
    arcana: "minor",
    suit: "wands",
    numeral: "Four",
    essence: "Celebration. Home.",
    reading:
      "Four staves hold up a canopy of flowers and the people gather under it. The Four of Wands is the harvest shared, the home that holds. Mark the good with your people today.",
    question: "Who would you want beside you when the good arrives?",
  },
  {
    id: "five-of-wands",
    name: "Five of Wands",
    arcana: "minor",
    suit: "wands",
    numeral: "Five",
    essence: "Friction. Practice.",
    reading:
      "Five raise their staves and it looks like a fight but it is also a scrimmage. The Five of Wands is friction that sharpens, not destroys. Let today's tension teach you instead of rattle you.",
    question: "Where could conflict today be turned into practice?",
  },
  {
    id: "six-of-wands",
    name: "Six of Wands",
    arcana: "minor",
    suit: "wands",
    numeral: "Six",
    essence: "Victory. Recognition.",
    reading:
      "The rider returns crowned and the crowd walks with him. The Six of Wands is earned recognition, the win seen by others. Accept the praise today without shrinking from it.",
    question: "What good work of yours deserves to be acknowledged, by you first?",
  },
  {
    id: "seven-of-wands",
    name: "Seven of Wands",
    arcana: "minor",
    suit: "wands",
    numeral: "Seven",
    essence: "Defense. Conviction.",
    reading:
      "He holds the high ground against many and does not yield it. The Seven of Wands is standing for what is yours under pressure. Today, hold your position with calm, not heat.",
    question: "What is worth standing your ground for right now?",
  },
  {
    id: "eight-of-wands",
    name: "Eight of Wands",
    arcana: "minor",
    suit: "wands",
    numeral: "Eight",
    essence: "Speed. Motion.",
    reading:
      "Eight staves fly straight and fast toward the ground. The Eight of Wands is swift movement, news, the thing that finally lands. Move with it today instead of bracing against it.",
    question: "Where is momentum on your side if you simply let it carry you?",
  },
  {
    id: "nine-of-wands",
    name: "Nine of Wands",
    arcana: "minor",
    suit: "wands",
    numeral: "Nine",
    essence: "Resilience. Guard.",
    reading:
      "Bandaged and tired, he still stands the watch. The Nine of Wands is the strength that is left when the easy strength is spent. You are closer to the end than the weariness admits.",
    question: "What would help you rest without abandoning the watch?",
  },
  {
    id: "ten-of-wands",
    name: "Ten of Wands",
    arcana: "minor",
    suit: "wands",
    numeral: "Ten",
    essence: "Burden. Release.",
    reading:
      "He carries all ten and can barely see the road. The Ten of Wands is the load taken on past what one back should hold. Set something down today. Not everything is yours to carry.",
    question: "What could you put down or hand off without the world ending?",
  },
  {
    id: "page-of-wands",
    name: "Page of Wands",
    arcana: "minor",
    suit: "wands",
    numeral: "Page",
    essence: "Curiosity. Spark.",
    reading:
      "The Page reads his staff like it might bloom in his hands. He is the eager learner, the one who tries the new thing for the joy of it. Follow a curiosity today with no need for it to pay off.",
    question: "What would you explore today purely because it interests you?",
  },
  {
    id: "knight-of-wands",
    name: "Knight of Wands",
    arcana: "minor",
    suit: "wands",
    numeral: "Knight",
    essence: "Action. Daring.",
    reading:
      "The Knight rides hot and fast and asks questions later. He is bold action, charm, and the courage that does not wait for permission. Channel the fire today, and aim it before you ride.",
    question: "Where is your boldness needed, and where would it need a rein?",
  },
  {
    id: "queen-of-wands",
    name: "Queen of Wands",
    arcana: "minor",
    suit: "wands",
    numeral: "Queen",
    essence: "Warmth. Confidence.",
    reading:
      "She holds the sunflower and the black cat both, warm and unafraid. The Queen of Wands is magnetism rooted in self-knowledge. Lead today with warmth that does not ask to be liked.",
    question: "What would change if you trusted your own fire today?",
  },
  {
    id: "king-of-wands",
    name: "King of Wands",
    arcana: "minor",
    suit: "wands",
    numeral: "King",
    essence: "Vision. Leadership.",
    reading:
      "The King has turned the spark into a kingdom and still keeps the flame. He is vision made durable, the leader who sees far and acts clear. Set the long aim today and move the first stone toward it.",
    question: "What long vision deserves one concrete step from you today?",
  },

  // ── Cups (Water) ──────────────────────────────────────────────────────
  {
    id: "ace-of-cups",
    name: "Ace of Cups",
    arcana: "minor",
    suit: "cups",
    numeral: "Ace",
    essence: "Open heart. Love.",
    reading:
      "The cup overflows before anyone has earned it. The Ace of Cups is love offered, the heart willing to open again. Let yourself receive today, not only give.",
    question: "Where is your heart ready to open, if you let it?",
  },
  {
    id: "two-of-cups",
    name: "Two of Cups",
    arcana: "minor",
    suit: "cups",
    numeral: "Two",
    essence: "Union. Connection.",
    reading:
      "Two raise their cups and meet as equals. The Two of Cups is the true meeting, the bond freely made. Tend a connection today with full attention, not half of it.",
    question: "Which relationship would grow if you brought your whole self to it?",
  },
  {
    id: "three-of-cups",
    name: "Three of Cups",
    arcana: "minor",
    suit: "cups",
    numeral: "Three",
    essence: "Community. Joy.",
    reading:
      "Three lift their cups together in the harvest. The Three of Cups is friendship, celebration, the gladness of being among your own. Reach for your people today. Joy shared is joy doubled.",
    question: "Who have you been meaning to call back into your circle?",
  },
  {
    id: "four-of-cups",
    name: "Four of Cups",
    arcana: "minor",
    suit: "cups",
    numeral: "Four",
    essence: "Apathy. Reawakening.",
    reading:
      "Three cups stand ignored while he broods over what is missing. A fourth is offered and he has not yet looked up. The Four of Cups asks you to notice the good already at your hand.",
    question: "What gift in front of you have you stopped seeing?",
  },
  {
    id: "five-of-cups",
    name: "Five of Cups",
    arcana: "minor",
    suit: "cups",
    numeral: "Five",
    essence: "Grief. What remains.",
    reading:
      "Three cups are spilled and he mourns them. Two still stand behind him, full, unseen. The Five of Cups honors the loss and then asks you to turn around.",
    question: "What still stands behind the thing you are grieving?",
  },
  {
    id: "six-of-cups",
    name: "Six of Cups",
    arcana: "minor",
    suit: "cups",
    numeral: "Six",
    essence: "Memory. Tenderness.",
    reading:
      "A child offers another a cup of flowers in a remembered yard. The Six of Cups is sweetness from the past, innocence, the kindness we learned early. Let a good memory soften you today.",
    question: "What from your past still nourishes you when you let it?",
  },
  {
    id: "seven-of-cups",
    name: "Seven of Cups",
    arcana: "minor",
    suit: "cups",
    numeral: "Seven",
    essence: "Choices. Clarity.",
    reading:
      "Seven cups float in the air, each holding a different dream. The Seven of Cups is the dazzle of too many options. Pick one and make it real before the others fade.",
    question: "Which of your many wants is the one you would actually build?",
  },
  {
    id: "eight-of-cups",
    name: "Eight of Cups",
    arcana: "minor",
    suit: "cups",
    numeral: "Eight",
    essence: "Departure. Seeking.",
    reading:
      "He leaves the eight full cups behind and walks toward the hills. The Eight of Cups is the brave decision to seek something the present cannot give. It is allowed to outgrow a good-enough thing.",
    question: "What have you outgrown that it is time to walk away from?",
  },
  {
    id: "nine-of-cups",
    name: "Nine of Cups",
    arcana: "minor",
    suit: "cups",
    numeral: "Nine",
    essence: "Contentment. Wish.",
    reading:
      "He sits satisfied before his row of cups, the wish granted. The Nine of Cups is emotional fullness, the simple pleasure of enough. Let yourself feel content today without waiting for more.",
    question: "What would it feel like to call what you have enough?",
  },
  {
    id: "ten-of-cups",
    name: "Ten of Cups",
    arcana: "minor",
    suit: "cups",
    numeral: "Ten",
    essence: "Harmony. Belonging.",
    reading:
      "The rainbow arcs over the home and the family beneath it. The Ten of Cups is lasting peace, love that holds across a household. Tend the bonds that make a place feel like home.",
    question: "What makes a place feel like home to you, and is it tended?",
  },
  {
    id: "page-of-cups",
    name: "Page of Cups",
    arcana: "minor",
    suit: "cups",
    numeral: "Page",
    essence: "Wonder. Openness.",
    reading:
      "A fish rises from the Page's cup and he greets it without surprise. He is wonder, the open heart, the message that comes in feeling. Stay open today to the gentle and the strange.",
    question: "What is your intuition trying to tell you in a soft voice?",
  },
  {
    id: "knight-of-cups",
    name: "Knight of Cups",
    arcana: "minor",
    suit: "cups",
    numeral: "Knight",
    essence: "Romance. Ideals.",
    reading:
      "The Knight rides slow with the cup held like an offering. He is the romantic, the one who follows the heart and the beautiful. Lead with feeling today, and let it have a little ground.",
    question: "Where is your heart asking you to follow it, gently?",
  },
  {
    id: "queen-of-cups",
    name: "Queen of Cups",
    arcana: "minor",
    suit: "cups",
    numeral: "Queen",
    essence: "Compassion. Depth.",
    reading:
      "She gazes into the ornate cup and feels what others miss. The Queen of Cups is deep compassion held with strong banks. Care for someone today, and keep enough care for yourself.",
    question: "Who needs your compassion today, and do you count yourself among them?",
  },
  {
    id: "king-of-cups",
    name: "King of Cups",
    arcana: "minor",
    suit: "cups",
    numeral: "King",
    essence: "Calm. Mastery.",
    reading:
      "He sits steady on a throne in a moving sea. The King of Cups is feeling fully felt and still governed. Stay calm at the center today while the water moves around you.",
    question: "Where can you feel deeply and still keep your footing?",
  },

  // ── Swords (Air) ──────────────────────────────────────────────────────
  {
    id: "ace-of-swords",
    name: "Ace of Swords",
    arcana: "minor",
    suit: "swords",
    numeral: "Ace",
    essence: "Clarity. Truth.",
    reading:
      "A single blade rises crowned, cutting clean through the fog. The Ace of Swords is the breakthrough thought, the truth finally clear. Name the thing plainly today and let it cut.",
    question: "What truth, said plainly, would clear the air?",
  },
  {
    id: "two-of-swords",
    name: "Two of Swords",
    arcana: "minor",
    suit: "swords",
    numeral: "Two",
    essence: "Stalemate. Choice.",
    reading:
      "Blindfolded, she holds two blades in balance and will not move. The Two of Swords is the decision avoided, the truce that cannot last. Take off the blindfold today and look.",
    question: "What decision have you been refusing to actually look at?",
  },
  {
    id: "three-of-swords",
    name: "Three of Swords",
    arcana: "minor",
    suit: "swords",
    numeral: "Three",
    essence: "Heartache. Release.",
    reading:
      "Three blades cross a heart in the rain. The Three of Swords names the hurt without pretending it away. Let the grief be real today, and let the rain do its washing.",
    question: "What pain would loosen its grip if you let yourself feel it fully?",
  },
  {
    id: "four-of-swords",
    name: "Four of Swords",
    arcana: "minor",
    suit: "swords",
    numeral: "Four",
    essence: "Rest. Recovery.",
    reading:
      "The knight lies still in the chapel, recovering, not defeated. The Four of Swords is the rest that is part of the work. Give yourself real stillness today. The fight will keep.",
    question: "Where do you need to rest before you can think clearly again?",
  },
  {
    id: "five-of-swords",
    name: "Five of Swords",
    arcana: "minor",
    suit: "swords",
    numeral: "Five",
    essence: "Conflict. Cost.",
    reading:
      "He gathers the swords while the others walk away. The Five of Swords is the win that costs more than it gives. Today, ask whether being right is worth the ground it loses.",
    question: "Is this a battle worth what winning it would cost you?",
  },
  {
    id: "six-of-swords",
    name: "Six of Swords",
    arcana: "minor",
    suit: "swords",
    numeral: "Six",
    essence: "Transition. Calmer water.",
    reading:
      "The boat moves from rough water toward the still shore. The Six of Swords is the passage out of the hard place, slow and quiet. You do not have to stay where the water churns.",
    question: "What calmer shore are you ready to move toward?",
  },
  {
    id: "seven-of-swords",
    name: "Seven of Swords",
    arcana: "minor",
    suit: "swords",
    numeral: "Seven",
    essence: "Strategy. Honesty.",
    reading:
      "He slips away with the swords, clever and alone. The Seven of Swords asks where you are cutting corners or carrying things in secret. Choose the straight path today, even when the sly one looks easier.",
    question: "Where are you being less than straight, with others or yourself?",
  },
  {
    id: "eight-of-swords",
    name: "Eight of Swords",
    arcana: "minor",
    suit: "swords",
    numeral: "Eight",
    essence: "Self-bind. Freedom.",
    reading:
      "Bound and blindfolded, she stands among swords with a clear gap to walk through. The Eight of Swords is the trap that is mostly in the mind. Test the ropes today. They are looser than they feel.",
    question: "What cage have you assumed is locked without checking the door?",
  },
  {
    id: "nine-of-swords",
    name: "Nine of Swords",
    arcana: "minor",
    suit: "swords",
    numeral: "Nine",
    essence: "Worry. Dawn.",
    reading:
      "She sits up in the dark, the night's fears loud around the bed. The Nine of Swords is the worry that grows huge after midnight. In daylight, most of it shrinks. Say the fear out loud and measure it.",
    question: "Which of last night's fears can stand the light of day?",
  },
  {
    id: "ten-of-swords",
    name: "Ten of Swords",
    arcana: "minor",
    suit: "swords",
    numeral: "Ten",
    essence: "Bottom. Sunrise.",
    reading:
      "He lies under all ten blades and the sun rises behind the hills regardless. The Ten of Swords is the end of a hard road. It cannot get worse from here, and that is its mercy. The only way left is up.",
    question: "What is finally over, freeing you to begin again?",
  },
  {
    id: "page-of-swords",
    name: "Page of Swords",
    arcana: "minor",
    suit: "swords",
    numeral: "Page",
    essence: "Curiosity. Vigilance.",
    reading:
      "The Page holds his blade up and watches the wind for news. He is the sharp question, the restless mind that wants to know. Ask the honest question today, even if it ruffles things.",
    question: "What question have you been afraid to ask out loud?",
  },
  {
    id: "knight-of-swords",
    name: "Knight of Swords",
    arcana: "minor",
    suit: "swords",
    numeral: "Knight",
    essence: "Drive. Directness.",
    reading:
      "The Knight charges into the wind, all speed and conviction. He is the fast mind and the blunt word, powerful and easy to overshoot. Move decisively today, but aim before you swing.",
    question: "Where is decisiveness needed, and where would you cut too fast?",
  },
  {
    id: "queen-of-swords",
    name: "Queen of Swords",
    arcana: "minor",
    suit: "swords",
    numeral: "Queen",
    essence: "Clarity. Boundaries.",
    reading:
      "She holds the blade upright and sees through pretense without cruelty. The Queen of Swords is clear sight earned through experience. Speak the clean truth today, kindly and without apology.",
    question: "Where would honest, kind clarity serve better than silence?",
  },
  {
    id: "king-of-swords",
    name: "King of Swords",
    arcana: "minor",
    suit: "swords",
    numeral: "King",
    essence: "Judgment. Principle.",
    reading:
      "He sits with the blade straight and rules by principle, not mood. The King of Swords is the fair mind, the decision made on the merits. Think it through today and let reason lead the heart, not silence it.",
    question: "What decision needs your clearest, most principled thinking today?",
  },

  // ── Pentacles (Earth) ─────────────────────────────────────────────────
  {
    id: "ace-of-pentacles",
    name: "Ace of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    numeral: "Ace",
    essence: "Opportunity. Root.",
    reading:
      "A hand offers a single coin over a green and blooming garden. The Ace of Pentacles is a real opportunity with ground under it. Take the practical first step today and plant it.",
    question: "What solid opportunity is asking for one practical step?",
  },
  {
    id: "two-of-pentacles",
    name: "Two of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    numeral: "Two",
    essence: "Balance. Juggle.",
    reading:
      "He dances while keeping two coins moving in a figure eight. The Two of Pentacles is the art of holding more than one thing without dropping either. Move with the demands today instead of bracing against them.",
    question: "What are you balancing, and where do you need to let the rhythm carry it?",
  },
  {
    id: "three-of-pentacles",
    name: "Three of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    numeral: "Three",
    essence: "Craft. Collaboration.",
    reading:
      "The mason works while two others plan the cathedral with him. The Three of Pentacles is skilled work done together, each role honored. Build with others today and let your craft be seen.",
    question: "Whose skill should you be drawing on, or offering, today?",
  },
  {
    id: "four-of-pentacles",
    name: "Four of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    numeral: "Four",
    essence: "Holding. Loosening.",
    reading:
      "He clutches his coins close and lets nothing move. The Four of Pentacles is security held so tight it stops the flow. Loosen the grip a little today. What circulates grows.",
    question: "Where is holding on costing you more than letting go would?",
  },
  {
    id: "five-of-pentacles",
    name: "Five of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    numeral: "Five",
    essence: "Hardship. Help nearby.",
    reading:
      "Two pass cold beneath a lit church window they have not looked up to see. The Five of Pentacles is hard times, and the help that is closer than it feels. Today, let yourself ask. The door is warmer than the street.",
    question: "What help is near that your pride has kept you from reaching for?",
  },
  {
    id: "six-of-pentacles",
    name: "Six of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    numeral: "Six",
    essence: "Giving. Receiving.",
    reading:
      "He weighs the scale and shares what he has with open hands. The Six of Pentacles is the fair flow of giving and receiving. Give where you can today, and let yourself receive where you cannot.",
    question: "Are you letting yourself receive, or only ever giving?",
  },
  {
    id: "seven-of-pentacles",
    name: "Seven of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    numeral: "Seven",
    essence: "Patience. Tending.",
    reading:
      "He leans on the hoe and looks at the vine he has grown. The Seven of Pentacles is the pause to assess slow work before more of it. Tend what you planted today and trust the harvest is coming.",
    question: "What long effort is quietly ripening, even if you cannot see it yet?",
  },
  {
    id: "eight-of-pentacles",
    name: "Eight of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    numeral: "Eight",
    essence: "Mastery. Diligence.",
    reading:
      "He carves coin after coin, each one better than the last. The Eight of Pentacles is devotion to the craft, the patient repetition that makes a master. Give today's task your real attention.",
    question: "What skill would reward you for practicing it well today?",
  },
  {
    id: "nine-of-pentacles",
    name: "Nine of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    numeral: "Nine",
    essence: "Independence. Enjoyment.",
    reading:
      "She stands alone in her garden, well earned, at ease with herself. The Nine of Pentacles is the comfort and freedom that come from your own labor. Enjoy the fruit of your work today without guilt.",
    question: "What have you built that you can simply enjoy right now?",
  },
  {
    id: "ten-of-pentacles",
    name: "Ten of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    numeral: "Ten",
    essence: "Legacy. Family.",
    reading:
      "Three generations stand in the courtyard with the dogs and the old gate. The Ten of Pentacles is lasting wealth, the kind measured in family and roots. Tend what you are building to outlast you.",
    question: "What are you building that you want to pass on?",
  },
  {
    id: "page-of-pentacles",
    name: "Page of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    numeral: "Page",
    essence: "Study. Promise.",
    reading:
      "The Page studies a single coin as if reading a future in it. He is the student, the apprentice, the practical dream just begun. Start learning the thing today instead of only admiring it.",
    question: "What have you wanted to learn that you could begin in earnest today?",
  },
  {
    id: "knight-of-pentacles",
    name: "Knight of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    numeral: "Knight",
    essence: "Steadiness. Reliability.",
    reading:
      "The Knight sits still on his horse at the edge of the plowed field. He is the steady worker, the one who finishes what he starts without flash. Do the unglamorous, reliable thing today. It compounds.",
    question: "What steady, unglamorous work would pay off if you simply did it?",
  },
  {
    id: "queen-of-pentacles",
    name: "Queen of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    numeral: "Queen",
    essence: "Nurture. Resourcefulness.",
    reading:
      "She sits in a garden with the coin in her lap and the rabbit at her feet. The Queen of Pentacles makes a home of what she has and shares its warmth. Care for the practical needs today, yours and your people's.",
    question: "What practical care, given today, would make someone feel held?",
  },
  {
    id: "king-of-pentacles",
    name: "King of Pentacles",
    arcana: "minor",
    suit: "pentacles",
    numeral: "King",
    essence: "Abundance. Stewardship.",
    reading:
      "He sits among the vines, the kingdom prosperous and well kept. The King of Pentacles is wealth made stable through steady stewardship. Manage what is yours today with a calm and generous hand.",
    question: "How can you steward what you have with both wisdom and generosity?",
  },
];

if (DECK.length !== 78) {
  // Guard against an accidental edit dropping or duplicating a card.
  throw new Error(`Tarot deck must hold 78 cards. Found ${DECK.length}.`);
}

/**
 * Public path to a card's image. The 78 Rider-Waite-Smith images (public
 * domain) live in /public/tarot, named by card id. Populate them with
 * scripts/fetch-tarot-images.mjs.
 */
export function tarotImagePath(card: TarotCard): string {
  return `/tarot/${card.id}.jpg`;
}

/**
 * The botanica's day key, e.g. "2026-06-03". New York time, so the card
 * turns at local midnight to match the horoscope and the store's hours.
 */
export function botanicaDayKey(now: Date = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

/**
 * Whole days since the Unix epoch for a given YYYY-MM-DD key. Stable index
 * for the deterministic draw, independent of the machine's timezone.
 */
function dayNumber(dayKey: string): number {
  const [y, m, d] = dayKey.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

/**
 * The card for a given day, shared by the whole house. Deterministic: the
 * same date always yields the same card. A prime stride walks the whole deck
 * before repeating, so consecutive days do not sit next to each other in the
 * list. Used for logged-out views and anywhere a single communal card fits.
 */
export function drawDailyCard(dayKey: string = botanicaDayKey()): TarotCard {
  const index = (dayNumber(dayKey) * 31) % DECK.length;
  return DECK[index];
}

/**
 * A stable 32-bit hash (FNV-1a) of a string. Deterministic across machines
 * and runs, so a given input always lands on the same number. Used to seed a
 * per-member draw without storing anything.
 */
function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * The card for a specific member on a given day. Deterministic per member:
 * the same person on the same date always draws the same card, so it holds
 * steady through the day, but two members usually draw different cards. The
 * card turns over for them at New York midnight. No storage, no API; the
 * member id plus the date is the whole seed.
 */
export function drawDailyCardForUser(
  userId: string,
  dayKey: string = botanicaDayKey(),
): TarotCard {
  const index = hashString(`${userId}:${dayKey}`) % DECK.length;
  return DECK[index];
}
