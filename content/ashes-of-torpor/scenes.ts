import type { Chronicle } from '../../src/engine/story';

// ─────────────────────────────────────────────────────────────────────────────
// ASHES OF TORPOR  —  Chronicle 1
// Tutorial chronicle. Vienna, present night.
// PC wakes from torpor at Hunger 4, amnesiac, sealed in a Habsburg cellar.
//
// Flags written by this chronicle:
//   sung_phrase_heard       — true at start
//   sigil_seen              — true at caretaker_talk
//   first_feed_clean        — mutually exclusive feed outcomes
//   first_feed_breach_minor
//   first_feed_breach_major
//   first_feed_killed
//   wall_violent            — PC used force/frenzy to exit
//   caretaker_helped        — ghoul trusts the PC; has_lead also set
//   caretaker_alienated     — ghoul hostile or dominated
//   has_lead                — PC knows the Josefstadt safehouse address
//   masquerade_broken       — at least one public breach occurred
//   hunter_identified       — watcher's nature confirmed
//   archivist_contacted     — PC met Gregor at all (enables den option)
//   haven_vienna_opera      — mutually exclusive resting places
//   haven_vienna_safehouse
//   haven_vienna_archivist
//   memory_seal_broken      — true at dawn; triggers Chronicle 2
// ─────────────────────────────────────────────────────────────────────────────

