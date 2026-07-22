/**
 * The prayer that belongs to each altar candle, carried over from the
 * original virtual altar (altar.originalbotanica.com). Each candle has
 * always had its own prayer; lighting the candle speaks it, and the
 * member returns to it each day they charge the flame.
 *
 * Source: virtual-altar-candles-prayers.xlsx (Jason, 7/22/26), verified
 * against the live old site. The Peace and San Deshacedor prayers are
 * new (the old CMS had duplicated other candles' prayers onto them).
 *
 * Spanish versions can be added per-candle as `es` — many of these
 * prayers have traditional Spanish forms the spiritualists should
 * supply. Until then, ES members see the English prayer.
 */

export const CANDLE_PRAYERS: Record<string, { en: string; es?: string }> = {
  "psalm-23": {
    en: "Dear God, I pray for your presence to invade and fill every corner of this home. I thank you that you are always with us and care for us. I pray that we would be able to feel that in our home. I pray our home will be a place of rest and peace because of your presence and that we would desire to grow closer to you, in Jesus name, Amen",
  },
  "adam-eve": {
    en: "Bring back the love that I know and deserve. Let the love return to me stronger than ever. Universe, bring back my love to stay, honest and true.",
  },
  "bayberry": {
    en: "I ask for a sharp sense of understanding, a retentive memory, and the ability to grasp things correctly and fundamentally.",
  },
  "better-business": {
    en: "Business, business, come to me. Fill my cash box to the top. My cash flow multiplies three times three.",
  },
  "bingo": {
    en: "As you lay me down to slumber, all I need is one more number. When to the next game I go, I pray to the Lord I yell “BINGO!”",
  },
  "birthday-blessings": {
    en: "May the Lord bless you on your birthday, and may your day be filled with joy and your year full of many blessings.",
  },
  "black-cat": {
    en: "Lord , I equally repent before you for my family and ancestral sins that have created an in road for the enemy to afflict me with bad luck. O Lord ,have mercy upon us in the Jesus name. I use the token of the blood of Jesus to silence every strange altars in my life and destiny in Jesus mighty name.",
  },
  "black-list": {
    en: "Lord of the universe, creator of all things, bless my home and my body with your light. Protect me from Hell’s awful rings, and turn my wrongs into right.",
  },
  "blockbreaker": {
    en: "Lord, smoothen my path to my success by Your Holy Hand of Fire.",
  },
  "buddha": {
    en: "The energy of lineage teachers gathers like great clouds; The abilities of yidams pour down like rain; The activities of dakinis and protectors ripen like fruit. Good fortune: may the two aims come about naturally",
  },
  "chango-macho": {
    en: "Humbly I pray that you light the way for me to obtain, through toyr secrets and great power as a warrior, fortune and luck in my job, business and gambling so that I can take care of my needs and gain a Joyful soul and peace of mind.",
  },
  "chuparrosa": {
    en: "Dear God, I ask for your help in finding my soul mate. I seek a partner who brings love, joy, peace and prosperity to my life. Who loves, honors and cherishes me completely, and always. May I know love when my true love comes to me. May my life be ready to welcome True love.",
  },
  "come-to-me": {
    en: "Lover come to me now, and finally show yourself to me. Oh, spirit of love I pray now that I attract love to me that desires me as I desire them, equal in our hearts.",
  },
  "condition": {
    en: "Power that turns the tides and night to day, Hear me now, in this moment I pray. From me to them, let the crossing flow, Turn it around, let them reap what they sow. Like a mirror's reflection, pure and true, Send back the intentions, let them view. With balance in mind, let the universe see, What was meant for me, back to thee.",
  },
  "court-case": {
    en: "God of power, please defend me against these ungodly people who are using the law of the land to bind me and break me. Rescue me from these unjust liars! Rescue me from the verdict that intends to trap me, set me free from these accusations and assumptions. Thank You for being my greatest defense. Amen.",
  },
  "domination": {
    en: "[Repeat three times] Have eyes and do not see me, have hands and do not touch me, have a mouth and do not speak to me, have feet and do not reach me, with two I measure them, with three I speak, the blood I owe them and the heart I leave them.",
  },
  "don-dinero": {
    en: "Bless me with the riches of righteousness and the prosperity of faith, so that my treasure will be stored up in heaven.",
  },
  "double-action-heart": {
    en: "Heart of the universe, hear my call, Guide back the love I recall. If our paths are meant to meet once more, Open the door, let love restore. With hope in my heart, I softly plea, Bring back the love that once was with me.",
  },
  "double-action-money": {
    en: "For all the evil that you have done to me, [Name], may all your evil go back to you! May the hurt you have caused me now hurt only YOU! May the pain you have caused me now be a pain unto YOU. May the loss you have caused me to suffer now become a loss to YOU. May the money I lost due to the curses of [Name] now be MINE.",
  },
  "elegua": {
    en: "To You, Lord of the roads, glorious warrior immortal Prince, I raise this humble request. Keep evil away from my home, keep my home safe from evil in my absence, and when I am present, when I am awake, and when I am sleeping, and accept my daily prayer to the Great Olofi asking His eternal blessings for you.",
  },
  "double-action-evil-eye": {
    en: "Guarding Force, strong and true, Send back the harm that's come into view. What was sent to hurt or bind, Return to sender, leave me behind. With clarity and strength, I now say, Send the evil eye the other way. So mote it be.",
  },
  "fast-luck": {
    en: "I invoke thee, Gods of abundance. Draw money and luck towards me. May abundance flow freely in my life. Now and forever.",
  },
  "fast-money": {
    en: "Money, money, come to me fast. Pay my bills, and set me free.",
  },
  "forgive-cleanse": {
    en: "I am strong, supported, and abundant. I am the creator of my entire reality. I am worthy of pursuing my passion and purpose. I am love, I give love, I am open to love. I am in alignment with my truth. I speak with clarity and intention. I am in connection with my spirit and I trust my intuition. I am one with the divine. I honor the divine within and around me.",
  },
  "fruit-of-life": {
    en: "Life's giver, hear our simple plea, Help a new life begin and grow in me. From small dreams to tiny toes, Guide us where the journey goes. With love and hope, we ask so clear, Bless us with a child, bring them near. In life's circle, let our story unfold, With a new chapter of love untold. Amen.",
  },
  "go-away-evil": {
    en: "Dear, God, banish all the forces of evil from me, destroy them, vanish them, so that I can be healthy and do good deeds. Banish from me all spells, witchcraft, black magic, diabolic infestations, oppressions, possessions, and the evil eye. Banish all that is evil and sinful. Amen.",
  },
  "gregorio-hernandez": {
    en: "Dear God, we commit to you those in our families who have fallen sick. We believe that you are our Healer, our Great Physician. May You be the comfort of our family members who are physically in pain right now. Touch them with Your Healing Hands, Lord. Send forth your Word and heal their diseases. Let Your healing power flow through every cell of their bodies. Amen.",
  },
  "guided-spirits": {
    en: "May the Spirits come to me and stand by my side, as they watch over me and protect me day and night. May their love surround me eternally, and let this candle help me send my love back to my guardian angels as a demonstration of my devotion and gratitude.",
  },
  "healthy-ways": {
    en: "Lord, I pray for a strong and vigorous body that can easily do hard work and has a strong resistance against illness. I thank You that as I trust in You, I find new strength, and soar high like an eagle. I will run and not get weary, I will walk and not faint. I thank You that I am Your creation, and You watch over me. Amen.",
  },
  "high-john": {
    en: "High John the Conqueror, have pity on me as I acknowledge my sins and conquer the sins of my enemies. Protect me now and always and do not let my enemies sit in a chair nor lie in a bed, nor have a moment of tranquility until they come defeated to my feet.",
  },
  "indian-house-blessing": {
    en: "All negativity, be gone. Only good may enter here. I invite peace, love, light, and prosperity. Only good things may enter and dwell with me. By the power of the Divine, Bless and protect me and mine. No evil thing may enter here, This space remains bright and clear.",
  },
  "indian-tobacco": {
    en: "O, great Indian spirit waarrior, stop all evil in its tracks. Guide me through the darkness and into the light of love and peace.",
  },
  "jinx-removing": {
    en: "Oh Mighty Shango, in the name of God and the Holy Spirit, protect me from all eveil influences and evil thoughts and intentions of my enemies. There will be no need to retreat because you will be with me and you will help me in all of my needs. Shango, my guide and protector, grant me protection.",
  },
  "just-judge": {
    en: "Most Holy Judge, Son of Saint Mary. Do not let my body be harmed or my blood be spilled. Let not my enemies see me nor their armies hurt me. With the robe that covered our Lord Jesus Christ, cover my body so that I will not be attacked by my enemies. By the belssings of the Father, the Sone, and teh Holy Spirit, bring me peace and happiness. Amen.",
  },
  "law-stay-away": {
    en: "God shields (say name). The police cannot come anywhere near him/her. God shields (say name) from the police, law, and legal problems. They cannot come anywhere near him/her and Archangel Michael protects (say name) from every direction.",
  },
  "lords-prayer": {
    en: "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
  },
  "lotto": {
    en: "I seek Your guidance, Lord, and Your holy, almighty blessings as I am looking to win the lottery. I know it is You who has placed this wish in my heart, and so I will follow Your word, Father. I have bought the lottery ticket and played the numbers you have given to me. I know it is You, Father, who is guiding me.",
  },
  "love-drawing": {
    en: "I pray that I will find love where I least expect it. And I also pray to God that when I find it, you will give me the grace to recognize it, even if it is among millions, and the strength to enjoy my true love.",
  },
  "love-spice": {
    en: "May our union bring pleasure and happiness to us both. May the ties that bind us strengthen our love and ignite our passion.",
  },
  "lucky-7-11": {
    en: "Divine Source of Chance and Luck, Bless this candle, let fortune be unstuck. 7 and 11, guide my play, In games of chance, light my way. As the wax melts, barriers fade, May my paths be brightly laid. Grant me joy, and moments so fine, With gratitude, let victory be mine. So mote it be.",
  },
  "money-drawing": {
    en: "Money come, money grow, make my money flow, and never stop.",
  },
  "ochosi": {
    en: "Ochosi, guide of pathways clear, I seek your help, bring me near. In this land where I wish to stay, Clear obstacles, light my way. For home and heart, I humbly plea, Stand by me in this journey. Help with papers, laws, and doors, Grant me peace on foreign shores.",
  },
  "open-road": {
    en: "By the elements gathered before me, Open my road, set me free. Lend your strength and power to me, As I will it, it must be.",
  },
  "peace": {
    en: "Dear God, let peace come and let it stay. Quiet my mind, soften my heart, and still every storm within me and around me. As this candle burns, let calm settle over me and everyone I love, and let me carry that peace into every room I enter.",
  },
  "peace-in-the-home": {
    en: "Lord Jesus, my Savior, sustain this home, Lord. Bless it and keep it, so that all members of this household may come to know the grace You have given us through Christ, our Lord. In Your almighty name, I pray. Amen.",
  },
  "remember-honor": {
    en: "Eternal rest, grant unto them, O Lord, and let perpetual light shine upon them. May the souls of the faithful departed through the mercy of God rest in peace. Amen.",
  },
  "remove-obstacles": {
    en: "God, I want to lose weight. I have been in a cycle for so many years being in the body I do not want to be in, so I need You. I come to You because You can aid me in my journey toward health, for you are the God of health and restoration. Guide me and help me to follow You, please! Amen.",
  },
  "reversible": {
    en: "I break every curse that is set upon me and my family. I declare Satan has no hold over me now through curses or occult practices, through sacrifices or any ritual of any kind. Through the cleansing blood of Jesus Christ, I have been set free and I remain free.",
  },
  "ruda": {
    en: "You owe me cash, you owe me money, now hurry up and pay me. This justice I deserve.",
  },
  "run-devil-run": {
    en: "I banish all negative influence from my home. I will not allow it to wreak havoc within the hearts minds and spirit of those who live here.",
  },
  "saint-clare": {
    en: "Loving God, each day as I step further into my future, give me the courage, knowledge and patience that I need. Remind me that you always journey with me and that you will never lead me into anything that you won't lead me through. I readily accept the healing power in my life. Amen.",
  },
  "saint-alex": {
    en: "Oh, my glorious Saint Alex, you who have the power to take away all evil that surrounds the Lord, I ask you to take my enemies far awat form me. Put me so far form those evil ones that tyey will never see me. Take away all those who have evil thoughts and that wish harm to me. Bring me closer to the Lord so that in His Divine Grace I willl be covered with goodness.",
  },
  "san-deshacedor": {
    en: "San Deshacedor, holy undoer of harm, unbind me from all that was set against me. Untie every knot, undo every evil work, and sweep its traces from my path. Leave me clean, free, and standing in the light God intended for me.",
  },
  "saint-lazarus": {
    en: "Oh Blessed and glorious Saint Lazarus, I call on you with the same grace and faith that Jesus called to you at the door of your tomb, form which you exited after being buried for four consecutive days, without any sign of impurity or imperfection. Oh, Holy Spirit I call upon you with the same faith that God had in you to consider and grant what I ask for in this prayer.",
  },
  "saint-michael": {
    en: "Saint Michael the Archangel, defend us in battle against all that is evil, and be our protector against the wickedness and snares of the devil. Through your power and strength, I ask you to cast into hell, satan and alll evil spirits, who roam the world seeking the ruin of souls.",
  },
  "steady-work": {
    en: "With these flames, I light my path to the perfect job for me.",
  },
  "success": {
    en: "A good job awaits me I know, for thine brilliant light scans and searches a place for me. A good job awaits me, for thine goodness is great. My faith in thee is complete. A good job waits for me",
  },
  "uncrossing": {
    en: "Lord, be with me and cleanse my home. Break all hexes and remove all crossed conditions. Thank you, Lord, for your help in removing this evil, and for filliing my home with Your blessings. Amen.",
  },
  "unlock-my-path": {
    en: "Heavenly Father, I open my heart wide to receive your love today. Please send Your healing power into my life to help me overcome the obstacles I face. I readily accept the healing power my life.",
  },
  "white-candle": {
    en: "Dear God I ask for peace of mind. I pray that I am calm, collected and tranquil at all times in my life. I rest and relax in your presence. I let go of all anxious thoughts. I stop rushing and start praying. I let go and I let God. Amen.",
  },
};

export function candlePrayer(
  slug: string,
  locale: "en" | "es" = "en",
): string | null {
  const p = CANDLE_PRAYERS[slug];
  if (!p) return null;
  return (locale === "es" && p.es) || p.en;
}
