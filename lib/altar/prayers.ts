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
 * Spanish versions: traditional/canonical Spanish forms are used where
 * they exist (Padre Nuestro, San Miguel Arcángel, Justo Juez, the
 * eternal-rest prayer, the Domination conjuro — which is originally a
 * Spanish prayer); the rest are faithful translations. The in-house
 * spiritualists should review the set.
 */

export const CANDLE_PRAYERS: Record<string, { en: string; es?: string }> = {
  "psalm-23": {
    en: "Dear God, I pray for your presence to invade and fill every corner of this home. I thank you that you are always with us and care for us. I pray that we would be able to feel that in our home. I pray our home will be a place of rest and peace because of your presence and that we would desire to grow closer to you, in Jesus name, Amen",
    es: "Querido Dios, pido que tu presencia invada y llene cada rincón de este hogar. Te doy gracias porque siempre estás con nosotros y nos cuidas. Pido que podamos sentirlo en nuestro hogar. Pido que nuestro hogar sea un lugar de descanso y de paz por tu presencia, y que deseemos acercarnos más a ti. En el nombre de Jesús, amén.",
  },
  "adam-eve": {
    en: "Bring back the love that I know and deserve. Let the love return to me stronger than ever. Universe, bring back my love to stay, honest and true.",
    es: "Devuélveme el amor que conozco y que merezco. Que el amor regrese a mí más fuerte que nunca. Universo, devuélveme a mi amor para quedarse, honesto y verdadero.",
  },
  "bayberry": {
    en: "I ask for a sharp sense of understanding, a retentive memory, and the ability to grasp things correctly and fundamentally.",
    es: "Pido un entendimiento agudo, una memoria firme y la capacidad de comprender las cosas correctamente y a fondo.",
  },
  "better-business": {
    en: "Business, business, come to me. Fill my cash box to the top. My cash flow multiplies three times three.",
    es: "Negocio, negocio, ven a mí. Llena mi caja hasta el tope. Mi dinero se multiplica tres veces tres.",
  },
  "bingo": {
    en: "As you lay me down to slumber, all I need is one more number. When to the next game I go, I pray to the Lord I yell “BINGO!”",
    es: "Al acostarme a dormir, solo me falta un número. Cuando vaya al próximo juego, le pido al Señor gritar «¡BINGO!».",
  },
  "birthday-blessings": {
    en: "May the Lord bless you on your birthday, and may your day be filled with joy and your year full of many blessings.",
    es: "Que el Señor te bendiga en tu cumpleaños; que tu día se llene de alegría y tu año de muchas bendiciones.",
  },
  "black-cat": {
    en: "Lord , I equally repent before you for my family and ancestral sins that have created an in road for the enemy to afflict me with bad luck. O Lord ,have mercy upon us in the Jesus name. I use the token of the blood of Jesus to silence every strange altars in my life and destiny in Jesus mighty name.",
    es: "Señor, me arrepiento ante ti por los pecados de mi familia y de mis antepasados que abrieron camino al enemigo para afligirme con la mala suerte. Señor, ten misericordia de nosotros en el nombre de Jesús. Con la sangre de Jesús silencio todo altar extraño en mi vida y en mi destino, en su nombre poderoso.",
  },
  "black-list": {
    en: "Lord of the universe, creator of all things, bless my home and my body with your light. Protect me from Hell’s awful rings, and turn my wrongs into right.",
    es: "Señor del universo, creador de todas las cosas, bendice mi hogar y mi cuerpo con tu luz. Protégeme de los terribles círculos del infierno y convierte mis males en bien.",
  },
  "blockbreaker": {
    en: "Lord, smoothen my path to my success by Your Holy Hand of Fire.",
    es: "Señor, allana mi camino hacia el éxito con tu Santa Mano de Fuego.",
  },
  "buddha": {
    en: "The energy of lineage teachers gathers like great clouds; The abilities of yidams pour down like rain; The activities of dakinis and protectors ripen like fruit. Good fortune: may the two aims come about naturally",
    es: "La energía de los maestros del linaje se reúne como grandes nubes; las bendiciones de los yidams descienden como lluvia; las actividades de las dakinis y los protectores maduran como fruto. Buena fortuna: que los dos propósitos se cumplan por sí mismos.",
  },
  "chango-macho": {
    en: "Humbly I pray that you light the way for me to obtain, through toyr secrets and great power as a warrior, fortune and luck in my job, business and gambling so that I can take care of my needs and gain a Joyful soul and peace of mind.",
    es: "Humildemente te pido que ilumines mi camino para alcanzar, por tus secretos y tu gran poder de guerrero, fortuna y suerte en mi trabajo, mis negocios y el juego, para cubrir mis necesidades y ganar un alma alegre y paz en mi mente.",
  },
  "chuparrosa": {
    en: "Dear God, I ask for your help in finding my soul mate. I seek a partner who brings love, joy, peace and prosperity to my life. Who loves, honors and cherishes me completely, and always. May I know love when my true love comes to me. May my life be ready to welcome True love.",
    es: "Querido Dios, te pido ayuda para encontrar a mi alma gemela. Busco una pareja que traiga amor, alegría, paz y prosperidad a mi vida; que me ame, me honre y me valore por completo, y para siempre. Que sepa reconocer el amor cuando mi verdadero amor llegue a mí. Que mi vida esté lista para recibir el amor verdadero.",
  },
  "come-to-me": {
    en: "Lover come to me now, and finally show yourself to me. Oh, spirit of love I pray now that I attract love to me that desires me as I desire them, equal in our hearts.",
    es: "Amor, ven a mí ahora y muéstrate al fin ante mí. Oh espíritu del amor, pido atraer hacia mí un amor que me desee como yo lo deseo, iguales en el corazón.",
  },
  "condition": {
    en: "Power that turns the tides and night to day, Hear me now, in this moment I pray. From me to them, let the crossing flow, Turn it around, let them reap what they sow. Like a mirror's reflection, pure and true, Send back the intentions, let them view. With balance in mind, let the universe see, What was meant for me, back to thee.",
    es: "Poder que vuelve las mareas y hace del día la noche, escúchame ahora, en este momento te ruego. De mí hacia ellos fluya el cruce; dale la vuelta, que cosechen lo que sembraron. Como el reflejo de un espejo, puro y fiel, devuélveles sus intenciones, que las vean. Con equilibrio, que el universo vea: lo que era para mí, vuelva a mí.",
  },
  "court-case": {
    en: "God of power, please defend me against these ungodly people who are using the law of the land to bind me and break me. Rescue me from these unjust liars! Rescue me from the verdict that intends to trap me, set me free from these accusations and assumptions. Thank You for being my greatest defense. Amen.",
    es: "Dios de poder, defiéndeme de esta gente impía que usa la ley de esta tierra para atarme y quebrarme. ¡Rescátame de estos mentirosos injustos! Rescátame del veredicto que quiere atraparme; líbrame de estas acusaciones y suposiciones. Gracias por ser mi mayor defensa. Amén.",
  },
  "domination": {
    en: "[Repeat three times] Have eyes and do not see me, have hands and do not touch me, have a mouth and do not speak to me, have feet and do not reach me, with two I measure them, with three I speak, the blood I owe them and the heart I leave them.",
    es: "[Repite tres veces] Ojos tengan y no me vean, manos tengan y no me toquen, boca tengan y no me hablen, pies tengan y no me alcancen; con dos los mido, con tres les hablo, la sangre les debo y el corazón les dejo.",
  },
  "don-dinero": {
    en: "Bless me with the riches of righteousness and the prosperity of faith, so that my treasure will be stored up in heaven.",
    es: "Bendíceme con las riquezas de la rectitud y la prosperidad de la fe, para que mi tesoro se guarde en el cielo.",
  },
  "double-action-heart": {
    en: "Heart of the universe, hear my call, Guide back the love I recall. If our paths are meant to meet once more, Open the door, let love restore. With hope in my heart, I softly plea, Bring back the love that once was with me.",
    es: "Corazón del universo, escucha mi llamado: guía de regreso el amor que recuerdo. Si nuestros caminos deben cruzarse otra vez, abre la puerta y deja que el amor se restaure. Con esperanza en el corazón, te lo pido suavemente: devuélveme el amor que un día estuvo conmigo.",
  },
  "double-action-money": {
    en: "For all the evil that you have done to me, [Name], may all your evil go back to you! May the hurt you have caused me now hurt only YOU! May the pain you have caused me now be a pain unto YOU. May the loss you have caused me to suffer now become a loss to YOU. May the money I lost due to the curses of [Name] now be MINE.",
    es: "Por todo el mal que me has hecho, [nombre], ¡que todo tu mal vuelva a ti! Que el daño que me causaste ahora te duela solo a TI. Que el dolor que me causaste sea ahora dolor para TI. Que la pérdida que me hiciste sufrir sea ahora pérdida para TI. Que el dinero que perdí por las maldiciones de [nombre] ahora sea MÍO.",
  },
  "elegua": {
    en: "To You, Lord of the roads, glorious warrior immortal Prince, I raise this humble request. Keep evil away from my home, keep my home safe from evil in my absence, and when I am present, when I am awake, and when I am sleeping, and accept my daily prayer to the Great Olofi asking His eternal blessings for you.",
    es: "A Ti, Dueño de los caminos, glorioso guerrero y Príncipe inmortal, elevo esta humilde petición: aparta el mal de mi casa; guarda mi hogar del mal en mi ausencia, cuando estoy presente, cuando estoy despierto y cuando duermo; y acepta mi oración diaria al Gran Olofi pidiendo sus bendiciones eternas para ti.",
  },
  "double-action-evil-eye": {
    en: "Guarding Force, strong and true, Send back the harm that's come into view. What was sent to hurt or bind, Return to sender, leave me behind. With clarity and strength, I now say, Send the evil eye the other way. So mote it be.",
    es: "Fuerza guardiana, firme y verdadera, devuelve el daño que ha llegado a mi vista. Lo que fue enviado para herir o atar, regrese a quien lo envió y me deje atrás. Con claridad y fuerza declaro: que el mal de ojo tome el otro camino. Que así sea.",
  },
  "fast-luck": {
    en: "I invoke thee, Gods of abundance. Draw money and luck towards me. May abundance flow freely in my life. Now and forever.",
    es: "Los invoco, dioses de la abundancia. Atraigan hacia mí el dinero y la suerte. Que la abundancia fluya libre en mi vida, ahora y siempre.",
  },
  "fast-money": {
    en: "Money, money, come to me fast. Pay my bills, and set me free.",
    es: "Dinero, dinero, ven a mí pronto. Paga mis cuentas y déjame libre.",
  },
  "forgive-cleanse": {
    en: "I am strong, supported, and abundant. I am the creator of my entire reality. I am worthy of pursuing my passion and purpose. I am love, I give love, I am open to love. I am in alignment with my truth. I speak with clarity and intention. I am in connection with my spirit and I trust my intuition. I am one with the divine. I honor the divine within and around me.",
    es: "Soy fuerte, tengo apoyo y vivo en abundancia. Soy el creador de toda mi realidad. Soy digno de seguir mi pasión y mi propósito. Soy amor, doy amor, estoy abierto al amor. Estoy alineado con mi verdad. Hablo con claridad e intención. Estoy en conexión con mi espíritu y confío en mi intuición. Soy uno con lo divino. Honro lo divino dentro y alrededor de mí.",
  },
  "fruit-of-life": {
    en: "Life's giver, hear our simple plea, Help a new life begin and grow in me. From small dreams to tiny toes, Guide us where the journey goes. With love and hope, we ask so clear, Bless us with a child, bring them near. In life's circle, let our story unfold, With a new chapter of love untold. Amen.",
    es: "Dador de la vida, escucha nuestra sencilla súplica: ayuda a que una nueva vida comience y crezca en mí. De los sueños pequeños a los deditos de los pies, guíanos por donde vaya el camino. Con amor y esperanza te lo pedimos: bendícenos con un hijo, acércalo a nosotros. En el círculo de la vida, que nuestra historia se abra con un nuevo capítulo de amor por contar. Amén.",
  },
  "go-away-evil": {
    en: "Dear, God, banish all the forces of evil from me, destroy them, vanish them, so that I can be healthy and do good deeds. Banish from me all spells, witchcraft, black magic, diabolic infestations, oppressions, possessions, and the evil eye. Banish all that is evil and sinful. Amen.",
    es: "Querido Dios, destierra de mí todas las fuerzas del mal; destrúyelas, desvanécelas, para que pueda estar sano y hacer buenas obras. Aparta de mí todo hechizo, brujería, magia negra, infestación diabólica, opresión, posesión y mal de ojo. Destierra todo lo malo y pecaminoso. Amén.",
  },
  "gregorio-hernandez": {
    en: "Dear God, we commit to you those in our families who have fallen sick. We believe that you are our Healer, our Great Physician. May You be the comfort of our family members who are physically in pain right now. Touch them with Your Healing Hands, Lord. Send forth your Word and heal their diseases. Let Your healing power flow through every cell of their bodies. Amen.",
    es: "Querido Dios, te encomendamos a los enfermos de nuestras familias. Creemos que Tú eres nuestro Sanador, nuestro Gran Médico. Sé el consuelo de nuestros familiares que hoy sufren dolor. Tócalos con tus manos sanadoras, Señor. Envía tu Palabra y sana sus enfermedades. Que tu poder sanador corra por cada célula de sus cuerpos. Amén.",
  },
  "guided-spirits": {
    en: "May the Spirits come to me and stand by my side, as they watch over me and protect me day and night. May their love surround me eternally, and let this candle help me send my love back to my guardian angels as a demonstration of my devotion and gratitude.",
    es: "Que los espíritus vengan a mí y estén a mi lado, velando por mí y protegiéndome de día y de noche. Que su amor me rodee eternamente, y que esta vela me ayude a devolver mi amor a mis ángeles guardianes como muestra de mi devoción y gratitud.",
  },
  "healthy-ways": {
    en: "Lord, I pray for a strong and vigorous body that can easily do hard work and has a strong resistance against illness. I thank You that as I trust in You, I find new strength, and soar high like an eagle. I will run and not get weary, I will walk and not faint. I thank You that I am Your creation, and You watch over me. Amen.",
    es: "Señor, te pido un cuerpo fuerte y vigoroso, capaz de trabajar duro y de resistir la enfermedad. Te doy gracias porque, al confiar en Ti, hallo nuevas fuerzas y me elevo como el águila: correré sin cansarme, caminaré sin desmayar. Te doy gracias porque soy tu creación y Tú velas por mí. Amén.",
  },
  "high-john": {
    en: "High John the Conqueror, have pity on me as I acknowledge my sins and conquer the sins of my enemies. Protect me now and always and do not let my enemies sit in a chair nor lie in a bed, nor have a moment of tranquility until they come defeated to my feet.",
    es: "Juan el Conquistador, ten piedad de mí: reconozco mis pecados y venzo los pecados de mis enemigos. Protégeme ahora y siempre, y no dejes que mis enemigos se sienten en silla ni se acuesten en cama, ni tengan un momento de tranquilidad, hasta que lleguen vencidos a mis pies.",
  },
  "indian-house-blessing": {
    en: "All negativity, be gone. Only good may enter here. I invite peace, love, light, and prosperity. Only good things may enter and dwell with me. By the power of the Divine, Bless and protect me and mine. No evil thing may enter here, This space remains bright and clear.",
    es: "Toda negatividad, fuera. Aquí solo puede entrar el bien. Invito la paz, el amor, la luz y la prosperidad. Solo lo bueno puede entrar y habitar conmigo. Por el poder de lo Divino, bendíceme y protégeme, a mí y a los míos. Nada malo puede entrar aquí: este espacio permanece claro y luminoso.",
  },
  "indian-tobacco": {
    en: "O, great Indian spirit waarrior, stop all evil in its tracks. Guide me through the darkness and into the light of love and peace.",
    es: "Oh gran espíritu guerrero, detén todo mal en su camino. Guíame a través de la oscuridad hacia la luz del amor y de la paz.",
  },
  "jinx-removing": {
    en: "Oh Mighty Shango, in the name of God and the Holy Spirit, protect me from all eveil influences and evil thoughts and intentions of my enemies. There will be no need to retreat because you will be with me and you will help me in all of my needs. Shango, my guide and protector, grant me protection.",
    es: "Oh poderoso Shangó, en el nombre de Dios y del Espíritu Santo, protégeme de toda mala influencia y de los malos pensamientos e intenciones de mis enemigos. No habrá necesidad de retroceder, porque estarás conmigo y me ayudarás en todas mis necesidades. Shangó, mi guía y protector, concédeme tu protección.",
  },
  "just-judge": {
    en: "Most Holy Judge, Son of Saint Mary. Do not let my body be harmed or my blood be spilled. Let not my enemies see me nor their armies hurt me. With the robe that covered our Lord Jesus Christ, cover my body so that I will not be attacked by my enemies. By the belssings of the Father, the Sone, and teh Holy Spirit, bring me peace and happiness. Amen.",
    es: "Santísimo Justo Juez, Hijo de Santa María: que mi cuerpo no sea herido ni mi sangre derramada. Que mis enemigos no me vean ni sus ejércitos me hagan daño. Con el manto que cubrió a Nuestro Señor Jesucristo, cubre mi cuerpo para que no sea atacado por mis enemigos. Por la bendición del Padre, del Hijo y del Espíritu Santo, tráeme paz y felicidad. Amén.",
  },
  "law-stay-away": {
    en: "God shields (say name). The police cannot come anywhere near him/her. God shields (say name) from the police, law, and legal problems. They cannot come anywhere near him/her and Archangel Michael protects (say name) from every direction.",
    es: "Dios protege a (di el nombre). La policía no puede acercársele. Dios lo protege de la policía, de la ley y de los problemas legales. No pueden acercársele, y el Arcángel Miguel lo protege por todas direcciones.",
  },
  "lords-prayer": {
    en: "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
    es: "Padre nuestro, que estás en el cielo, santificado sea tu nombre; venga a nosotros tu reino; hágase tu voluntad en la tierra como en el cielo. Danos hoy nuestro pan de cada día; perdona nuestras ofensas, como también nosotros perdonamos a los que nos ofenden; no nos dejes caer en la tentación, y líbranos del mal. Amén.",
  },
  "lotto": {
    en: "I seek Your guidance, Lord, and Your holy, almighty blessings as I am looking to win the lottery. I know it is You who has placed this wish in my heart, and so I will follow Your word, Father. I have bought the lottery ticket and played the numbers you have given to me. I know it is You, Father, who is guiding me.",
    es: "Busco tu guía, Señor, y tu santa y todopoderosa bendición, pues deseo ganar la lotería. Sé que fuiste Tú quien puso este deseo en mi corazón, y por eso seguiré tu palabra, Padre. He comprado el boleto y he jugado los números que me diste. Sé que eres Tú, Padre, quien me guía.",
  },
  "love-drawing": {
    en: "I pray that I will find love where I least expect it. And I also pray to God that when I find it, you will give me the grace to recognize it, even if it is among millions, and the strength to enjoy my true love.",
    es: "Pido encontrar el amor donde menos lo espere. Y también le pido a Dios que, cuando lo encuentre, me dé la gracia de reconocerlo, aunque esté entre millones, y la fuerza para disfrutar de mi verdadero amor.",
  },
  "love-spice": {
    en: "May our union bring pleasure and happiness to us both. May the ties that bind us strengthen our love and ignite our passion.",
    es: "Que nuestra unión nos traiga placer y felicidad a los dos. Que los lazos que nos unen fortalezcan nuestro amor y enciendan nuestra pasión.",
  },
  "lucky-7-11": {
    en: "Divine Source of Chance and Luck, Bless this candle, let fortune be unstuck. 7 and 11, guide my play, In games of chance, light my way. As the wax melts, barriers fade, May my paths be brightly laid. Grant me joy, and moments so fine, With gratitude, let victory be mine. So mote it be.",
    es: "Fuente Divina del azar y la suerte, bendice esta vela y libera la fortuna. 7 y 11, guíen mi jugada; en los juegos de azar, iluminen mi camino. Mientras la cera se derrite, caen las barreras; que mis caminos queden bien trazados. Concédeme alegría y momentos felices; con gratitud, que la victoria sea mía. Que así sea.",
  },
  "money-drawing": {
    en: "Money come, money grow, make my money flow, and never stop.",
    es: "Dinero ven, dinero crece; haz que mi dinero fluya y nunca se detenga.",
  },
  "ochosi": {
    en: "Ochosi, guide of pathways clear, I seek your help, bring me near. In this land where I wish to stay, Clear obstacles, light my way. For home and heart, I humbly plea, Stand by me in this journey. Help with papers, laws, and doors, Grant me peace on foreign shores.",
    es: "Ochosi, guía de los caminos claros, busco tu ayuda, acércame. En esta tierra donde deseo quedarme, despeja los obstáculos y alumbra mi camino. Por mi hogar y mi corazón te lo ruego humildemente: acompáñame en esta travesía. Ayúdame con papeles, leyes y puertas; concédeme paz en tierra extranjera.",
  },
  "open-road": {
    en: "By the elements gathered before me, Open my road, set me free. Lend your strength and power to me, As I will it, it must be.",
    es: "Por los elementos reunidos ante mí, abre mi camino y déjame libre. Préstame tu fuerza y tu poder; como lo deseo, así ha de ser.",
  },
  "peace": {
    en: "Dear God, let peace come and let it stay. Quiet my mind, soften my heart, and still every storm within me and around me. As this candle burns, let calm settle over me and everyone I love, and let me carry that peace into every room I enter.",
    es: "Querido Dios, que la paz llegue y se quede. Aquieta mi mente, ablanda mi corazón y calma toda tormenta dentro y alrededor de mí. Mientras esta vela arde, que la calma me cubra a mí y a todos los que amo, y que yo lleve esa paz a cada lugar donde entre.",
  },
  "peace-in-the-home": {
    en: "Lord Jesus, my Savior, sustain this home, Lord. Bless it and keep it, so that all members of this household may come to know the grace You have given us through Christ, our Lord. In Your almighty name, I pray. Amen.",
    es: "Señor Jesús, mi Salvador, sostén este hogar. Bendícelo y guárdalo, para que todos los que viven en esta casa conozcan la gracia que nos diste por Cristo, nuestro Señor. En tu nombre todopoderoso te lo pido. Amén.",
  },
  "remember-honor": {
    en: "Eternal rest, grant unto them, O Lord, and let perpetual light shine upon them. May the souls of the faithful departed through the mercy of God rest in peace. Amen.",
    es: "Dales, Señor, el descanso eterno, y brille para ellos la luz perpetua. Que las almas de los fieles difuntos, por la misericordia de Dios, descansen en paz. Amén.",
  },
  "remove-obstacles": {
    en: "God, I want to lose weight. I have been in a cycle for so many years being in the body I do not want to be in, so I need You. I come to You because You can aid me in my journey toward health, for you are the God of health and restoration. Guide me and help me to follow You, please! Amen.",
    es: "Dios, quiero bajar de peso. Llevo muchos años atrapado en un cuerpo en el que no quiero estar, y por eso te necesito. Vengo a Ti porque Tú puedes ayudarme en mi camino hacia la salud, pues eres el Dios de la salud y la restauración. ¡Guíame y ayúdame a seguirte, por favor! Amén.",
  },
  "reversible": {
    en: "I break every curse that is set upon me and my family. I declare Satan has no hold over me now through curses or occult practices, through sacrifices or any ritual of any kind. Through the cleansing blood of Jesus Christ, I have been set free and I remain free.",
    es: "Rompo toda maldición lanzada sobre mí y sobre mi familia. Declaro que Satanás no tiene poder sobre mí por maldiciones ni prácticas ocultas, por sacrificios ni ritual alguno. Por la sangre purificadora de Jesucristo he sido liberado, y libre permanezco.",
  },
  "ruda": {
    en: "You owe me cash, you owe me money, now hurry up and pay me. This justice I deserve.",
    es: "Me debes plata, me debes dinero; apúrate y págame. Esta justicia la merezco.",
  },
  "run-devil-run": {
    en: "I banish all negative influence from my home. I will not allow it to wreak havoc within the hearts minds and spirit of those who live here.",
    es: "Destierro de mi hogar toda influencia negativa. No permitiré que cause estragos en el corazón, la mente y el espíritu de quienes viven aquí.",
  },
  "saint-clare": {
    en: "Loving God, each day as I step further into my future, give me the courage, knowledge and patience that I need. Remind me that you always journey with me and that you will never lead me into anything that you won't lead me through. I readily accept the healing power in my life. Amen.",
    es: "Dios amoroso, cada día que doy un paso más hacia mi futuro, dame el valor, el conocimiento y la paciencia que necesito. Recuérdame que siempre caminas conmigo y que nunca me llevarás a nada que no me ayudes a atravesar. Acepto con gusto tu poder sanador en mi vida. Amén.",
  },
  "saint-alex": {
    en: "Oh, my glorious Saint Alex, you who have the power to take away all evil that surrounds the Lord, I ask you to take my enemies far awat form me. Put me so far form those evil ones that tyey will never see me. Take away all those who have evil thoughts and that wish harm to me. Bring me closer to the Lord so that in His Divine Grace I willl be covered with goodness.",
    es: "Oh glorioso San Alejo, tú que tienes el poder de alejar todo mal, te pido que apartes a mis enemigos lejos de mí. Ponme tan lejos de los malvados que nunca me vean. Aleja a todos los que tienen malos pensamientos y me desean daño. Acércame al Señor para que, en su Divina Gracia, quede cubierto de bondad.",
  },
  "san-deshacedor": {
    en: "San Deshacedor, holy undoer of harm, unbind me from all that was set against me. Untie every knot, undo every evil work, and sweep its traces from my path. Leave me clean, free, and standing in the light God intended for me.",
    es: "San Deshacedor, santo que deshace el daño, desátame de todo lo que fue puesto en mi contra. Desata cada nudo, deshaz cada mal trabajo y barre sus huellas de mi camino. Déjame limpio, libre y de pie en la luz que Dios quiso para mí.",
  },
  "saint-lazarus": {
    en: "Oh Blessed and glorious Saint Lazarus, I call on you with the same grace and faith that Jesus called to you at the door of your tomb, form which you exited after being buried for four consecutive days, without any sign of impurity or imperfection. Oh, Holy Spirit I call upon you with the same faith that God had in you to consider and grant what I ask for in this prayer.",
    es: "Oh bendito y glorioso San Lázaro, te llamo con la misma gracia y fe con que Jesús te llamó a la puerta de tu sepulcro, del que saliste tras cuatro días sepultado, sin señal alguna de impureza o imperfección. Oh santo espíritu, te invoco con la misma fe que Dios tuvo en ti, para que consideres y concedas lo que pido en esta oración.",
  },
  "saint-michael": {
    en: "Saint Michael the Archangel, defend us in battle against all that is evil, and be our protector against the wickedness and snares of the devil. Through your power and strength, I ask you to cast into hell, satan and alll evil spirits, who roam the world seeking the ruin of souls.",
    es: "San Miguel Arcángel, defiéndenos en la batalla contra todo lo malo; sé nuestro amparo contra la perversidad y las asechanzas del demonio. Por tu poder y tu fuerza, te pido que arrojes al infierno a Satanás y a todos los espíritus malignos que vagan por el mundo buscando la perdición de las almas.",
  },
  "steady-work": {
    en: "With these flames, I light my path to the perfect job for me.",
    es: "Con estas llamas alumbro mi camino hacia el trabajo perfecto para mí.",
  },
  "success": {
    en: "A good job awaits me I know, for thine brilliant light scans and searches a place for me. A good job awaits me, for thine goodness is great. My faith in thee is complete. A good job waits for me",
    es: "Un buen trabajo me espera, lo sé, porque tu luz brillante busca y explora un lugar para mí. Un buen trabajo me espera, porque tu bondad es grande. Mi fe en ti es completa. Un buen trabajo me espera.",
  },
  "uncrossing": {
    en: "Lord, be with me and cleanse my home. Break all hexes and remove all crossed conditions. Thank you, Lord, for your help in removing this evil, and for filliing my home with Your blessings. Amen.",
    es: "Señor, acompáñame y limpia mi hogar. Rompe todo hechizo y quita toda salación. Gracias, Señor, por ayudarme a apartar este mal y por llenar mi casa de tus bendiciones. Amén.",
  },
  "unlock-my-path": {
    en: "Heavenly Father, I open my heart wide to receive your love today. Please send Your healing power into my life to help me overcome the obstacles I face. I readily accept the healing power my life.",
    es: "Padre Celestial, abro mi corazón de par en par para recibir hoy tu amor. Envía tu poder sanador a mi vida para ayudarme a vencer los obstáculos que enfrento. Acepto con gusto tu poder sanador en mi vida.",
  },
  "white-candle": {
    en: "Dear God I ask for peace of mind. I pray that I am calm, collected and tranquil at all times in my life. I rest and relax in your presence. I let go of all anxious thoughts. I stop rushing and start praying. I let go and I let God. Amen.",
    es: "Querido Dios, te pido paz mental. Pido estar en calma, sereno y tranquilo en todo momento de mi vida. Descanso y reposo en tu presencia. Suelto todo pensamiento ansioso. Dejo de correr y empiezo a orar. Suelto, y dejo actuar a Dios. Amén.",
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