export const AshesOfTorpor: Chronicle = {
  id: 'ashes-of-torpor',
  title: 'Ashes of Torpor',
  subtitle: 'The night you wake up wrong',
  setting: 'Vienna, Austria — present night',
  era: 'modern',
  starting_hunger: 4,

  acts: {
    1: 'Torpor\'s End',
    2: 'First Hunger',
    3: 'The City Above',
  },

  npcs: {
    felix: {
      clan: 'none',
      role: 'Ghoul caretaker — watchman of the cellar network beneath the Staatsoper',
      disposition: 'frightened, loyal to whoever sealed the PC in',
      agenda: 'Keep the peace. Not get killed. Possibly warn his employer.',
      secrets: [
        'He sealed the wall himself, three weeks ago, following written instructions left in the service tunnel.',
        'He recognises the sigil on the PC\'s palm — has seen it on correspondence sent to someone called "the Choirmaster."',
        'The safehouse in Josefstadt is his fallback location.',
      ],
    },
    gregor: {
      clan: 'Nosferatu',
      role: 'Information broker — the Archivist of Vienna\'s Rack',
      disposition: 'professionally neutral, privately fascinated',
      agenda: 'Collect information. Extend his network. Never give anything away for free.',
      secrets: [
        'He knows who the PC was before torpor — or claims to.',
        'The haven he is offering belongs to a vampire who has not returned from the East.',
        'He has seen the sigil before. He will not volunteer this.',
      ],
    },
  },

  endings: {
    dawn_survived: {
      type: 'good_end',
      title: 'One Night Survived',
      text: "The resting place seals around you and the city goes quiet.\n\nYou fed. You moved. You did not die. For a vampire waking from torpor into a city that doesn't know your name, that is enough.\n\nAs consciousness fades, something surfaces — not a memory but the sensation of one. Olive trees. A feast-day procession. The smell of incense thick enough to taste. The sigil on your palm warms once, briefly.\n\nThen sleep takes you, and the warmth does not fade.",
    },
    dawn_troubled: {
      type: 'bad_end',
      title: 'What You Left Behind',
      text: "You find your rest before the sun finds you. Barely.\n\nSomewhere in the city, someone is having a difficult conversation about what they saw tonight. You don't know where. You don't know how far the damage runs. You won't know until you wake.\n\nAs you slip under, a single image: olive trees, a procession, the smoke of incense. Ancient. The sigil on your palm burns with it.\n\nYou wake to consequences. You wake regardless.",
    },
    dawn_perfect: {
      type: 'perfect_end',
      title: 'Clean Work',
      text: "The resting place seals. Vienna hums above you, oblivious.\n\nYou fed without witnesses. You moved without trace. Everyone who saw you tonight is either a willing participant or doesn't know what they saw. The Masquerade holds. Whatever put you in that cellar is still out there — but tonight, you gave it nothing to work with.\n\nIn the last moment before sleep: olive trees in full sun, a procession in a language you almost recognise, the weight of incense in the air. The sigil on your palm pulses once — warm, certain, like something remembering you.\n\nYou surface into the next night a little less lost.",
    },
  },

  scenes: {

    // ═════════════════════════════════════════════════════════════════════════
    // ACT 1 — TORPOR'S END
    // ═════════════════════════════════════════════════════════════════════════

    start: {
      act: 1,
      title: 'Torpor\'s End',
      narrative: "Darkness first. Then weight — stone above, stone beside, stone below.\n\nThen copper. The taste arrives before the rest of you does: cold, sharp, absolute. The blood in your mouth is old and it is yours and it is not enough.\n\nA phrase rises before anything else — before your name, before the year, before why. *A spiritu maligno, libera nos.* From the evil spirit, deliver us. Latin. Liturgical. You have no idea where it came from.\n\nAbove you, muffled through metres of stone and plaster: strings. An orchestra, live, mechanical with discipline. You are beneath something that is still performing.",
      flags_set: ['sung_phrase_heard'],
      next: 'the_wall',
    },

    the_wall: {
      act: 1,
      title: 'New Mortar',
      narrative: "You find it by touch. One wall of the cellar is different — the mortar soft at the joints, the smell of it fresh. Weeks old, not centuries. Someone sealed this space deliberately and recently.\n\nThe left-hand wall has a gap where iron pipes run: a maintenance seam, barely shoulder-wide.\n\nYour left palm burns. You look at it in the dark and see nothing — but you feel the shape of something scored into the skin. A mark. You don't remember it being there.",
      compulsion_note: "The Beast doesn't want to think about who or why. It wants out. The anger of a sealed room is simple and clean compared to the weight of not knowing.",
      clan_notes: {
        Nosferatu: "You smell the mason. Male, nervous, non-smoker. He was here seventy-two hours ago. He worked fast — someone was paying him to.",
        Tremere: "There is a ward on the new wall. Faint, amateur, already fraying. Someone wanted to keep you under longer than the stone alone would manage.",
        Gangrel: "The earth under the stone remembers older configurations. You feel load-bearing walls, pipe runs, the shape of the tunnels above. You know where the gaps are.",
        Brujah: "Someone put you here. That's a fact. The anger arrives before the question, and the question is better fuel.",
        Tzimisce: "A domain violation. The cellar belongs to whoever rests in it. This intrusion will be addressed.",
        Malkavian: "The mortar speaks if you let it. Anxiety. Haste. The ghost of a telephone conversation the mason was having while he worked.",
      },
      choices: [
        { text: "Drive your shoulder into the soft joint — break through", next: 'wall_forced' },
        { text: "Slip through the maintenance seam — slow, quiet", next: 'wall_seam' },
        { text: "Feel the ward's structure and unravel it from inside", next: 'wall_ward', requires_clan: 'Tremere' },
        { text: "Let the Beast read the stone — follow the rats' paths", next: 'wall_tunnel', requires_clan: 'Nosferatu' },
        { text: "Reshape your fingers at the joints, feel where the mortar gives", next: 'wall_tunnel', requires_clan: 'Gangrel' },
        { text: "Let the anger do the work — now, fast, loud", next: 'wall_frenzy', requires_hunger_gte: 4 },
      ],
    },

    wall_forced: {
      act: 1,
      narrative: "Three impacts. The first cracks it. The second opens a fissure. The third brings a section down in a clatter of brick and dust that fills the cellar with noise and white powder.\n\nYou are through.\n\nSomewhere above, the orchestra plays on. Either no one heard or no one cared. You don't know which yet.",
      flags_set: ['wall_violent'],
      next: 'surface_tunnel',
    },

    wall_seam: {
      act: 1,
      narrative: "The pipe gap is tight. You compress yourself into something smaller than you remember being capable of and move through it hand-first, inch by inch, cheek pressed to cold iron.\n\nThirty seconds. Then the far side opens into a service tunnel — dark, low-ceilinged, smelling of dust and old grease.\n\nNo sound of alarm. No footsteps. The orchestra is closer now.",
      next: 'surface_tunnel',
    },

    wall_ward: {
      act: 1,
      narrative: "You press your palm flat against the mortar and close your eyes.\n\nThe ward is a simple binding — an amateur's work, the kind of thing written in a hurry from half-remembered instructions. You feel for the knot of intent at its centre. Find it. Pull.\n\nThe wall doesn't fall — it exhales. The mortar crumbles dry, without drama. A section leans and settles and you step through the gap into the service tunnel beyond.\n\nWhoever set that ward knew what they were doing only well enough to make it insulting.",
      next: 'surface_tunnel',
    },

    wall_tunnel: {
      act: 1,
      narrative: "You close your eyes and let the body lead.\n\nThe instinct is older than the hunger, older than the amnesia. Your hands find the pipe gap before your eyes do. Your fingers read the gap's dimensions the way a key reads a lock. The other side opens into a service tunnel and you are through before you have consciously decided to move.\n\nThe orchestra is close now. One level up, at most.",
      next: 'surface_tunnel',
    },

    wall_frenzy: {
      act: 1,
      narrative: "You stop thinking and let the Beast drive.\n\nThe new wall doesn't last three seconds. Your fists go through it like it's rehearsing being rubble. Dust, noise, the metallic ring of someone's tool kit knocked off a shelf in the next chamber. You are in the service tunnel before the debris settles.\n\nThe anger cools slowly. You are through. Your hands are bleeding where the mortar cut them. The wounds are already closing.",
      flags_set: ['wall_violent'],
      next: 'surface_tunnel',
    },

    surface_tunnel: {
      act: 1,
      narrative: "The service tunnel runs east under a vaulted ceiling barely two metres high. Pipe bundles and junction boxes. An emergency light, dead. At the far end, a steel door, and under the door: a thin band of light and the smell of a building that is occupied and warm.\n\nAlso: something else. Closer.\n\nA human smell — skin, soap, old coffee, and underneath all of it, the copper-bright flag of an open wound.\n\nSomewhere in this tunnel, someone is bleeding.",
      next: 'stagehand_encounter',
    },

    // ═════════════════════════════════════════════════════════════════════════
    // ACT 2 — FIRST HUNGER
    // ═════════════════════════════════════════════════════════════════════════

    stagehand_encounter: {
      act: 2,
      title: 'First Hunger',
      narrative: "He's sitting against the wall six metres ahead, phone in one hand, a rag pressed to his forearm with the other. A stagehand — stage blacks, laminate badge, the particular exhaustion of someone three hours into a double shift.\n\nThe cut is minor. He hasn't noticed you yet. The band of light under the far door is the only illumination and you are still in the dark.\n\nYour hunger is louder than any thought you can form right now. You are at four — a number you somehow know means the edge of losing this.",
      compulsion_note: "The Beast presents the calculation simply: there is blood, there is a body, there is no one else watching. It has done harder things than this. It has done this in sleep.",
      clan_notes: {
        Toreador: "He has a musician's hands — callused in the right places, a partial tattoo on the wrist. Even now, starving, you notice the aesthetics of him before the hunger.",
        Ventrue: "The badge says 'F. Holzer — Technical.' Contracted staff, not permanent. Lower-tier access pass. Useful. Manageable.",
        Brujah: "A worker on a break, bleeding from a job hazard with nobody checking on him. The anger you feel at this is separate from the hunger and arrives a half-second later.",
        Malkavian: "He smells of three weeks ago. Of Tuesday specifically. His blood will show you something — you're not sure you want to see it.",
        Lasombra: "The shadow you cast on the wall behind you is absent. If he turns around and sees a person with no shadow, that ends the easy version of this.",
      },
      choices: [
        { text: "Feed carefully — approach slow, make sure he doesn't scream", next: 'feed_clean' },
        { text: "Feed fast — worry about whether he remembers later", next: 'feed_messy' },
        { text: "Control it. Walk past. Find another way", next: 'feed_refuse' },
        { text: "Catch his eyes and make sure he won't remember", next: 'feed_dominate', requires_discipline: 'Dominate' },
        { text: "Draw him in — let him come to you willingly", next: 'feed_presence', requires_discipline: 'Presence' },
      ],
    },

    feed_clean: {
      act: 2,
      narrative: "You move slowly enough that he hears you as a person, not a thing.\n\n'Hey.' He looks up. You hold his eyes and find the latch — not a discipline, just the old animal confidence of a predator who has done this ten thousand times.\n\nHe doesn't resist. He barely notices. You take what you need in under two minutes and leave him sitting with his back to the wall, not quite asleep, already forgetting the shape of it.\n\nThe hunger drops. The city comes back into focus. You can think again.",
      flags_set: ['first_feed_clean'],
      hunger_change: -2,
      next: 'caretaker_approach',
    },

    feed_messy: {
      act: 2,
      narrative: "You move fast and your control isn't perfect. He makes a sound — half-surprise, half-something else — before the feeding state takes him.\n\nYou pull back when the hunger settles but the timing was off. There are marks on his neck. He's conscious. He will remember something.\n\nYou leave him with a story about low blood pressure and his phone unlocked on his lap. It might hold. It probably won't survive much scrutiny.\n\nThe hunger is quieter. Your hands are not entirely steady.",
      flags_set: ['first_feed_breach_minor'],
      hunger_change: -2,
      next: 'caretaker_approach',
    },

    feed_refuse: {
      act: 2,
      narrative: "You walk past him.\n\nHe looks up. You say nothing. He watches you disappear toward the far door with the confused expression of someone whose brain is quietly filing this experience under 'strange but probably fine.'\n\nYou push through into the service corridor beyond. The hunger doesn't quiet — it settles into a low, permanent pressure behind your eyes. You can work with this. You have worked with worse.\n\nYou think.",
      flags_set: ['first_feed_clean'],
      next: 'caretaker_approach',
    },

    feed_dominate: {
      act: 2,
      narrative: "He looks up from his phone and meets your eyes, and you reach in.\n\nThe command is quiet: *sleep, forget, rest.* His head drops forward before the sentence ends. You feed without hurry, without noise, without leaving marks that matter. When he wakes in twenty minutes he will remember a dizzy spell and nothing else.\n\nThe power costs you something — you feel it in the dry ache at the base of your skull — but the result is clean.\n\nHunger recedes. Thought returns.",
      flags_set: ['first_feed_clean'],
      hunger_change: -2,
      next: 'caretaker_approach',
    },

    feed_presence: {
      act: 2,
      narrative: "You let something through — not the hunger, the other thing. The warmth. The pull.\n\nHe looks up from his phone and finds you interesting. More than interesting. He stands up and comes to you like someone walking toward a song they half-recognise, and the rest happens the way it's supposed to: willing, warm, clean.\n\nHe'll have a story about meeting someone. He won't remember what she looked like or what he did after. He'll feel good about it regardless.\n\nYou feel good about it too, which is the part you don't examine yet.",
      flags_set: ['first_feed_clean'],
      hunger_change: -2,
      next: 'caretaker_approach',
    },

    // ─── Caretaker ────────────────────────────────────────────────────────────

    caretaker_approach: {
      act: 2,
      title: 'The Caretaker',
      narrative: "The steel door opens into a wider service corridor — and into a man who was clearly not expecting you.\n\nFifties. Work coat. A ring of keys the size of a fist. He freezes the way people freeze when they are frightened and also, underneath the fright, guilty. Not surprised. Guilty.\n\nHe knows what you are. He has seen your kind before.",
      clan_notes: {
        Nosferatu: "He reacts to your face with trained suppression, not ordinary fear. He has worked with Nosferatu before. Someone acclimatised him.",
        Malkavian: "His cortisol spikes at the specific frequency of someone anticipating a conversation they've been dreading. He expected you. Not tonight — but soon.",
      },
      next: 'caretaker_talk',
    },

    caretaker_talk: {
      act: 2,
      narrative: "He speaks first. 'You're not supposed to be out yet.'\n\nYou ask him who put you in there.\n\nHe takes a breath. 'I was given instructions. Sealed the chamber three weeks ago Tuesday. Told to check every four nights and wait.' He looks at your left hand. His expression shifts — fear with something underneath it, a recognition he doesn't want to have.\n\n'That mark.' He takes a step back. 'Where did you get that mark?'",
      flags_set: ['sigil_seen'],
      clan_notes: {
        Ventrue: "He's a ghoul. Old contract, based on the smoothness of his fear — this isn't the first difficult conversation he's managed for a Kindred. Whoever his domitor is, they trained him well.",
        Tremere: "The sigil's recognition is involuntary. He's seen it on paper, not on flesh. Correspondence. Something sent to someone he works for.",
      },
      next: 'caretaker_offer',
    },

    caretaker_offer: {
      act: 2,
      narrative: "His name is Felix. He won't tell you who sealed you in — he says he doesn't know the name, only the instructions. He might be lying.\n\nWhat he will offer: a route out of the building through the loading dock, and a contact address in Josefstadt — a safehouse the local network uses, quiet, stocked. In exchange, he wants you gone before his employer realises you woke up.\n\nHe is frightened. He is also, you notice, choosing words very carefully.",
      choices: [
        { text: "Accept the deal — take the address, go quietly", next: 'caretaker_helped' },
        { text: "Push him harder — you want the name, not an address", next: 'caretaker_pushed' },
        { text: "Reach in and take what he knows", next: 'caretaker_dominated', requires_discipline: 'Dominate' },
        { text: "Thank him and leave — you don't need his help", next: 'caretaker_refused' },
      ],
    },

    caretaker_helped: {
      act: 2,
      narrative: "He writes the address on the back of a service schedule and hands it over with both hands, the way people hand over things they want to stop holding.\n\nJosefstadt, a cross-street near the theater district. Third floor, left-hand unit. 'Key's under the junction box on the stairwell. Don't leave the lights on.'\n\nHe holds the door for you. It's almost courteous.",
      flags_set: ['caretaker_helped', 'has_lead'],
      next: 'watcher_encounter',
    },

    caretaker_pushed: {
      act: 2,
      narrative: "'I don't know the name.' He says it flatly. 'I know a drop address and a phone number that stopped answering six days ago. That's everything I have.'\n\nHe means it. The fear is real but so is the blank wall behind it — he was kept ignorant on purpose.\n\nHe still offers the Josefstadt address. Less warmly now. The door, when he opens it, he does not hold.",
      flags_set: ['has_lead'],
      next: 'watcher_encounter',
    },

    caretaker_dominated: {
      act: 2,
      narrative: "His eyes go flat and he tells you everything in the order you ask for it.\n\nThe instructions came by courier — no name, a wax seal he describes but doesn't recognise. The sigil on your palm matches something on the letter's inside flap. He's seen it before — correspondence, through his employer's office, addressed to someone called 'the Choirmaster.'\n\nHe gives you the Josefstadt address without knowing he's doing it. When you release him, he blinks and excuses himself for a moment. The information is yours. So is whatever you feel about how you got it.",
      flags_set: ['has_lead', 'caretaker_alienated'],
      next: 'watcher_encounter',
    },

    caretaker_refused: {
      act: 2,
      narrative: "You walk past him without another word.\n\nHe calls after you: 'The loading dock exit is on your left. Don't use the public doors — there are cameras.' A pause. 'I was going to tell you regardless.'\n\nYou don't look back. The address in Josefstadt goes with him.",
      flags_set: ['caretaker_alienated'],
      next: 'watcher_encounter',
    },

    // ═════════════════════════════════════════════════════════════════════════
    // ACT 3 — THE CITY ABOVE
    // ═════════════════════════════════════════════════════════════════════════

    watcher_encounter: {
      act: 3,
      title: 'The Watcher',
      narrative: "Outside: Vienna in the small hours. Tram rails catching orange light. The Staatsoper's loading dock lets onto a side street, quiet, cobbled, the kind of street that functions as a stage set for the rest of the city.\n\nYou're three buildings down when you know you're being followed.\n\nNot a feeling — a specific, cold certainty. Someone has been maintaining distance for ninety seconds. Same pace. Same pauses. The city has cameras everywhere and someone, somewhere, is paying attention to this particular block tonight.",
      clan_notes: {
        Nosferatu: "You've been tracked since the loading dock door. Whoever it is knows surveillance tradecraft — they're using reflections in the tram windows, not direct sightlines.",
        Gangrel: "The city is loud and lit but the body reads threat the way it reads weather: before the conscious mind has processed it. The scent trail behind you carries someone's focused attention.",
        Tremere: "There's an observation ward on the street corner. New — days old. Someone prepared this approach.",
        Malkavian: "You see them before you see them. A figure at the edge of peripheral vision that resolves, when you look directly, into an ordinary person doing ordinary things. Too ordinary.",
      },
      choices: [
        { text: "Walk into the tourist crowd on the Ringstrasse — disappear in the noise", next: 'watcher_blend' },
        { text: "Cut into the residential blocks — rooftops, lose them in the vertical", next: 'watcher_rooftops' },
        { text: "Vanish. Step off the visible spectrum entirely.", next: 'watcher_obfuscate', requires_discipline: 'Obfuscate' },
        { text: "Double back. Find an alley. Confront whoever this is", next: 'watcher_confront' },
      ],
    },

    watcher_blend: {
      act: 3,
      narrative: "You find a tourist group outside a late-night Würstelstand and insert yourself at the edge — phone out, shoulders angled, the universal posture of someone who is definitely here on purpose.\n\nTwo minutes. The follower passes without slowing. A figure in a grey jacket, unremarkable, the exact kind of unremarkable that is practiced. They scan the group once with the particular lateral sweep of someone trained to do it without appearing to.\n\nThey walk on. You wait ninety seconds and move in the opposite direction.",
      flags_set: ['hunter_identified'],
      next: 'archivist_door',
    },

    watcher_rooftops: {
      act: 3,
      narrative: "Second-floor balcony, fire ladder, roof in under twelve seconds. You know you can do this the way you know how to breathe — the body remembers what the mind has lost.\n\nThe rooftop view of the Innere Stadt at 1 a.m. is extraordinary: lit spires, the black thread of the Ring, tram sparks on the wire. You are watching the city and the city cannot watch you.\n\nThe figure in the street below stops. Looks left and right with a professionalism that answers one question: this is not a random encounter.",
      flags_set: ['hunter_identified'],
      next: 'archivist_door',
    },

    watcher_obfuscate: {
      act: 3,
      narrative: "You step sideways out of the light — not physically, exactly, but out of the quality of attention that makes people register movement.\n\nThe follower walks through the space you just occupied. Stops. Turns slowly, scanning each face on the street with a focus that is conspicuously professional. They speak once, quietly, into a collar mic.\n\nYou watch them from three metres away while they fail to find you. It takes real effort not to say something.",
      flags_set: ['hunter_identified'],
      next: 'archivist_door',
    },

    watcher_confront: {
      act: 3,
      narrative: "The alley is between a dry cleaner and a locked gallery. You wait in the dark with the patience of something that has been underground for weeks.\n\nThey come around the corner ninety seconds later and stop when they find you there, facing them, in the middle of the alley.\n\nA moment of pure mutual assessment. Then they reach for something under the jacket — not fast enough.",
      choices: [
        { text: "Disarm them and pin them — ask questions", next: 'watcher_confront_silent' },
        { text: "Throw them into the wall and run — you don't need answers tonight", next: 'watcher_confront_flight' },
      ],
    },

    watcher_confront_silent: {
      act: 3,
      narrative: "Their wrist. The wall. The device — a directional scanner, not a weapon — falls on the cobblestones.\n\nThey're controlled even pinned. No shouting. Their free hand doesn't reach for a phone. Trained response: don't escalate, don't give information, wait for extraction.\n\nYou hold them long enough to see the equipment, the earpiece, the particular posture of someone operating in an institutional framework they believe in. You release them and walk away before they've finished deciding what their next move is.",
      flags_set: ['hunter_identified'],
      next: 'archivist_door',
    },

    watcher_confront_flight: {
      act: 3,
      narrative: "They hit the wall with enough force to crack the plaster and you are back on the main street before they've registered what happened.\n\nThey saw your face. They have your approximate height and speed. Somewhere, that data is going into a file.\n\nYou walk fast and don't look like someone who just assaulted a person in a side street, which is harder than it sounds.",
      flags_set: ['hunter_identified', 'masquerade_broken'],
      next: 'dawn_breach',
    },

    // ─── Archivist ────────────────────────────────────────────────────────────

    archivist_door: {
      act: 3,
      title: 'The Archivist\'s Door',
      narrative: "You find the address by following the scent of old paper and something older beneath it — the particular cold of a vampire's resting temperature, distant but present.\n\nA door in the second sub-basement of a building near the Naschmarkt. No nameplate. The handle has been touched by the same hands for decades.\n\nBefore you knock: a slot opens at eye level. One eye — yellowed, patient — looks you over without surprise or welcome.\n\n'I heard you were up. Come in. Don't touch anything.'",
      flags_set: ['archivist_contacted'],
      next: 'archivist_meeting',
    },

    archivist_meeting: {
      act: 3,
      narrative: "Gregor is old enough that his Nosferatu features have settled into something that reads as architectural rather than wrong. He lives surrounded by filing cabinets, paper indices, and a smell that is either archival preservation fluid or something that feeds on archival preservation fluid.\n\nHe already knows your name. He says it before you've told him and watches your face when he does.\n\n'I have three things that belong to you,' he says. 'I'll trade two for free. The third one costs.'",
      clan_notes: {
        Nosferatu: "He offers you the Nosferatu courtesy first — a pause, a slight tip of the head. Clan recognition. He'll talk to you more openly than he would to anyone else here, though not without cost.",
        Malkavian: "He smells of seven concurrent secrets and the particular satisfaction of someone who knows more than they're saying. You find him restful for exactly that reason.",
        Ventrue: "He deals with you like a supplier deals with a client who has temporarily misplaced their leverage. Polite. Careful. Aware that the balance will shift.",
      },
      choices: [
        { text: "Accept his terms — ask what the cost is before agreeing", next: 'archivist_terms' },
        { text: "Counter: information for information, no open debts", next: 'archivist_counter' },
        { text: "Give him the address you got from Felix — trade the lead", next: 'archivist_favor', requires_flag: 'has_lead' },
        { text: "Take the free information and leave — no deals tonight", next: 'archivist_free_only' },
      ],
    },

    archivist_terms: {
      act: 3,
      narrative: "The third item is a letter. Sealed with wax, addressed to you, written in a hand he won't identify. It arrived two months before you went under.\n\n'The cost: you tell me what you find when you find it. Whatever is at the end of this.' He taps the wax seal with one finger. 'I will know eventually. I prefer to know first.'\n\nHe slides you the first two items without waiting: a folded map of the Viennese Rack, and a note in your own handwriting that reads *trust no one who uses the phrase 'the Choirmaster' without flinching.*\n\nThe letter he keeps until you answer.",
      choices: [
        { text: "Agree to his terms — take the letter", next: 'archivist_deal_made' },
        { text: "Decline the letter — you'll find it yourself", next: 'archivist_letter_refused' },
      ],
    },

    archivist_deal_made: {
      act: 3,
      narrative: "The wax seal breaks cleanly.\n\nThe letter is in your own hand and you don't remember writing it. Three lines. *If you're reading this, something went wrong. The cellar is a last resort, not a punishment. The mark on your palm is a liability — keep it covered. I left everything you need in the place you'd look first.*\n\nYou sit with that for a moment. Gregor does not pretend he isn't watching.\n\n'Good doing business,' he says. 'The haven two streets east is yours until the debt clears. Second floor, blue door.'",
      flags_set: ['haven_option_archivist'],
      next: 'choice_of_dens',
    },

    archivist_counter: {
      act: 3,
      narrative: "'Information for information,' you say. 'No running tabs.'\n\nHe considers this with the patience of someone who has outlasted most negotiations by simply waiting.\n\n'The free items still apply.' He slides the map and the handwritten note across. 'The letter stays in my keeping until you bring me something worth trading for it. Provisional.'\n\nNo haven offer. No open debt. A working relationship, tentative, not yet tested.",
      next: 'choice_of_dens',
    },

    archivist_favor: {
      act: 3,
      narrative: "You give him the address in Josefstadt.\n\nA pause. A subtle shift in Gregor's expression — not surprise, but recalculation. That address has value he didn't expect you to have.\n\n'The free items, the letter, and the haven,' he says, re-dealing the arrangement without being asked. 'The safehouse address clears the ledger and puts a small balance in your column.'\n\nHe seals the agreement the Nosferatu way: a shared secret. He tells you one thing he was going to keep. You learn the watcher's organizational affiliation and what their scanner was designed to detect.\n\nYou leave with everything. No open debts. No loose witnesses. One night survived without leaving a single thread behind.",
      flags_set: ['haven_option_archivist'],
      next: 'dawn_favor_rest',
    },

    archivist_letter_refused: {
      act: 3,
      narrative: "You leave the letter with him.\n\nHe keeps the map and note on the desk — already yours — and watches you stand. 'The offer on the letter stands. Indefinitely. I'm patient.'\n\nYou believe him.",
      next: 'choice_of_dens',
    },

    archivist_free_only: {
      act: 3,
      narrative: "He gives you the map and the note without complaint. The free items were always free.\n\nAt the door: 'The letter will be here when you want it. So will I.'\n\nYou step out into the stairwell. Behind the door, already: the sound of a filing cabinet opening.",
      next: 'choice_of_dens',
    },

    // ─── Choice of Dens ───────────────────────────────────────────────────────

    choice_of_dens: {
      act: 3,
      title: 'Before Dawn',
      narrative: "An hour before sunrise the city narrows to its essentials: where to be when the light comes.\n\nYou have options. None of them are comfortable. All of them are better than the cellar.",
      choices: [
        { text: "The opera cellar — back to the sealed chamber, resealed from inside", next: 'den_opera' },
        { text: "The Josefstadt safehouse — Felix's fallback, if you have the address", next: 'den_safehouse', requires_flag: 'has_lead' },
        { text: "Gregor's loaned haven — two streets east of the Naschmarkt", next: 'den_archivist', requires_flag: 'haven_option_archivist' },
      ],
    },

    den_opera: {
      act: 3,
      narrative: "You go back the way you came.\n\nThe cellar is familiar now in the way that bad places become familiar: you know which stones give under your feet, which walls hold. You pull the damaged section back into a rough seal behind you and wedge it with a piece of broken pipe.\n\nIt won't stop anyone who knows to look. But nobody knows to look yet.",
      flags_set: ['haven_vienna_opera'],
      next: 'dawn_rest',
    },

    den_safehouse: {
      act: 3,
      narrative: "Josefstadt is twenty minutes on foot, quiet at this hour. The building is a Gründerzeit apartment block with a coded entry and the particular stillness of a space that isn't used for ordinary living.\n\nThird floor, left-hand unit. Key under the junction box, as promised. Inside: blackout curtains, a sealed interior room, nothing personal. A hiding place, not a home.\n\nGood enough for one dawn.",
      flags_set: ['haven_vienna_safehouse'],
      next: 'dawn_rest',
    },

    den_archivist: {
      act: 3,
      narrative: "The blue door is unlocked. Inside: a single room stripped of personal detail, blackout shutters fitted to the windows with professional care. A sleeping space prepared for exactly this use.\n\nGregor's hospitality is transactional but thorough. The room is dark, it is sealed, and it smells of no one living.\n\nYou bolt the door and take stock of the night's accounting before the sleep arrives.",
      flags_set: ['haven_vienna_archivist'],
      next: 'dawn_rest',
    },

    // ─── Dawn ─────────────────────────────────────────────────────────────────

    dawn_rest: {
      act: 3,
      title: 'Dawn',
      narrative: "The sun is below the horizon by minutes.\n\nYou can feel it the way you feel the turn of a tide — not sight, not heat, but a shift in the quality of the dark. The body begins to shut down, system by system, in the orderly sequence of a vampire settling toward Daylily sleep.\n\nYou let it happen. There is nothing left to do tonight that cannot wait for tonight.",
      next: 'dawn_memory',
    },

    dawn_memory: {
      act: 3,
      narrative: "In the last second before consciousness goes, something surfaces.\n\nNot a thought. Not a dream. A sensation — complete, precise, belonging to a different body in a different century.\n\n*Olive trees in full afternoon light. The smell of incense from a procession moving through a market square. Stone warm under bare feet. Someone calling a name you almost recognise from the back of your skull, a name that is almost yours.*\n\nThe sigil on your left palm warms. Not burns — warms, like something remembering warmth from long ago.\n\nThen nothing. Then dawn.",
      flags_set: ['memory_seal_broken'],
      ending: 'dawn_survived',
    },

    // ─── Perfect dawn path (archivist_favor — clean deal, no loose ends) ──────

    dawn_favor_rest: {
      act: 3,
      title: 'Dawn',
      narrative: "The haven is exactly what Gregor promised: dark, sealed, no personal trace.\n\nYou bolt the door. The city above you continues its business, oblivious. No one who matters saw anything tonight they couldn't explain. The Masquerade holds. The archivist knows what he knows and has agreed to its price.\n\nThe body begins to shut down in the orderly way. You let it.",
      next: 'dawn_memory_perfect',
    },

    dawn_memory_perfect: {
      act: 3,
      narrative: "In the last second before consciousness goes, something surfaces.\n\nNot a thought. Not a dream. A sensation — complete, precise, belonging to a different body in a different century.\n\n*Olive trees in full afternoon light. The smell of incense from a procession moving through a market square. Stone warm under bare feet. Someone calling a name you almost recognise from the back of your skull — a name that is almost yours — called in a voice that sounds like no one you know and everyone you have ever known.*\n\nThe sigil on your left palm warms, and this time it does not stop at warmth. Something beneath the skin moves, once, like a key turning in a lock that has been frozen shut for longer than memory.\n\nThen nothing. Then dawn. And the city waits.",
      flags_set: ['memory_seal_broken'],
      ending: 'dawn_perfect',
    },

    // ─── Troubled dawn path (masquerade breached, fled witness) ──────────────

    dawn_breach: {
      act: 3,
      title: 'Damage Control',
      narrative: "You do not go to the archivist tonight.\n\nThe witness is somewhere in the city with a phone and a story and organisational support. You don't know how fast the information travels. You don't know what they'll do with what they saw. You spend the remaining hour before dawn cycling through contingencies and finding only open questions.\n\nEventually you stop calculating and find a place to be when the light comes: a sealed maintenance room beneath a car park three streets from where you surfaced. Not comfortable. Not permanent. Good enough for one day.",
      next: 'dawn_memory_troubled',
    },

    dawn_memory_troubled: {
      act: 3,
      narrative: "In the last second before consciousness goes, something surfaces.\n\nNot a thought. Not a dream. A sensation — old, precise, belonging to a different century.\n\n*Olive trees. A procession. Incense. A name called from across a crowded square — almost yours, not quite yours, belonging to someone who did not yet know what they were.*\n\nThe sigil on your left palm warms once, briefly — and then the warmth turns anxious, the way a warning sign is warm to the touch before the fire behind it shows.\n\nThen nothing. Then dawn. Somewhere above you, a morning is beginning that will have questions in it.",
      flags_set: ['memory_seal_broken'],
      ending: 'dawn_troubled',
    },

  },

  locales: {
    hu: {
      title: 'Torpor Hamvai',
      subtitle: 'Az az éjszaka, amikor rosszul ébredsz fel',
      setting: 'Bécs, Ausztria — jelen éjszaka',
      acts: {
        1: 'A Torpor Vége',
        2: 'Az Első Éhség',
        3: 'A Város Odafönt',
      },
      endings: {
        dawn_survived: {
          title: 'Egy Éjszaka Túlélve',
          text: "A búvóhely beforr körülötted és a város elcsendesül.\n\nEtettél. Mozgtál. Nem haltál meg. Egy vámpír számára, aki Torporbóol ébred egy városba, amely nem ismeri a nevedet, ez elég.\n\nAhogy a tudat elszáll, valami felszínre kerül — nem emlék, hanem az emlék érzése. Olajfák. Egy ünnepi körmenet. Tömjén illata, sűrűn, ízlelhetően. A jeled tenyereden egyszer felmelegszik, röviden.\n\nAztán álom vesz el, és a melegség nem múlik el.",
        },
        dawn_troubled: {
          title: 'Amit Magad Után Hagytál',
          text: "Megtalálod a nyughelyedet, mielőtt a nap megtalálna. Alig.\n\nValahol a városban valaki nehéz beszélgetést folytat arról, amit ma éjjel látott. Nem tudod, hol. Nem tudod, milyen messzire terjed a kár. Nem fogod tudni, amíg fel nem ébredsz.\n\nAhogy elmerülsz, egyetlen kép: olajfák, körmenet, tömjénfüst. Ősi. A jel tenyereden ég tőle.\n\nKövetkezményekre ébredsz. Mindenképpen felébreszel.",
        },
        dawn_perfect: {
          title: 'Tiszta Munka',
          text: "A búvóhely beforr. Bécs zümmög fölötted, mit sem sejtve.\n\nTanúk nélkül etettél. Nyomok nélkül mozogtál. Mindenki, aki ma éjjel látott, vagy tudatos résztvevő, vagy nem tudja, mit látott. Az Álarc tartja. Bármi is zárt abba a pincébe, még odakint van — de ma éjjel nem adtál neki semmit, amivel dolgozhatna.\n\nAz utolsó pillanatban álom előtt: olajfák teljes napfényben, körmenet egy alig ismert nyelven, tömjén a levegőben. A jel tenyereden egyszer lüktet — meleg, biztos, mint valami, amely emlékezik rád.\n\nA következő éjszakára egy kicsit kevésbé elveszve ébredsz fel.",
        },
      },
      scenes: {
        start: {
          title: 'A Torpor Vége',
          narrative: "Először sötétség. Aztán súly — kő fölülről, kő oldalt, kő alul.\n\nAztán réz. Az íz hamarabb érkezik, mint a te többi részed: hideg, éles, abszolút. A szájadban lévő vér régi, a tiéd, és nem elég.\n\nEgy mondat tör fel mindennél előbb — a neved előtt, az év előtt, a miért előtt. *A spiritu maligno, libera nos.* A gonosz lélektől, szabadíts meg minket. Latin. Liturgikus. Fogalmad sincs, honnan jött.\n\nFölötted, méternyi kövön és vakolaton át tompítva: vonósok. Egy zenekar, élő, fegyelmezett mechanikussággal. Valami alatt vagy, ami még mindig játszik.",
        },
        the_wall: {
          title: 'Új Habarcs',
          narrative: "Tapintás útján találod meg. A pince egyik fala más — a fugák habarcs puha, az illata friss. Hetes, nem évszázados. Valaki szándékosan és nemrégiben elzárta ezt a teret.\n\nA bal oldali falon van egy rés, ahol vascsővezeték fut: egy karbantartási varrat, alig váll-szélességű.\n\nBal tenyered ég. A sötétben ránézel, és nem látsz semmit — de érzed a bőrbe vésett valami formáját. Egy jel. Nem emlékszel rá, hogy ott volt.",
          choices: [
            'Verd be vállal a puha fugát — törj át',
            'Csússz át a karbantartási résen — lassan, csendesen',
            'Érezd a varázszár szerkezetét és bontsd ki belülről',
            'Hagyd, hogy a Vadállat olvassa a követ — kövesd a patkányok útjait',
            'Formáld át az ujjaidat a fugoknál, érezd, hol enged a habarcs',
            'Hagyd, hogy a düh elvégezze — most, gyorsan, hangosan',
          ],
        },
        wall_forced: {
          narrative: "Három ütés. Az első megrepeszti. A második hasadékot nyit. A harmadik egy falszakaszt hoz le tégla- és porzajjal, amely betölti a pincét zajjal és fehér porral.\n\nKiértél.\n\nValahol fölötted a zenekar tovább játszik. Vagy nem hallotta senki, vagy senki nem törődött vele. Még nem tudod, melyik.",
        },
        wall_seam: {
          narrative: "A csőrés szűk. Valami kisebbre nyomod össze magad, mint amire emlékszel, hogy képes vagy, és kézzel előre haladva, centiméterről centiméterre, arccal a hideg vasnak nyomva mozogsz át.\n\nHarminc másodperc. Aztán a túlsó oldal megnyílik egy szervizalagútba — sötét, alacsony mennyezetű, poros és régi zsír illatú.\n\nNincs riasztás zaja. Nincs lépés. A zenekar most közelebb van.",
        },
        wall_ward: {
          narrative: "Tenyeredet laposan a habarcsra nyomod és behunyod a szemed.\n\nA varázszár egyszerű kötés — amatőr munkája, olyasvalakié, aki félmegjegyzett utasításokból dolgozott, sietősen. Megkeresed a szándék csomóját a közepén. Megtalálod. Meghúzod.\n\nA fal nem dől le — kilehel. A habarcs szárazon omlik, dráma nélkül. Egy szakasz megdől és leülepszik, te pedig átstepelsz a résen a mögötte lévő szervizalagútba.\n\nAki ezt a varázszárat felállította, csak annyira értett hozzá, amennyire sértő volt.",
        },
        wall_tunnel: {
          narrative: "Behunyod a szemed és hagyod, hogy a test vezessen.\n\nAz ösztön régebbi az éhségnél, régebbi az amnéziánál. Kezeid megtalálják a csőrést, mielőtt szemeid megtalálnák. Ujjaid olvassák a rés méreteit, ahogy egy kulcs olvassa a zárat. A túlsó oldal megnyílik egy szervizalagútba és már átértél, mielőtt tudatosan döntöttél volna a mozgásról.\n\nA zenekar most közel van. Egy szinttel feljebb, legfeljebb.",
        },
        wall_frenzy: {
          narrative: "Abbahagyod a gondolkodást és hagyod, hogy a Vadállat vezessen.\n\nAz új fal nem tart három másodpercig. Ökleid átmennek rajta, mintha próbálna romok lenni. Por, zaj, valaki szerszámkészletének fémcsilingelése, amelyet lever a polcról a szomszéd kamrában. A törmelék leülepedése előtt már a szervizalagútban vagy.\n\nA düh lassan hűl. Átjutottál. Kezeid véreznek, ahol a habarcs megvágta őket. A sebek már záródnak.",
        },
        surface_tunnel: {
          narrative: "A szervizalagút keletre fut egy boltozatos mennyezet alatt, alig két méter magasan. Csőkötegek és elosztók. Egy vészvilágító, halott. A túlsó végén egy acélajtó, az ajtó alatt: egy vékony fényszalag és egy foglalt és meleg épület szaga.\n\nEmellett: valami más. Közelebb.\n\nEmberi szag — bőr, szappan, régi kávé, és mindez alatt a nyílt seb réz-fényű lobogója.\n\nValahol ebben az alagútban valaki vérzik.",
        },
        stagehand_encounter: {
          title: 'Az Első Éhség',
          narrative: "Hat méterre előtted ül a falnál, telefonnal az egyik kezében, egy ronggyal a másikkal az alkarja ellen nyomva. Egy stábember — fekete stábos ruha, laminált kitűző, valaki különleges fáradtsága, aki egy duplaszakasz harmadik óráján jár.\n\nA seb apró. Még nem vett észre. Az ajtó alatti fényszalag az egyetlen fény, és te még a sötétben vagy.\n\nAz éhséged hangosabb, mint bármely gondolat, amelyet most formálni tudsz. Négyen vagy — egy szám, amelyről valahogy tudod, hogy az elvesztés határát jelenti.",
          choices: [
            'Etesd óvatosan — közelíts lassan, győződj meg, hogy nem kiált',
            'Etesd gyorsan — foglalkozz azzal, hogy emlékezik-e rá majd',
            'Urald magad. Menj el mellette. Találj más módot',
            'Fogd meg a szemét és győződj meg, hogy nem fog emlékezni',
            'Vonzd magadhoz — hagyd, hogy önként jöjjön hozzád',
          ],
        },
        feed_clean: {
          narrative: "Elég lassan mozgsz ahhoz, hogy emberként hallja, nem dologként.\n\n'Hé.' Felnéz. Megragadod a szemét és megtalálod a zárat — nem diszciplína, csak a ragadozó régi állatias magabiztossága, aki tízezerszer csinálta ezt.\n\nNem ellenáll. Alig veszi észre. Két percen belül elveszed, amire szükséged van, és otthagyod a fal mellett ülve, nem egészen alva, már feledve az alakját.\n\nAz éhség csökken. A város visszafókuszálódik. Ismét gondolkodhatsz.",
        },
        feed_messy: {
          narrative: "Gyorsan mozgsz és az önuralmad nem tökéletes. Hangot ad — félig meglepetés, félig valami más — mielőtt az etetési állapot átveszi.\n\nVisszahúzol, amikor az éhség leülepszik, de az időzítés rossz volt. Nyomok vannak a nyakán. Eszméletnél van. Emlékezni fog valamire.\n\nOtthagyod az alacsony vérnyomásról szóló történettel és a telefonjával nyitva az ölén. Talán tartja. Valószínűleg nem állja ki az alaposabb vizsgálást.\n\nAz éhség halkabb. A kezeid nem teljesen stabilak.",
        },
        feed_refuse: {
          narrative: "Elmész mellette.\n\nFelnéz. Nem mondasz semmit. Néz, ahogy eltűnsz a távolabbi ajtó felé, azzal a zavart arckifejezéssel, mint akinek az agya csendesen 'furcsa, de valószínűleg rendben' kategóriába sorolja ezt az élményt.\n\nÁttolod magad a kintebb lévő szervizfolyosóra. Az éhség nem csendesül — alacsony, állandó nyomásként ülepszik le a szemeid mögé. Ezzel tudod dolgozni. Rosszabbal is dolgoztál.\n\nGondolod.",
        },
        feed_dominate: {
          narrative: "Felnéz a telefonjáról és találkozik a szemeddel, és te benyúlsz.\n\nA parancs halk: *aludj, felejts, pihenj.* Feje leesik, mielőtt a mondat véget ér. Sietség nélkül, csend nélkül etetsz, olyan nyomok nélkül, amelyek számítanak. Húsz perc múlva, amikor felébred, egy szédülős rosszullétre fog emlékezni és semmi másra.\n\nAz erő fizet valamennyit — érzed a koponyád tövén lévő száraz fájdalomban — de az eredmény tiszta.\n\nAz éhség visszahúzódik. A gondolkodás visszatér.",
        },
        feed_presence: {
          narrative: "Átengedsz valamit — nem az éhséget, a másikat. A meleget. A vonzást.\n\nFelnéz a telefonjáról és érdekesnek talál téged. Érdeknél is érdekesebbnek. Feláll és hozzád jön, mint valaki, aki egy félig ismerős dal felé sétál, és a többi úgy történik, ahogy szokott: készségesen, melegen, tisztán.\n\nLesz egy története arról, hogy valakivel találkozott. Nem fog emlékezni, hogyan nézett ki, vagy mit csinált utána. Ettől függetlenül jól fog érezni magát.\n\nTe is jól érzed magad, ami az a rész, amelyet még nem vizsgálsz meg.",
        },
        caretaker_approach: {
          title: 'A Gondozó',
          narrative: "Az acélajtó egy szélesebb szervizfolyosóra nyílik — és egy emberre, aki nyilván nem várt rád.\n\nÖtvenesek. Munkaköpeny. Egy akkora kulcskarika, mint egy ököl. Megmerevedik, ahogy az emberek megmerevednek, amikor megijednek, és a félelem alatt, mélyebben, bűnösek. Nem meglepett. Bűnös.\n\nTudja, mi vagy. Látta a fajtádat korábban.",
        },
        caretaker_talk: {
          narrative: "Ő szól előbb. 'Még nem kellene kinn lenned.'\n\nMegkérdezed tőle, ki zárt oda be.\n\nMélyet lélegzik. 'Utasításokat kaptam. Három hete, kedden lezártam a kamrát. Azt mondták, négy naponta ellenőrizzek és várjak.' Bal kezedre néz. A kifejezése megváltozik — félelem valami alatt, egy felismerés, amellyel nem akar élni.\n\n'Az a jel.' Hátralép egyet. 'Honnan van ez a jel?'",
        },
        caretaker_offer: {
          narrative: "Felixnek hívják. Nem mondja meg, ki zárt be — azt mondja, nem tudja a nevet, csak az utasításokat. Talán hazudik.\n\nAzt ajánlja fel: egy kijárási útvonalat az épületből a teherbejáraton keresztül, és egy kapcsolati cím Józsefvárosban — egy rejtekhelyet, amelyet a helyi hálózat használ, csendes, felszerelt. Cserébe azt szeretné, hogy elmenj, mielőtt a főnöke rájön, hogy felébredtél.\n\nMegféledt. Szavait is, észreveszed, nagyon óvatosan választja.",
          choices: [
            'Fogadd el az alkut — vedd a cím-et, menj csendesen',
            'Nyomd meg erősebben — a nevet akarod, nem egy cím-et',
            'Nyúlj be és vedd el, amit tud',
            'Köszönd meg és menj el — nincs szükséged a segítségére',
          ],
        },
        caretaker_helped: {
          narrative: "Leírja a cím-et egy szervizütemterv hátoldalára, és két kézzel nyújtja át, ahogy az emberek átnyújtanak dolgokat, amelyeket nem akarnak tovább tartani.\n\nJózsefváros, egy keresztutca a színháznegyed közelében. Harmadik emelet, bal oldali lakás. 'A kulcs a lépcsőházi csatlakozó doboz alatt van. Ne hagyd égve a villanyt.'\n\nFogja az ajtót. Szinte udvarias.",
        },
        caretaker_pushed: {
          narrative: "'Nem tudom a nevet.' Laposan mondja. 'Tudok egy drop-cím-et és egy telefonszámot, amely hat napja nem veszi fel. Ez minden, amim van.'\n\nEzt érti. A félelem valós, de mögötte az üres fal is az — szándékosan tudatlanul tartották.\n\nMég mindig felajánlja a józsefvárosi cím-et. Kevésbé melegen most. Az ajtót, amikor kinyitja, nem fogja.",
        },
        caretaker_dominated: {
          narrative: "Szeme üressé válik és elmond mindent abban a sorrendben, ahogy kérdezed.\n\nAz utasítások futárral jöttek — névtelenül, egy viaszpecséttel, amelyet leír, de nem ismer fel. A tenyeredben lévő jel egyezik valamivel a levél belső szárnyán. Korábban már látta — levelezésben, a főnöke irodáján keresztül, valakinek cím-ezve, akit 'Karmesternekneveznek.\n\nMegadja a józsefvárosi cím-et anélkül, hogy tudná, hogy teszi. Amikor elengedsz, pislog és egy pillanatra kimenti magát. Az információ a tiéd. Az érzés is, hogyan szereztél meg, szintén.",
        },
        caretaker_refused: {
          narrative: "Egy szó nélkül elmész mellette.\n\nUtánad szól: 'A teherbejárati kijárat balra van. Ne használd a nyilvános ajtókat — kamerák vannak.' Szünet. 'Mindenképpen megmondtam volna.'\n\nNem nézel vissza. A józsefvárosi cím-mel marad.",
        },
        watcher_encounter: {
          title: 'A Megfigyelő',
          narrative: "Odakint: Bécs a kisórákon. Villamos sínek narancs fényt fognak. Az Állami Opera teherbejárata egy mellékutcára vezet, csendes, kövezett, amilyen utca a város többi részének díszletéül szolgál.\n\nHárom épülettel odébb érzed, hogy követnek.\n\nNem érzés — egy konkrét, hideg bizonyosság. Valaki kilencven másodperce tartja a távolságot. Azonos tempó. Azonos szünetek. A városon mindenütt kamerák vannak, és valaki, valahol, ma éjjel különös figyelmet fordít erre a tömbre.",
          choices: [
            'Menj be a Ringstrasse turistatömegébe — tűnj el a zajban',
            'Vágj be a lakótömbökbe — tetők, veszítsd el őket a magasban',
            'Tűnj el. Lépj ki a látható spektrumból teljesen.',
            'Menj vissza. Keress egy sikátort. Szembesülj avval, aki ez.',
          ],
        },
        watcher_blend: {
          narrative: "Találsz egy turistacsoportot egy késő esti Würstelstand előtt és a szélére illeszkedsz — telefon kint, a vállak beállítva, az éppen ide tartozó ember általános pózában.\n\nKét perc. A követő anélkül megy el, hogy lassítana. Egy szürke dzsekit viselő alak, feltűnésmentes, pontosan az a fajta feltűnésmentes, amelyet gyakorolnak. Oldalirányban végigpásztáz a csoporton egyszer azzal a jellegzetes oldalirányú söprésssel, mint aki kiképzett arra, hogy úgy tegye, hogy ne látsszon rajta.\n\nElmegy. Kilencven másodpercet vársz és az ellenkező irányba indulsz.",
        },
        watcher_rooftops: {
          narrative: "Második emeleti erkély, tűzlétra, tetőn tizenkét másodpercen belül. Tudod, hogy ezt megteheted, ahogy tudod, hogyan kell lélegezni — a test emlékszik arra, amit az elme elveszített.\n\nA Belváros tetőről hajnali 1-kor látványos: megvilágított tornyok, a Ring fekete fonala, villamosszikrák a huzalon. Te nézed a várost és a város nem tud téged figyelni.\n\nAz alatta lévő utcán az alak megáll. Balra és jobbra néz azzal a szakmaisággal, amely megválaszol egy kérdést: ez nem véletlenszerű találkozás.",
        },
        watcher_obfuscate: {
          narrative: "Oldalra lépel ki a fényből — nem fizikailag, pontosan, de ki a figyelméből, amely az embereket regisztráltatja a mozgással.\n\nA követő átmegy az imént elfoglalt téren. Megáll. Lassan megfordul, minden arcot végigpásztáz az utcán összpontosítással, amely feltűnően szakmai. Egyszer csendesen megszólal egy gallérmikrofonba.\n\nHárom méterről nézed, ahogy megpróbálnak megtalálni téged. Valódi erőfeszítésbe kerül, hogy ne mondj valamit.",
        },
        watcher_confront: {
          narrative: "A sikátor egy patikazár és egy zárt galéria között van. Sötétben vársz annak a türelmével, ami heteket töltött a föld alatt.\n\nKilencven másodperccel később befordulnak a sarokon és megállnak, amikor találkoznak veled, szemben velük, a sikátor közepén.\n\nEgy pillanat tiszta kölcsönös felmérés. Aztán valami után nyúlnak a dzseki alatt — nem elég gyorsan.",
          choices: [
            'Fegyverezd le és szorítsd a falhoz — kérdezz',
            'Vágd a falba és fuss — ma éjjel nem kell válasz',
          ],
        },
        watcher_confront_silent: {
          narrative: "A csuklójuk. A fal. Az eszköz — egy irányított szkenner, nem fegyver — esik a macskakövekre.\n\nKontrolláltak még leszorítva is. Nem kiabálnak. Szabad kezük nem nyúl a telefon felé. Kiképzett reakció: ne eszkalálj, ne adj információt, várj a kimentésre.\n\nElég sokáig tartod őket, hogy lássad a felszerelést, a fülhallgatót, valakinek testtartását, aki egy intézményi keretrendszerben dolgozik, amelyben hisz. Elengeded, mielőtt befejezték volna a döntést a következő lépésükről.",
        },
        watcher_confront_flight: {
          narrative: "Elég erővel ütnek a falba, hogy megrepessze a vakolatot, és te már vissza vagy a főúton, mielőtt feldolgoznák, mi történt.\n\nLátták az arcodat. Megvan a hozzávetőleges magasságod és sebességed. Valahol ez az adat bekerül egy iratba.\n\nGyorsan sétálsz és nem úgy nézel ki, mint aki most vert meg valakit egy mellékutcában, ami nehezebb, mint hangzik.",
        },
        archivist_door: {
          title: 'A Levéltáros Ajtaja',
          narrative: "Úgy találod meg a cím-et, hogy követed a régi papír és alatta valami régebbi illatát — egy vámpír pihenési hőmérsékletének jellegzetes hidegét, távolit, de jelenlévőt.\n\nEgy ajtó a Naschmarkt közelében lévő épület második alagsorában. Névtábla nélkül. A kilincset évtizedek óta ugyanazok a kezek érintik.\n\nMielőtt kopogol: egy nyílás nyílik szemmagasságban. Egy szem — sárgás, türelmes — megvizsgál meglepetés vagy üdvözlet nélkül.\n\n'Hallottam, hogy fenn vagy. Gyere be. Semmit ne érintse meg.'",
        },
        archivist_meeting: {
          narrative: "Gregor elég régi ahhoz, hogy a Nosferatu vonásai valami olyasmibe ülepedtek, amely inkább architektúraszerűnek, mintsem rossznak hat. Iktatószekrények, papír-indexek és akár archivált megőrző folyadék, akár olyasvalami szaga között él, ami archivált megőrző folyadékon táplálkozik.\n\nMár tudja a nevedet. Kimondja, mielőtt megmondtad volna neki, és nézi az arcodat, amikor megteszi.\n\n'Három dolog van, ami a tiéd,' mondja. 'Kettőt ingyen adok. A harmadikat fizeted.'",
          choices: [
            'Fogadd el a feltételeit — kérdezz a költségről, mielőtt elfogadsz',
            'Ellenajánlat: információ az információért, nincs nyitott adósság',
            'Add meg neki a Félixnél kapott cím-et — kereskedj a nyommal',
            'Vedd az ingyenes információt és menj el — ma éjjel nincs alku',
          ],
        },
        archivist_terms: {
          narrative: "A harmadik tárgy egy levél. Viaszpecsételt, neked cím-ezve, egy kézírással, amelyet nem azonosít. Két hónappal azelőtt érkezett, hogy Torpor alá kerültél.\n\n'A költség: elmondsz nekem mindent, amit megtalálsz, amikor megtalálod. Bármit is ér el ez az út.' Egy ujjal megérinti a viaszpecsétet. 'Előbb-utóbb tudom majd. Inkább előbb szeretném tudni.'\n\nVárás nélkül odatolja az első két tárgyat: a bécsi Rack feltérképezett térképét és saját kézírásodban lévő céduládat, amelyen az áll: *ne bízz senkiben, aki a 'Karmester' kifejezést rebbenés nélkül használja.*\n\nA levelet addig tartja, amíg válaszolsz.",
          choices: [
            'Egyezz bele a feltételekbe — vedd el a levelet',
            'Utasítsd el a levelet — magad fogod megtalálni',
          ],
        },
        archivist_deal_made: {
          narrative: "A viaszpecsét tisztán törik.\n\nA levél saját kezedben van, és nem emlékszel, hogy írtad. Három sor. *Ha ezt olvasod, valami rosszul ment. A pince végső megoldás, nem büntetés. A tenyereden lévő jel kockázat — tartsd takart. Mindent, amire szükséged van, ott hagytam, ahol először keresnéd.*\n\nEzzel egy pillanatra leülsz. Gregor nem tesz úgy, mintha nem figyelne.\n\n'Jó volt üzletelni,' mondja. 'A két utcával keletre lévő búvóhely a tiéd, amíg az adósság rendeződik. Második emelet, kék ajtó.'",
        },
        archivist_counter: {
          narrative: "'Információ az információért,' mondod. 'Nincs futó számla.'\n\nEzt olyan türelemmel fontolja meg, mint aki a legtöbb tárgyalást egyszerűen várakozással meghaladta.\n\n'Az ingyenes tárgyak még mindig érvényesek.' Áttólja a térképet és a kézírásos cédulátt. 'A levél az őrizetemnél marad, amíg nem hozol valamit, ami megéri a cserét. Ideiglenes.'\n\nNincs búvóhely-ajánlat. Nincs nyitott adósság. Munkaviszony, kísérleti, még nem tesztelt.",
        },
        archivist_favor: {
          narrative: "Megadod neki a józsefvárosi cím-et.\n\nSzünet. Gregor kifejezésének finom elmozdulása — nem meglepetés, hanem újraszámolás. Ez a cím értéket képvisel, amelyet nem várt tőled.\n\n'Az ingyenes tárgyak, a levél és a búvóhely,' mondja, a megállapodást kéretlenül újraosztva. 'A rejtekhelycím rendezi a főkönyvet és egy kis egyenleget helyez a te oszlopodba.'\n\nA Nosferatu módján pecsételi meg a megállapodást: egy megosztott titokkal. Elmond neked valamit, amit meg akart tartani. Megtudod a megfigyelő szervezeti hovatartozását és azt, hogy mire tervezték a szkennerüket.\n\nMindennel távozol. Nincs nyitott adósság. Nincsenek laza tanúk. Egy éjszaka túlélve anélkül, hogy egyetlen szálat is magad után hagytál volna.",
        },
        archivist_letter_refused: {
          narrative: "Otthagyod nála a levelet.\n\nAz asztalon hagyja a térképet és a cédulátt — már a tieid — és néz, ahogy felállsz. 'A levélre szóló ajánlat határozatlan időre érvényes. Türelmes vagyok.'\n\nEllhiszed neki.",
        },
        archivist_free_only: {
          narrative: "Panasz nélkül adja oda a térképet és a cédulátt. Az ingyenes tárgyak mindig ingyenesek voltak.\n\nAz ajtónál: 'A levél itt lesz, ha kell. Én is itt leszek.'\n\nKilépsz a lépcsőházba. Az ajtó mögött, már: egy iktatószekrény nyitásának hangja.",
        },
        choice_of_dens: {
          title: 'Hajnal Előtt',
          narrative: "Napkelteig egy óra, a város az esszenciálisra szűkül: hol legyél, amikor jön a fény.\n\nVannak lehetőségeid. Egyik sem kényelmes. Mindegyik jobb a pincénél.",
          choices: [
            'Az opera pincéje — vissza a lezárt kamrába, belülről újraelzárva',
            'A józsefvárosi búvóhely — Felix tartaléka, ha van a cím',
            'Gregor kölcsönzött búvóhelye — két utcával keletre a Naschmarkttól',
          ],
        },
        den_opera: {
          narrative: "Visszamész, ahonnan jöttél.\n\nA pince most ismerős, ahogy a rossz helyek ismerősé válnak: tudod, melyik kövek engednek a lábad alatt, melyik falak tartanak. A sérült szakaszt visszahúzod egy durva zárba és egy darab törött csővel megtámasztod.\n\nNem fogja megállítani azt, aki tudja, hol kell keresni. De még senki sem tudja, hol kell keresni.",
        },
        den_safehouse: {
          narrative: "Józsefváros gyalog húsz perc, csendes ebben az órában. Az épület egy Gründerzeit-kori bérház kódolt bejárattal és az olyan tér különleges csendjével, amelyet nem rendes lakhatásra használnak.\n\nHarmadik emelet, bal oldali lakás. Kulcs a csatlakozó doboz alatt, ahogy ígérték. Belül: sötétítő függönyök, lezárt belső szoba, semmi személyes. Búvóhely, nem otthon.\n\nEgy hajnalra elég.",
        },
        den_archivist: {
          narrative: "A kék ajtó nyitva van. Belül: egy szoba, megtisztítva a személyes részletektől, sötétítő redőnyök az ablakokra szakmai gondossággal illesztve. Alvótér, pontosan erre a felhasználásra előkészítve.\n\nGregor vendégszeretete tranzakcionális, de alapos. A szoba sötét, lezárt, és senki élő szagát nem hordozza.\n\nAz ajtót bereteszeled és elszámolod az éjszaka eredményeit, mielőtt az álom megérkezik.",
        },
        dawn_rest: {
          title: 'Hajnal',
          narrative: "A nap percekkel van a horizont alatt.\n\nÉrzed, ahogy érzed az apály fordulóját — nem látás, nem hő, hanem a sötétség minőségének eltolódása. A test leállni kezd, rendszerről rendszerre, a nappali álomba süllyedő vámpír rendezett sorrendjében.\n\nHagyod, hogy megtörténjen. Nincs semmi elvégzetlen az éjszakáról, ami ne tűrhetne holnapig.",
        },
        dawn_memory: {
          narrative: "Az utolsó pillanatban, mielőtt az eszmélet elmegy, valami felszínre kerül.\n\nNem gondolat. Nem álom. Egy érzet — teljes, pontos, más testhez és más évszázadhoz tartozó.\n\n*Olajfák teljes délutáni fényben. Tömjén illata egy piacon áthaladó körmenettől. Meleg kő csupasz talp alatt. Valaki, aki egy nevet szólít, amelyet majdnem felismersz a koponyád hátuljából, egy nevet, amely majdnem a tiéd.*\n\nBal tenyeredben a jel felmelegszik. Nem éget — felmelegszik, mint valami, amely régen meleget emlékszik.\n\nAztán semmi. Aztán hajnal.",
        },
        dawn_favor_rest: {
          title: 'Hajnal',
          narrative: "A búvóhely pontosan olyan, mint amilyet Gregor ígért: sötét, lezárt, semmi személyes nyom.\n\nBereteszeled az ajtót. A fölötted lévő város folytatja a dolgát, mit sem sejtve. Mindenki, aki számít, ma éjjel nem látott semmi olyat, amit nem tudott megmagyarázni. Az Álarc tartja. A levéltáros tudja, amit tud, és beleegyezett az árba.\n\nA test leállni kezd a szokott módján. Hagyod.",
        },
        dawn_memory_perfect: {
          narrative: "Az utolsó pillanatban, mielőtt az eszmélet elmegy, valami felszínre kerül.\n\nNem gondolat. Nem álom. Egy érzet — teljes, pontos, más testhez és más évszázadhoz tartozó.\n\n*Olajfák teljes délutáni fényben. Tömjén illata egy piacon áthaladó körmenettől. Meleg kő csupasz talp alatt. Valaki, aki egy nevet szólít a zsúfolt tér másik oldaláról — majdnem a tiéd, de nem egészen, olyan valakié, aki még nem tudta, mi volt — olyan hangon szólít, amely úgy hangzik, mint senki, akit ismersz, és mindenki, akit valaha ismertél.*\n\nBal tenyeredben a jel felmelegszik, és ezúttal nem áll meg a melegedésnél. A bőr alatt valami mozdul, egyszer, mint egy kulcs, amely egy olyan zárba fordul, amely emlékezetnél hosszabb ideig befagyva volt.\n\nAztán semmi. Aztán hajnal. És a város vár.",
        },
        dawn_breach: {
          title: 'Kárfelszámolás',
          narrative: "Ma éjjel nem mész el a levéltároshoz.\n\nA tanú valahol a városban van egy telefonnal, egy történettel és szervezeti támogatással. Nem tudod, milyen gyorsan terjed az információ. Nem tudod, mit csinálnak azzal, amit láttak. A hajnal előtti utolsó órát valószínűségi számítások végiggondolásával töltöd, és csak nyitott kérdéseket találsz.\n\nVégül abbahagyod a számolást és találsz egy helyet, ahol lehetsz, amikor jön a fény: egy lezárt karbantartó helyiség egy parkolóház alatt, három utcával attól, ahol feljöttél. Nem kényelmes. Nem tartós. Elég egy napra.",
        },
        dawn_memory_troubled: {
          narrative: "Az utolsó pillanatban, mielőtt az eszmélet elmegy, valami felszínre kerül.\n\nNem gondolat. Nem álom. Egy érzet — régi, pontos, más évszázadhoz tartozó.\n\n*Olajfák. Körmenet. Tömjén. Egy zsúfolt tér másik oldaláról szólított név — majdnem a tiéd, de nem egészen, olyan valakié, aki még nem tudta, mi volt.*\n\nBal tenyeredben a jel egyszer felmelegszik, röviden — aztán a melegség aggodalommal telik, ahogy egy figyelmeztető tábla meleg a tapintásra, mielőtt a mögötte lévő tűz megmutatkozna.\n\nAztán semmi. Aztán hajnal. Valahol fölötted egy reggel kezdődik, amelyben kérdések lesznek.",
        },
      },
    },
  },
};
