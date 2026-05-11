// content/ash-ivory/scenes.ts
// Ash & Ivory — Vienna 1938
// Act 1: The Summons | Act 2: The Hunt | Act 3: Blood and Fire | Act 4: The Cost

import type { Chronicle } from '../../src/engine/story';

export const AshAndIvory: Chronicle = {
  id: 'ash_ivory',
  title: 'Ash & Ivory',
  subtitle: 'A Noir of Borrowed Time',
  setting: 'Vienna, Austria — March 1938',
  era: 'historical',
  cover_image: '/backgrounds/chronicle_ash_and_ivory.jpeg',
  acts: {
    1: 'The Summons',
    2: 'The Hunt',
    3: 'Blood and Fire',
    4: 'The Cost',
  },

  npcs: {
    'Oberst Kessler': {
      clan: 'Mortal — Ahnenerbe',
      role: 'Antagonist',
      disposition: 'Methodical, patient, genuinely curious about what he has found.',
      agenda: 'Prove vampires exist. Capture one for study. Survive the war.',
      secrets: [
        'False identity — real name Hans Bremer, dead mans papers from 1934',
        'Has a partial name list already — four Kindred identified',
        'Genuinely afraid but treats fear as data',
      ],
    },
    'Hauptsturmführer Brandt': {
      clan: 'Mortal — Ahnenerbe',
      role: 'Enforcer / Combat Antagonist',
      disposition: 'Cold, professional, has faced Kindred before and prepared specifically.',
      agenda: 'Capture or neutralise the creature Kessler is tracking.',
      secrets: [
        'Was in Prague 1936. Has been preparing since.',
        'Carries silver-jacketed rounds — aggravated damage',
        'Checks in every 20 minutes. Miss a check, backup arrives.',
        'Has a wife in Munich named Clara.',
      ],
      hidden_stats: {
        Strength: 4, Dexterity: 4, Stamina: 3,
        Charisma: 2, Manipulation: 2, Composure: 5,
        Intelligence: 3, Wits: 4, Resolve: 5,
        health: 6, willpower: 6, hunger: 0,
        disciplines: {},
        notes: 'Silver rounds = aggravated. Avoids eye contact. Firearm pool 8, initiative 9.',
      },
    },
    'Miriam Szabo': {
      clan: 'Malkavian',
      role: 'Informant / Wild Card',
      disposition: 'Cryptic but coherent. She is leaving and wants something in return.',
      agenda: 'Escape Vienna before the occupation makes survival impossible.',
      secrets: [
        'She sent the envelope — using Camarilla materials deliberately',
        'She has the documents — Vasile gave them to her, not Mauer',
        'Her madness is partially performed',
        'She wants escort to the Swiss border',
      ],
    },
    'Courier Vasile': {
      clan: 'Gangrel',
      role: 'Missing / Captive',
      disposition: 'Exhausted, guilty, holding on by will alone.',
      agenda: 'Protect the seventeen names at any cost.',
      secrets: [
        'Gave documents to Miriam before capture — Kessler does not know',
        'Feeding from rats in his cell — hunger is severe',
        'Will sacrifice himself if he believes it is the only option',
      ],
      hidden_stats: {
        Strength: 3, Dexterity: 4, Stamina: 4,
        Charisma: 2, Manipulation: 2, Composure: 3,
        Intelligence: 2, Wits: 4, Resolve: 3,
        health: 7, willpower: 5, hunger: 4,
        disciplines: { Protean: 3, Fortitude: 2, Animalism: 1 },
        notes: 'Hunger 4. Can walk. Cannot fight.',
      },
    },
    'Franz Mauer': {
      clan: 'Mortal — Jewish civilian',
      role: 'Unwitting asset',
      disposition: 'Terrified, trying to do right by people who frightened him into loyalty.',
      agenda: 'Survive. Get his family out of Vienna.',
      secrets: [
        'Thinks Kindred are a secret society, not supernatural',
        'Has a sister in Bratislava',
        'Has been keeping a list of every visitor to the warehouse',
      ],
    },
  },

  endings: {
    dead_brandt_silver: {
      type: 'dead_end',
      title: 'Silver Rounds',
      text: "Brandt's aim is excellent. The first shot misses. The second catches you in the chest. Silver-jacketed. Aggravated damage blooms through your sternum like cold fire.\n\nYou fall in the alley behind the warehouse. You are still conscious when he approaches. He crouches, examines you with the expression of a man who has been waiting for this moment for two years.\n\n'Prague,' he says quietly. 'I knew there would be another.'\n\nYou do not see the sun rise. But you feel it.",
    },
    dead_frenzy_masquerade: {
      type: 'dead_end',
      title: 'The Beast Decides',
      text: "The hunger is too great. The Beast does not negotiate.\n\nYou come back to yourself in a side street off Mariahilfer Strasse. There are three mortals on the ground. One of them is a Wehrmacht soldier.\n\nThe Camarilla will not protect you from this — they will be the ones who come for you, to protect the Masquerade from what you have done.\n\nThe night finds you before dawn does.",
    },
    bad_documents_destroyed: {
      type: 'bad_end',
      title: 'Ash',
      text: "The documents burn in the Danube Canal at 5am. You watch the leather case curl and blacken and sink.\n\nKessler has four names from his own investigation. He has no documents. He has a report to write that no one in Berlin will believe.\n\nVienna falls regardless. But the Kindred survive the occupation intact.\n\nIt is not a victory. But in 1938, survival is what victory looks like.",
    },
    good_escape: {
      type: 'good_end',
      title: 'Ivory',
      image: '/backgrounds/ash-train.png',
      text: "The train west leaves Westbahnhof at 6:15am. You are on it.\n\nThe documents are ash. Kessler will write his report. No one in Berlin will act on it.\n\nVienna will fall. Vienna will suffer. But the Kindred of this city will survive the long night of occupation with their names unknown, their havens intact.\n\nYou bought them forty-eight hours. It was enough.\n\nIn this century, forty-eight hours is everything.",
    },
    perfect_the_asset: {
      type: 'perfect_end',
      title: 'The Asset',
      image: '/backgrounds/ash-train.png',
      text: "Kessler's transfer orders arrive in a week. Bucharest.\n\nHe will carry, for the rest of his life, a precise understanding of what he owes and to whom. He will bury three investigations. He will redirect two raids.\n\nThe documents are ash. Vasile walks out of the Imperial Hotel under his own power.\n\nMiriam sends a postcard from Geneva. It says only: I told you.\n\nYou leave Vienna on the last night train. In the dark, the city looks almost peaceful.\n\nIt will not be. But you knew that already.",
    },
  },

  scenes: {
    start: {
      act: 1,
      title: 'Kärntner Strasse, 2am',
      image: '/backgrounds/ash-cafe.png',
      narrative: "The envelope has been memorised. A single line: 'Courier Vasile is missing. The documents exist. Find them before dawn Thursday.'\n\nOutside the café window, Vienna has been celebrating for six hours. Wehrmacht trucks moving through the Ringstrasse to cheering crowds. A woman threw flowers. A man near the front wept. You could not tell which was sincere.\n\nThe café owner — Hofer, fifty years old — sets a glass of red wine in front of you that you did not order. His hands are shaking.\n\nYou have until Thursday dawn. Vasile runs identity documents for the Camarilla. If those documents reach the wrong hands, seventeen Kindred are exposed.\n\nHofer is watching you. He has not looked away once.",
      choices: [
        { text: 'Examine the envelope — someone sent this deliberately', next: 'examine_envelope', icon: '🔍' },
        { text: 'Hold Hofer\'s gaze. Force a conversation.', next: 'confront_hofer', icon: '👁' },
        { text: 'Leave immediately. Go to Vasile\'s address in Josefstadt.', next: 'josefstadt_direct', icon: '🚶' },
        { text: 'Find Miriam Szabo. The Malkavian has been in this city eighty years.', next: 'contact_miriam_initial', icon: '📞' },
      ],
    },

    examine_envelope: {
      act: 1,
      title: 'What the Paper Knows',
      image: '/backgrounds/ash-cafe.png',
      narrative: "The fold is exact. Three creases, perfectly parallel — the habit of someone who files correspondence for decades. Not a courier. An administrator.\n\nThe wax seal was cut with a blade, not broken. Opened and resealed. Someone read this before you.\n\nIn the lower-right corner, almost invisible: a printed number. 44. Camarilla administrative correspondence uses sequential reference codes. This envelope originated inside the network.\n\nSomeone is sending you an unofficial warning through official materials. A very short list of people who could do that.\n\nYou look up. Hofer's hands have stopped shaking. He is looking at the bar now, deliberately not at you. That is worse.",
      check: {
        type: 'mental',
        label: 'Wits + Investigation — read the full picture',
        pool_label: 'WIT + Investigation',
        pool: (c: any) => (c.attributes?.Wits || 2) + (c.skills?.Investigation || 0),
        hunger: (c: any) => c.hunger || 1,
        difficulty: 2,
        success_next: 'examine_success',
        fail_next: 'examine_partial',
        success_text: 'Every thread connects.',
        fail_text: 'You see the code. You miss what it means.',
      },
      flags_set: ['examined_envelope', 'knows_code_44'],
    },

    examine_success: {
      act: 1,
      title: 'Already Reported',
      narrative: "Hofer intercepted this before you. He was paid to read it and paid to watch for whoever came to collect it.\n\nHe reported your presence before you sat down. Whoever he works for already knows you are here.\n\nThe code 44 says the sender is Camarilla. Hofer's behaviour says someone else is also watching. You are caught between two sets of eyes, and you have been from the moment you walked through the door.",
      flags_set: ['kessler_knows_player', 'understands_double_watch'],
      choices: [
        { text: 'Lean on Hofer. Get the name.', next: 'confront_hofer', icon: '👁' },
        { text: 'Leave quietly. You know what you know.', next: 'josefstadt_wise', icon: '🚶' },
        { text: 'Find Miriam. She sent this.', next: 'contact_miriam_initial', icon: '📞' },
      ],
    },

    examine_partial: {
      act: 1,
      title: 'Half the Picture',
      narrative: "You catch the code — internal Camarilla. Someone inside the network sent this warning. But Hofer's behaviour doesn't register as the threat it is.\n\nYou leave the café without understanding that you have already been reported.",
      choices: [
        { text: 'Go to Vasile\'s address in Josefstadt', next: 'josefstadt_direct', icon: '🚶' },
        { text: 'Find Miriam Szabo', next: 'contact_miriam_initial', icon: '📞' },
      ],
    },

    confront_hofer: {
      act: 1,
      title: 'Hofer Talks',
      narrative: "You hold his gaze across the bar until he cannot look away.\n\n'You opened it,' you say.\n\nHe doesn't deny it. His voice drops. 'They come every week. Since January. Two men. They show papers. They pay well.' He sets down a glass carefully, as if noise might summon someone. 'Tonight they asked specifically about you. By description.'\n\nHe hasn't called them yet. You can tell by the way he's still breathing.",
      check: {
        type: 'social',
        label: 'Charisma + Persuasion — keep him talking',
        pool_label: 'CHA + Persuasion',
        pool: (c: any) => (c.attributes?.Charisma || 2) + (c.skills?.Persuasion || 0),
        hunger: (c: any) => c.hunger || 1,
        difficulty: 2,
        success_next: 'hofer_gives_name',
        fail_next: 'hofer_calls',
        success_text: 'His fear of you edges past his fear of them.',
        fail_text: 'He reaches for the telephone.',
      },
    },

    hofer_gives_name: {
      act: 1,
      title: 'Kessler',
      narrative: "'Oberst Kessler,' Hofer says. 'Ahnenerbe. He has rooms at the Imperial Hotel. Six weeks.'\n\nAhnenerbe. The SS occult research division. They are categorically not supposed to know that Kindred exist.\n\n'He also asked about a man named Vasile,' Hofer adds. 'Three days ago. He had a photograph.'\n\nYou tell Hofer to take his family and visit his brother in Graz for a week. Not to ask why.\n\nHe goes.",
      flags_set: ['knows_kessler', 'kessler_hotel_imperial', 'hofer_warned'],
      choices: [
        { text: 'Go to Vasile\'s address in Josefstadt', next: 'josefstadt_wise', icon: '🚶' },
        { text: 'Find Miriam Szabo first', next: 'contact_miriam_initial', icon: '📞' },
        { text: 'Go straight to the Imperial Hotel', next: 'imperial_approach_informed', icon: '🏨' },
      ],
    },

    hofer_calls: {
      act: 1,
      title: 'The Call',
      narrative: "He lifts the receiver before you can stop him. He says three words and hangs up.\n\nYou leave fast. Boots on cobblestones two blocks away, moving toward the café.",
      flags_set: ['kessler_knows_player', 'watchers_incoming'],
      choices: [
        { text: 'Move. Josefstadt.', next: 'josefstadt_direct', icon: '💨' },
        { text: 'Find Miriam. She is closer.', next: 'contact_miriam_urgent', icon: '📞' },
      ],
    },

    josefstadt_direct: {
      act: 1,
      title: 'Laudongasse',
      narrative: "Vasile's flat is a third-floor walk-up on Laudongasse. Two men in civilian clothes stand at the corner facing different directions. Watchers.\n\nThe flat's windows are dark. The building door is ajar.",
      check: {
        type: 'physical',
        label: 'Dexterity + Stealth — approach unseen',
        pool_label: 'DEX + Stealth',
        pool: (c: any) => (c.attributes?.Dexterity || 2) + (c.skills?.Stealth || 0),
        hunger: (c: any) => c.hunger || 1,
        difficulty: 2,
        success_next: 'josefstadt_flat',
        fail_next: 'josefstadt_spotted',
        success_text: 'Shadows and patience.',
        fail_text: 'One watcher turns at exactly the wrong moment.',
      },
    },

    josefstadt_wise: {
      act: 1,
      title: 'Laudongasse — Careful',
      narrative: "You circle the block twice. Two watchers. A third-floor window cracked open despite the cold. The building door ajar — recently.\n\nSomeone left in a hurry. Or was taken in a hurry.",
      check: {
        type: 'physical',
        label: 'Dexterity + Stealth — approach unseen',
        pool_label: 'DEX + Stealth',
        pool: (c: any) => (c.attributes?.Dexterity || 2) + (c.skills?.Stealth || 0),
        hunger: (c: any) => c.hunger || 1,
        difficulty: 1,
        success_next: 'josefstadt_flat',
        fail_next: 'josefstadt_spotted',
        success_text: 'Clean approach.',
        fail_text: 'Even careful is not careful enough tonight.',
      },
    },

    josefstadt_flat: {
      act: 1,
      title: 'The Flat',
      narrative: "Vasile's flat has been searched professionally — drawers replaced not emptied, cushions repositioned not slashed.\n\nThey missed two things.\n\nFirst: a loose brick behind the fireplace. Inside: a woman's earring and a receipt for a café on Taborstrasse dated two days ago.\n\nSecond: on the inside of the wardrobe door, written very small in pencil: M.Sz. knows.\n\nMiriam Szabo. And under those words, in different ink: If found — do not trust the warehouse. It is watched.",
      flags_set: ['found_flat_clues', 'vasile_warned_about_warehouse', 'miriam_connection'],
      choices: [
        { text: 'The café on Taborstrasse. That is where Miriam operates.', next: 'contact_miriam_with_clues', icon: '📞' },
        { text: 'Go to the warehouse anyway', next: 'warehouse_watched', icon: '🏭' },
        { text: 'Imperial Hotel. Kessler has Vasile.', next: 'imperial_approach_informed', icon: '🏨' },
      ],
    },

    josefstadt_spotted: {
      act: 1,
      title: 'Burned',
      narrative: "The watcher turns. Your eyes meet.\n\nYou run. Three streets, a rooftop, a service entrance. Clear in four minutes. But you did not reach the flat.\n\nKessler now knows someone is working against him.",
      flags_set: ['kessler_knows_player', 'josefstadt_burned'],
      choices: [
        { text: 'Find Miriam Szabo', next: 'contact_miriam_urgent', icon: '📞' },
        { text: 'The Imperial Hotel. Take it directly to Kessler.', next: 'imperial_approach_informed', icon: '🏨' },
      ],
    },

    contact_miriam_initial: {
      act: 1,
      title: 'Taborstrasse',
      image: '/backgrounds/ash-miriam.png',
      narrative: "The bookshop on Taborstrasse. Miriam Szabo is sitting in the back room with a Hungarian newspaper folded open to the crossword. She does not look up.\n\n'I wondered when you would come,' she says. Her accent is unguarded tonight. 'I sent the envelope. I used Camarilla materials because I wanted you to know it was real.'\n\nShe sets down the paper. When she looks at you, her eyes are sharper than the Malkavian reputation suggests.\n\n'I have what you are looking for. All of it. Vasile gave it to me before they took him.' A pause. 'But I want something in return.'",
      flags_set: ['miriam_contacted', 'miriam_has_documents', 'knows_miriam_sent_envelope'],
      choices: [
        { text: 'Ask what she wants', next: 'miriam_wants', icon: '🎭' },
        { text: 'Ask why she did not tell the Camarilla directly', next: 'miriam_why_hidden', icon: '🔍' },
        { text: 'Ask where Vasile is', next: 'miriam_vasile_location', icon: '❓' },
      ],
    },

    contact_miriam_with_clues: {
      act: 1,
      title: 'Taborstrasse — You Know Things',
      narrative: "Miriam looks up when you enter. Takes in your expression. Puts the paper down.\n\n'You have been to the flat,' she says.\n\n'M.Sz. knows,' you say.\n\nSomething in her relaxes. 'Good. He trusted the right person.' She gestures to the chair across from her. 'I sent the envelope. I have the documents — Vasile gave them to me the night before they took him. I also know where he is.'\n\nShe folds her hands. 'And I want something in return for all of this.'",
      flags_set: ['miriam_contacted', 'miriam_has_documents', 'knows_miriam_sent_envelope', 'miriam_respects_player'],
      next: 'miriam_wants',
    },

    contact_miriam_urgent: {
      act: 1,
      title: 'Taborstrasse — Urgent',
      narrative: "Miriam is at the door when you arrive, a small case at her feet, coat on.\n\n'I was wondering how long,' she says. 'I have the documents — Vasile gave them to me three nights ago. Vasile is at the Imperial Hotel, Kessler's suite, Room 14.'\n\nShe picks up the case. 'I am leaving Vienna tonight. I will help you with one thing before I go. Choose carefully.'",
      flags_set: ['miriam_contacted', 'miriam_has_documents', 'miriam_leaving', 'knows_vasile_location', 'kessler_hotel_imperial'],
      choices: [
        { text: 'Tell me Kessler\'s vulnerabilities', next: 'miriam_kessler_weakness', icon: '🔍' },
        { text: 'Create a distraction at the Imperial Hotel', next: 'miriam_distraction', icon: '💥' },
        { text: 'Help me plan an escape route out of Vienna', next: 'miriam_escape_route', icon: '🚂' },
      ],
    },

    miriam_wants: {
      act: 1,
      title: 'Her Price',
      image: '/backgrounds/ash-miriam.png',
      narrative: "'I want to leave Vienna,' Miriam says. 'I have been here eighty years. I know what occupations feel like. This one will be worse than most.'\n\nShe moves to the window. In the street below, a column of Wehrmacht trucks moves east, slow and heavy.\n\n'The Camarilla will not evacuate me. But you need what I have — the documents, Vasile's location, and something else. About Kessler. About what made him afraid of your kind in the first place.'\n\nShe turns. 'Get me to Switzerland. I will give you everything.'",
      choices: [
        { text: 'Agree — you will escort her to the Swiss border', next: 'miriam_deal_made', icon: '🤝' },
        { text: 'Agree provisionally — information first, then you will see', next: 'miriam_deal_partial', icon: '🎭' },
        { text: 'Press her — what does she know about Kessler?', next: 'miriam_kessler_weakness', icon: '🔍' },
      ],
    },

    miriam_deal_made: {
      act: 1,
      title: 'The Agreement',
      narrative: "She nods once. No handshake. Among the Kindred your word is either worth something or it is not.\n\n'Vasile is in Room 14 of the Imperial Hotel. He has not broken — but he will by dawn Thursday. Kessler has a man named Brandt doing the interrogation. SS. He was in Prague in 1936.'\n\nShe lets that land.\n\n'Prague is why Kessler is difficult to Dominate. Brandt is why Kessler is still alive after six months investigating your kind. He is prepared in ways Kessler is not. He carries silver-jacketed ammunition.'\n\nShe hands you the leather case. Inside: a sealed document packet. Seventeen names and addresses.",
      flags_set: ['miriam_deal', 'knows_vasile_location', 'has_documents', 'knows_brandt', 'brandt_aware', 'kessler_hotel_imperial'],
      choices: [
        { text: 'Go to the Imperial Hotel', next: 'imperial_approach_informed', icon: '🏨' },
        { text: 'Tell me more about Brandt first', next: 'miriam_brandt_detail', icon: '🔍' },
      ],
    },

    miriam_deal_partial: {
      act: 1,
      title: 'Half Now',
      narrative: "She studies you. Decides.\n\n'Half now. Half when we reach the border.'\n\nShe gives you Vasile's location — Room 14, Imperial Hotel — and tells you about Brandt. The man Kessler keeps for situations like this. SS. Ahnenerbe specialist. Prague 1936.\n\n'He carries silver ammunition. He avoids eye contact. He checks in every twenty minutes.'\n\nThe document case she keeps. 'When Vasile is free and we are on a train, you get the rest.'",
      flags_set: ['miriam_deal_partial', 'knows_vasile_location', 'knows_brandt', 'brandt_aware', 'kessler_hotel_imperial'],
      choices: [
        { text: 'Go to the Imperial Hotel', next: 'imperial_approach_informed', icon: '🏨' },
      ],
    },

    miriam_kessler_weakness: {
      act: 1,
      title: 'Prague, 1936',
      narrative: "'There was a Kindred in Prague. Old. She made the mistake of trying to Dominate a group of Ahnenerbe agents as a demonstration.\n\nShe overcommitted. Kessler was in the room. The Domination hit him wrong — partial resistance, fragmented implanted memory, but also an inoculation. His mind built scar tissue around the experience.'\n\nMiriam hands you a folded paper. 'Kessler's real name. Hans Bremer. The original Kessler died in Dachau in 1934. If that became known to the right people inside the Reich structure—' She leaves the rest unsaid.",
      flags_set: ['knows_kessler_weakness', 'knows_brandt', 'has_kessler_leverage', 'brandt_aware'],
      next: 'miriam_wants',
    },

    miriam_brandt_detail: {
      act: 1,
      title: 'Know Your Enemy',
      narrative: "'Brandt served in the 89th Infantry before Ahnenerbe. Excellent marksman. Wife in Munich — Clara. He thinks about her when under stress; you can see it in his hands.\n\nHe carries six silver-jacketed rounds. Knows not to look at your eyes. Knows fire and sunlight are dangerous. Does not know about hunger — about what it does to your judgment. That is your advantage.\n\nHe checks in every twenty minutes. If he misses a check, Kessler calls for backup. You have a window.\n\nDo not make him shoot first.'",
      flags_set: ['brandt_detailed', 'knows_brandt_weakness'],
      choices: [
        { text: 'Go to the Imperial Hotel', next: 'imperial_approach_informed', icon: '🏨' },
      ],
    },

    miriam_distraction: {
      act: 1,
      title: 'The Alarm',
      narrative: "Miriam makes a phone call from Klein's desk. Eleven minutes later, a fire alarm triggers in the east wing of the Imperial Hotel.\n\nShe hands you the document case while the alarm is still ringing. 'Vasile is in Room 14. You have eight minutes before Brandt realises it is a distraction.'",
      flags_set: ['miriam_deal', 'has_documents', 'knows_vasile_location', 'hotel_alarm_active', 'brandt_aware'],
      next: 'hotel_room_14',
    },

    miriam_escape_route: {
      act: 1,
      title: 'The Way Out',
      narrative: "'The Westbahn line to Salzburg, then south to Innsbruck and over the Brenner. But the borders will start closing within days.'\n\nShe opens a drawer and removes two sets of papers. 'Swiss residency documentation. Very good forgeries — Nosferatu in Zurich owe me a favour.'\n\nShe hands you one set. 'The 6:15 train from Westbahnhof. We leave together.'",
      flags_set: ['miriam_deal', 'has_escape_papers', 'miriam_escape_planned'],
      next: 'miriam_wants',
    },

    miriam_why_hidden: {
      act: 1,
      title: 'Why Not the Camarilla',
      narrative: "'Because the Camarilla would have sent someone competent,' she says, with the flatness of a person who has been disappointed many times. 'And competent people ask questions I do not want to answer.'\n\nA pause. 'I sent the envelope to you because you are new enough to be desperate and capable enough not to be useless.'",
      flags_set: ['knows_camarilla_watching'],
      next: 'miriam_wants',
    },

    miriam_vasile_location: {
      act: 1,
      title: 'Where Vasile Is',
      narrative: "'Imperial Hotel. Room 14, ground floor, east wing.' She says it without checking notes. 'He has been there two days. He has not broken — Vasile is stubborn in the way Gangrel are stubborn. But everyone reaches their limit. Brandt is patient.'",
      flags_set: ['knows_vasile_location', 'kessler_hotel_imperial'],
      next: 'miriam_wants',
    },

    warehouse_watched: {
      act: 2,
      title: 'Leopoldstadt — Watched',
      narrative: "The warehouse on the canal road has two men in a parked car outside. They arrived forty minutes ago and have not moved. Kessler's people.\n\nVasile was right. Going in through the front means walking into them.",
      choices: [
        { text: 'Approach through the back — canal side entrance', next: 'imperial_approach_informed', icon: '💨' },
        { text: 'Leave it. Find Miriam instead.', next: 'contact_miriam_initial', icon: '📞' },
      ],
    },

    hunger_pressure: {
      act: 1,
      title: 'The Cost of Restraint',
      narrative: "You have been in motion for three hours. The city is full of warm bodies — soldiers celebrating, civilians watching from windows, drunken revellers.\n\nThe hunger does not ignore this.\n\nIt is not an urge. It is a voice, and it is making a rational argument: you are going into something dangerous at reduced capacity. Feeding now is not weakness. It is preparation.\n\nThe argument is not wrong. That is the problem with the Beast — it is almost never entirely wrong.\n\nA Wehrmacht soldier has separated from his group. Sitting on a bench near the Naschmarkt, head back, half-asleep.",
      choices: [
        { text: 'Feed. You need full strength for what comes next.', next: 'hunger_feed_soldier', icon: '🩸' },
        { text: 'Resist. You do not feed from soldiers.', next: 'hunger_resist', icon: '✋' },
        { text: 'Find a more discreet vessel — the nightclubs always have willing participants.', next: 'hunger_careful_feed', icon: '🎭' },
      ],
    },

    hunger_feed_soldier: {
      act: 1,
      title: 'The Easy Choice',
      narrative: "You feed quickly. The soldier will not remember.\n\nHunger drops. Clarity returns. And with it, something else: the awareness of what you just did. A Wehrmacht soldier, drunk and separated, who has probably done things in the last six hours you would not want to know about.\n\nIt was the easy choice. The Beast made a rational argument. You agreed.\n\nThat is how it always starts.",
      flags_set: ['fed_from_soldier', 'humanity_stain'],
      hunger_change: -2,
      next: 'act2_approach',
    },

    hunger_resist: {
      act: 1,
      title: 'The Hard Choice',
      narrative: "You leave him there. Asleep on his bench, ignorant, warm.\n\nThe hunger settles, patient, into the back of your awareness. It will be there for everything that follows — every roll, every confrontation, every moment when you need to be faster or stronger than you are.\n\nYou chose restraint. It will cost something, somewhere. That is the deal.",
      flags_set: ['hunger_stays_high'],
      next: 'act2_approach',
    },

    hunger_careful_feed: {
      act: 1,
      title: 'A Considered Approach',
      narrative: "The bar near the Opernring caters to a specific clientele — theatre people, artists, the kind of Viennese who have always known the night contains stranger things than most admit.\n\nA young musician, unhappy about the Anschluss in the way artists are unhappy — loudly, as if their unhappiness constitutes resistance. When you turn the full weight of your attention on him, he is entirely willing.\n\nA clean feed. A merciful one, by the standards of your existence.",
      flags_set: ['clean_feed', 'humanity_intact'],
      hunger_change: -1,
      next: 'act2_approach',
    },

    act2_approach: {
      act: 2,
      title: 'Convergence',
      narrative: "Vienna at 3am has a different quality from Vienna at midnight. The celebration has curdled. Groups of men standing at intersections for no clear reason. A Jewish shop owner boarding up his windows by lamplight, working fast, not looking at anyone.\n\nThree threads to pull. The documents. Vasile. Kessler.\n\nAnd somewhere in the background: Brandt.",
      choices: [
        { text: 'Imperial Hotel — free Vasile and face Kessler', next: 'imperial_approach_informed', icon: '🏨' },
        { text: 'Find Miriam first if you have not already', next: 'contact_miriam_initial', icon: '📞' },
      ],
    },

    imperial_approach_informed: {
      act: 2,
      title: 'The Imperial Hotel',
      narrative: "The grandest hotel in Vienna is currently full of German officers celebrating the Anschluss. The lobby smells of cognac and fresh uniforms.\n\nRoom 14 is ground floor, east wing. Brandt checks in every twenty minutes — which means he is either with Vasile or nearby. You have observed for fifteen minutes: one man passes the east corridor every eight minutes.\n\nHow you approach this matters.",
      choices: [
        { text: 'Obfuscate — walk past the guards invisible', next: 'hotel_obfuscate', icon: '👻', requires_discipline: 'Obfuscate' },
        { text: 'Social — you belong here, and your presence projects that', next: 'hotel_social', icon: '🎩' },
        { text: 'Service entrance — through the kitchen and staff corridors', next: 'hotel_service', icon: '🚪' },
        { text: 'Direct — knock on Room 14. Meet Kessler on your terms.', next: 'kessler_direct_knock', icon: '✊' },
      ],
    },

    hotel_obfuscate: {
      act: 2,
      check: {
        type: 'discipline',
        label: 'Wits + Obfuscate — Cloak of Shadows',
        pool_label: 'WIT + Obfuscate',
        pool: (c: any) => (c.attributes?.Wits || 2) + (c.disciplines?.Obfuscate || 0),
        hunger: (c: any) => c.hunger || 1,
        difficulty: 2,
        success_next: 'hotel_room_14',
        fail_next: 'hotel_spotted_brandt',
        success_text: 'You are furniture. A shadow on the wall.',
        fail_text: 'Hunger makes concentration difficult. Brandt steps out of a doorway ahead.',
      },
    },

    hotel_social: {
      act: 2,
      check: {
        type: 'social',
        label: 'Charisma + Etiquette — you belong here',
        pool_label: 'CHA + Etiquette',
        pool: (c: any) => (c.attributes?.Charisma || 2) + (c.skills?.Etiquette || 0),
        hunger: (c: any) => c.hunger || 1,
        difficulty: 2,
        success_next: 'hotel_room_14',
        fail_next: 'hotel_spotted_brandt',
        success_text: 'An SS colonel invites you for a drink. You decline graciously and slip away.',
        fail_text: 'Brandt is at the end of the corridor. He does not look at you directly. But he stops walking.',
      },
    },

    hotel_service: {
      act: 2,
      check: {
        type: 'physical',
        label: 'Dexterity + Stealth — service corridors',
        pool_label: 'DEX + Stealth',
        pool: (c: any) => (c.attributes?.Dexterity || 2) + (c.skills?.Stealth || 0),
        hunger: (c: any) => c.hunger || 1,
        difficulty: 2,
        success_next: 'hotel_room_14',
        fail_next: 'hotel_spotted_brandt',
        success_text: 'Linen cupboards. A pass-through kitchen. You emerge ten meters from Room 14.',
        fail_text: 'A night porter opens a door directly into your path. He shouts.',
      },
    },

    hotel_spotted_brandt: {
      act: 2,
      title: 'Brandt',
      image: '/backgrounds/ash-brandt.png',
      narrative: "He does not call for help. He does not reach for his weapon immediately. He turns to face you, hands visible, and says in careful German: 'I was expecting someone.'\n\nHis eyes focus on your collar. Not your face.\n\n'I know not to look at you directly,' he says. 'I know you can make me forget this conversation if I do.' A pause. 'I have been preparing for two years. I would like to talk before this becomes something neither of us wants.'",
      flags_set: ['brandt_confrontation', 'brandt_knows_player'],
      choices: [
        { text: 'Talk. He clearly knows things.', next: 'brandt_talk', icon: '🤝' },
        { text: 'Act before he reaches his weapon.', next: 'brandt_fight_first', icon: '⚔️' },
        { text: 'Use a Discipline — Dominate or Presence', next: 'brandt_discipline', icon: '🟣' },
      ],
    },

    brandt_talk: {
      act: 2,
      title: 'What Brandt Knows',
      image: '/backgrounds/ash-brandt.png',
      narrative: "'I was in Prague,' he says. Very still. 'I saw what your kind can do. I also saw what Kessler became after — the partial resistance, the obsession.'\n\nHe keeps his hands visible. Silver ammunition in his jacket.\n\n'Kessler's investigation ends tonight either way — he has received orders to consolidate in Berlin. But he will not leave without answers.'\n\nBrandt glances at your collar. 'The courier in Room 14 — he is going to break. Not because we are cruel. Because it has been three days and he has not fed and that is what that does to your kind, is it not? The hunger.'",
      choices: [
        { text: 'He is right about everything. Negotiate.', next: 'brandt_negotiate', icon: '🤝' },
        { text: 'He knows too much. This conversation ends here.', next: 'brandt_fight_after_talk', icon: '⚔️' },
        { text: 'Ask about Kessler\'s real name — test if he knows it too', next: 'brandt_kessler_name', icon: '🔍' },
      ],
    },

    brandt_negotiate: {
      act: 2,
      title: 'Terms',
      narrative: "'What I want,' Brandt says slowly, 'is to survive the war. I am the only person in the Reich who knows your kind exists and also knows that Ahnenerbe's approach is suicidal.'\n\nHe reaches into his pocket very slowly and removes a notebook. Sets it on a side table.\n\n'Every name and location I have compiled in two years. Not the official report — Kessler has that. My notes. All of it.'\n\nHe pushes the notebook toward you. 'In exchange: whoever you report to should know that Hauptsturmführer Brandt is available as an asset. When the war turns — and it will — you will want allies inside the structure.'",
      flags_set: ['brandt_deal_offered', 'has_brandt_notes'],
      choices: [
        { text: 'Accept. This is extraordinarily useful.', next: 'brandt_deal_accepted', icon: '🤝' },
        { text: 'Accept and Dominate him to forget this meeting.', next: 'brandt_deal_dominate', requires_discipline: 'Dominate', icon: '👁' },
        { text: 'Refuse. You do not make deals with the SS.', next: 'brandt_fight_after_talk', icon: '⚔️' },
      ],
    },

    brandt_deal_accepted: {
      act: 2,
      title: 'An Unusual Alliance',
      narrative: "You take the notebook. Brandt relaxes by a fraction.\n\n'The courier is at the end of this corridor. Kessler is in Room 14. You have twelve minutes before I am supposed to check in.'\n\nHe steps aside.\n\n'One more thing,' he says, to your back. 'Prague. The elder who tried to Dominate us. We killed her. In case you are wondering if we are capable of that. I want you to know the answer before we agree to trust each other.'",
      flags_set: ['brandt_asset', 'has_brandt_notes', 'vasile_room_location'],
      next: 'vasile_rescue',
    },

    brandt_deal_dominate: {
      act: 2,
      check: {
        type: 'discipline',
        label: 'Manipulation + Dominate — Mesmerize and rewrite',
        pool_label: 'MAN + Dominate',
        pool: (c: any) => (c.attributes?.Manipulation || 2) + (c.disciplines?.Dominate || 0),
        hunger: (c: any) => c.hunger || 1,
        difficulty: 3,
        success_next: 'brandt_dominate_success',
        fail_next: 'brandt_immune',
        success_text: 'His eyes glaze. You speak carefully. When he comes back, he will remember a different conversation.',
        fail_text: 'Something in his mind resists. Prague left scar tissue.',
      },
    },

    brandt_dominate_success: {
      act: 2,
      title: 'Rewritten',
      narrative: "The deal is real. The memory is not. He will wake believing he conducted a routine patrol and found nothing unusual.\n\nThe notebook is yours. Vasile is at the end of the corridor.",
      flags_set: ['brandt_asset', 'has_brandt_notes', 'brandt_dominate_success', 'vasile_room_location'],
      next: 'vasile_rescue',
    },

    brandt_immune: {
      act: 2,
      title: 'Prague Again',
      narrative: "He blinks. Shakes his head once. His hand moves to his jacket.\n\n'Prague,' he says quietly. 'I knew there would be a day.'\n\nHe draws the weapon.",
      flags_set: ['brandt_hostile', 'fight_unavoidable'],
      next: 'brandt_fight',
    },

    brandt_kessler_name: {
      act: 2,
      title: 'Hans Bremer',
      narrative: "Something crosses Brandt's face.\n\n'Where did you hear that name?' A very long pause. 'It does not matter. Yes. I know. I have known since 1935.' He exhales. 'He saved my life in Prague. I have never found the right time to decide what that means for my loyalties.'",
      flags_set: ['brandt_conflicted', 'knows_brandt_knows_kessler_secret'],
      next: 'brandt_negotiate',
    },

    brandt_discipline: {
      act: 2,
      check: {
        type: 'discipline',
        label: 'Dominate or Presence — stop him cold',
        pool_label: 'MAN + Dominate or CHA + Presence',
        pool: (c: any) => Math.max(
          (c.attributes?.Manipulation || 2) + (c.disciplines?.Dominate || 0),
          (c.attributes?.Charisma || 2) + (c.disciplines?.Presence || 0)
        ),
        hunger: (c: any) => c.hunger || 1,
        difficulty: 3,
        success_next: 'vasile_rescue',
        fail_next: 'brandt_immune',
        success_text: 'He freezes. Whatever he was about to do, he no longer wants to do it.',
        fail_text: 'He knew this was coming. His eyes are already on the floor.',
      },
    },

    brandt_fight_first: {
      act: 2,
      title: 'First Move',
      narrative: "You close the distance before he can draw. He is fast — trained, prepared — but he did not expect you to commit immediately.\n\nThe fight is in a hotel corridor. Guests two rooms away. Every sound matters.",
      next: 'brandt_fight',
    },

    brandt_fight_after_talk: {
      act: 2,
      title: 'No Deal',
      narrative: "'I understand,' Brandt says. And then he draws, very smoothly, with the practiced motion of someone who knew this was the probable outcome.\n\nSilver-jacketed rounds.",
      flags_set: ['brandt_hostile'],
      next: 'brandt_fight',
    },

    brandt_fight: {
      act: 2,
      title: 'Hauptsturmführer Brandt',
      image: '/backgrounds/ash-brandt.png',
      narrative: "Brandt is not like the men in the warehouse. He does not flinch at your speed. He does not freeze at your eyes. He keeps moving, keeps distance, uses the corridor geometry with the ease of someone who has thought carefully about fighting in confined spaces against something faster than him.\n\nHis first shot misses deliberately — a warning, or recalibration. The second will not.\n\nEvery shot is a Masquerade breach. End this fast.",
      combat: {
        label: 'Hauptsturmführer Brandt',
        description: 'A trained SS officer who prepared specifically for this encounter. Silver-jacketed rounds deal aggravated damage.',
        enemies: [
          {
            id: 'brandt',
            name: 'Hauptsturmführer Brandt',
            clan: 'Mortal',
            generation: 0,
            attackPool: 8,
            defensePool: 8,
            maxHealth: 6,
            maxWillpower: 6,
            hunger: 0,
            damageType: 'aggravated',
            baseDamage: 2,
            disciplines: {},
            description: 'Avoids eye contact. Silver rounds. Has been preparing for two years.',
          },
        ],
        victory_next: 'brandt_fight_win',
        defeat_next: 'dead_brandt_silver',
      },
    },

    brandt_fight_win: {
      act: 2,
      title: 'Down, Not Dead',
      narrative: "Brandt is unconscious on the corridor floor. Three ribs broken, disarmed, breathing.\n\nYou have his weapon. Six silver-jacketed rounds.\n\nSomeone heard the struggle. Four minutes before someone opens a door.\n\nVasile is at the end of this corridor. Kessler is in Room 14.",
      flags_set: ['brandt_incapacitated', 'has_silver_rounds'],
      choices: [
        { text: 'Free Vasile. Get out immediately.', next: 'vasile_rescue', icon: '💨' },
        { text: 'Free Vasile, then deal with Kessler.', next: 'vasile_rescue_then_kessler', icon: '⚔️' },
        { text: 'Go straight to Kessler while Brandt is down.', next: 'kessler_direct_knock', icon: '🚪' },
      ],
    },

    hotel_room_14: {
      act: 2,
      title: 'Room 14',
      narrative: "Vasile is in the adjoining room. Three days without feeding. Hunger evident in the way he holds himself — carefully, like a man trying not to think about what he wants.\n\nHe sees you and something releases. Not relief. The resolution of a man who has been waiting to see if help was coming and now knows the answer.",
      choices: [
        { text: 'Free Vasile immediately and run', next: 'vasile_rescue', icon: '💨' },
        { text: 'Search the room first — understand what Kessler knows', next: 'search_kessler_room', icon: '🔍' },
        { text: 'Wait for Kessler — ambush him here on your terms', next: 'kessler_ambush', icon: '⚔️' },
      ],
    },

    kessler_direct_knock: {
      act: 2,
      title: 'Room 14 — Direct',
      narrative: "You knock.\n\nA pause. Then: 'Come in.'\n\nKessler is at his desk. Files open. When he looks up at you, his expression is the controlled stillness of a man who has been expecting something like this and has still not quite decided how to feel about being right.",
      flags_set: ['kessler_direct_meeting'],
      next: 'kessler_meeting',
    },

    search_kessler_room: {
      act: 2,
      title: 'The Research',
      narrative: "Six months of work. Kessler is meticulous. He does not know what Kindred are — but he knows there are people who do not age, who avoid sunlight, who leave no photographic trace.\n\nHe has four names. Seventeen if he gets Vasile's documents. One of the four is yours.\n\nOn the desk: a draft letter to Berlin, requesting authorisation for expanded detention protocols. Dated tomorrow.",
      flags_set: ['knows_kessler_research', 'kessler_has_four_names'],
      choices: [
        { text: 'Burn everything — his research, the letter, all of it', next: 'burn_research', icon: '🔥' },
        { text: 'Free Vasile and go', next: 'vasile_rescue', icon: '💨' },
        { text: 'Wait for Kessler', next: 'kessler_ambush', icon: '⚔️' },
      ],
    },

    burn_research: {
      act: 2,
      title: 'Burning the Thread',
      narrative: "The files burn well. Four minutes.\n\nYou free Vasile. He can walk, barely. You are in the service corridor when you hear Kessler return and the silence that follows.\n\nHe knows. He will rebuild. But starting again takes time, and time in 1938 is the one thing no one has.",
      flags_set: ['research_burned', 'vasile_freed'],
      next: 'act3_resolution',
    },

    kessler_ambush: {
      act: 2,
      title: 'The Ambush',
      narrative: "Kessler returns at 4am. He enters and stops — the trained stillness of a man who senses something wrong. His hand goes to his jacket.",
      check: {
        type: 'combat',
        label: 'Initiative — strike before he draws',
        pool_label: 'WIT + Composure',
        pool: (c: any) => (c.attributes?.Wits || 2) + (c.attributes?.Composure || 2),
        hunger: (c: any) => c.hunger || 1,
        difficulty: 2,
        success_next: 'kessler_captured',
        fail_next: 'kessler_armed_standoff',
        success_text: 'You move. He does not get to the gun.',
        fail_text: 'He is faster than expected.',
        damage: 1,
      },
    },

    vasile_rescue: {
      act: 2,
      title: 'Finding Vasile',
      narrative: "The room at the end of the east corridor. Not locked — why lock the door when Brandt is the lock?\n\nVasile is against the wall. Three days without feeding. He looks at you and his first question is:\n\n'Did you get the documents?'",
      flags_set: ['vasile_found'],
      choices: [
        { text: 'Yes — they are safe', next: 'vasile_docs_safe', icon: '✓' },
        { text: 'No — burned or lost', next: 'vasile_no_docs', icon: '✗' },
        { text: 'Can you walk? We can talk later.', next: 'vasile_can_walk', icon: '💨' },
      ],
    },

    vasile_rescue_then_kessler: {
      act: 2,
      title: 'And Then',
      narrative: "Vasile is on his feet. He takes in Brandt's unconscious form without comment.\n\n'Kessler?' he asks.\n\n'One more thing.'",
      flags_set: ['vasile_freed', 'vasile_with_player'],
      next: 'kessler_meeting',
    },

    vasile_docs_safe: {
      act: 2,
      narrative: "He exhales — a long, slow breath. 'Good. Let us go.' He stands. Steadier than he should be.\n\n'Gangrel,' he says, as if that explains everything. It does.",
      flags_set: ['vasile_cooperative', 'vasile_intact'],
      next: 'act3_resolution',
    },

    vasile_no_docs: {
      act: 2,
      narrative: "Vasile closes his eyes. 'Then Kessler has what he needs whether I am free or not.' He opens them with flat clarity. 'I am going to Kessler directly. Trade myself for the names.'\n\nHe means it.",
      choices: [
        { text: 'Let him — the names matter more than one courier', next: 'vasile_sacrificed', icon: '💀' },
        { text: 'Stop him — this ends badly', next: 'act3_resolution', icon: '✋' },
      ],
    },

    vasile_can_walk: {
      act: 2,
      narrative: "'Yes.' He stands. 'Hunger is at four. I can walk. I cannot fight.' He looks at your face. 'Neither of us should be in a fight right now. What is the extraction?'",
      flags_set: ['vasile_high_hunger'],
      next: 'act3_resolution',
    },

    vasile_sacrificed: {
      act: 2,
      narrative: "Vasile walks into the Imperial Hotel at 5am and does not come out.\n\nThe documents are returned to the Camarilla three days later, incomplete. What happens to Vasile after that, no record shows.",
      ending: 'bad_documents_destroyed',
    },

    kessler_captured: {
      act: 3,
      title: 'The Oberst',
      narrative: "Kessler is on the floor, wrist pinned, gun across the room. He is not panicking. He is observing. Even now, even with your hand at his throat, he is taking notes.\n\n'So,' he says. 'Prague was real after all.'\n\nHe is not afraid. Or rather — he is, but he has decided to treat the fear as data.",
      flags_set: ['kessler_captured', 'kessler_knows_truth'],
      next: 'kessler_choice',
    },

    kessler_armed_standoff: {
      act: 3,
      title: 'Standoff',
      narrative: "Kessler has the gun. You have superior speed. The room is dark. Neither of you moves.\n\n'I am not going to shoot unless you make me,' he says. 'I want to talk. I have wanted to talk to one of you for two years.'\n\nThe gun does not waver.",
      flags_set: ['kessler_armed', 'kessler_knows_truth'],
      next: 'kessler_choice',
    },

    kessler_meeting: {
      act: 3,
      title: 'Coffee at 4am',
      image: '/backgrounds/ash-kessler.png',
      narrative: "Kessler pours two cups of coffee. Sets one in front of you.\n\n'I know you will not drink it. But it seemed polite.'\n\nHe sits across the desk. The files between you contain six months of meticulous work. He does not hide them. He wants you to see them.\n\n'My name — my real name — is Hans Bremer. I suspect you know that.'",
      flags_set: ['kessler_confesses_name', 'kessler_direct_meeting'],
      choices: [
        { text: 'Yes. What do you want from this conversation?', next: 'kessler_wants', icon: '🤝' },
        { text: 'Kill him. Six months of research dies with him.', next: 'kessler_kill', icon: '⚔️' },
        { text: 'Dominate him. Wipe the last six months.', next: 'kessler_dominate', requires_discipline: 'Dominate', icon: '👁' },
        { text: 'Use the name as leverage.', next: 'kessler_leverage', requires_flag: 'has_kessler_leverage', icon: '📋' },
      ],
    },

    kessler_choice: {
      act: 3,
      title: 'What To Do With Kessler',
      image: '/backgrounds/ash-kessler.png',
      narrative: "Kessler knows. Not everything — but enough.\n\n'The Reich is going to be at war within two years,' he says. 'I intend to survive. People with unusual resources might be useful to a man trying to survive a war.'\n\nHe is offering a deal. He is also, if you choose, offering himself as a target.",
      choices: [
        { text: 'Kill him. This ends here.', next: 'kessler_kill', icon: '⚔️' },
        { text: 'Dominate — wipe the last six months', next: 'kessler_dominate', requires_discipline: 'Dominate', icon: '👁' },
        { text: 'Negotiate. Hear his terms.', next: 'kessler_negotiate', icon: '🤝' },
        { text: 'Use the leverage — his false identity', next: 'kessler_leverage', requires_flag: 'has_kessler_leverage', icon: '📋' },
      ],
    },

    kessler_wants: {
      act: 3,
      title: 'What Kessler Wants',
      image: '/backgrounds/ash-kessler.png',
      narrative: "'I want to understand what I have found,' he says. 'Not to weaponise it. Not to report it up a chain that will make decisions I do not control. To understand it.'\n\nHe opens a drawer and removes a folder. 'This is my personal copy. The official report is in Berlin.' A pause. 'I could burn this.'\n\nHe sets it on the desk. 'I want a conversation. An honest one. About what you are and what this means. And then I want to leave Vienna and think about whether I can live with not telling anyone.'",
      choices: [
        { text: 'Give him the conversation. Honesty is a gamble — take it.', next: 'kessler_honest_talk', icon: '🤝' },
        { text: 'Dominate him.', next: 'kessler_dominate', requires_discipline: 'Dominate', icon: '👁' },
        { text: 'Promise the conversation. Take his file. Leave.', next: 'kessler_promise_lie', icon: '🎭' },
        { text: 'Kill him.', next: 'kessler_kill', icon: '⚔️' },
      ],
    },

    kessler_honest_talk: {
      act: 3,
      title: 'An Honest Night',
      narrative: "You talk until 4am.\n\nYou do not tell him everything. You tell him enough — the Masquerade, why it exists, what the alternative looks like.\n\nHe asks good questions. The kind that suggest he has been thinking about this for two years.\n\nAt 4am he burns his personal file. You watch it go.\n\n'The official report in Berlin describes a probable hoax,' he says. 'I wrote it that way deliberately three months ago, when I started to believe the investigation was real. An insurance policy.'",
      flags_set: ['kessler_honest_resolution', 'kessler_personal_file_burned'],
      choices: [
        { text: 'Leave it there. A fragile peace.', next: 'kessler_peaceful_end', icon: '🕊️' },
        { text: 'He is too useful to release. Propose a formal arrangement.', next: 'kessler_asset_proposal', icon: '🤝' },
      ],
    },

    kessler_asset_proposal: {
      act: 3,
      check: {
        type: 'social',
        label: 'Manipulation + Persuasion — offer him something real',
        pool_label: 'MAN + Persuasion',
        pool: (c: any) => (c.attributes?.Manipulation || 2) + (c.skills?.Persuasion || 0),
        hunger: (c: any) => c.hunger || 1,
        difficulty: 2,
        success_next: 'kessler_asset_success',
        fail_next: 'kessler_asset_fail',
        success_text: 'He wants to survive the war. You can help with that.',
        fail_text: "He listens. Then: 'I do not think I can trust something I cannot verify.'",
      },
    },

    kessler_asset_success: {
      act: 3,
      title: 'The Asset',
      narrative: "The terms take twenty minutes. He is methodical even in self-preservation.\n\nHe closes the Vienna investigation. Transfers to Berlin. Does not file supplementary reports. In return: resources when he needs them, and the knowledge that someone powerful has an interest in his continued survival.\n\nYou shake hands with a man who knows exactly what you are.",
      flags_set: ['kessler_asset', 'kessler_file_closed'],
      next: 'act3_resolution',
    },

    kessler_asset_fail: {
      act: 3,
      title: 'Not Enough',
      narrative: "He is unconvinced. Not hostile — too careful for hostility — but unconvinced.\n\nKessler will close the investigation because he has no choice. But the arrangement you wanted does not exist.\n\nHe will keep his files. Somewhere. And someday someone will find them.",
      flags_set: ['kessler_partial_resolution'],
      next: 'act3_resolution',
    },

    kessler_peaceful_end: {
      act: 3,
      title: 'A Fragile Thing',
      narrative: "You leave before dawn. Kessler sits at his desk with the ash in his wastebasket and a decision he has not quite finished making.\n\nHe will transfer to Berlin in two weeks. He will close the Vienna file. He will spend the war doing intelligence work, and he will be competent at it, and he will survive.\n\nHe will also never be entirely sure he made the right choice.",
      flags_set: ['kessler_peaceful_resolution'],
      next: 'act3_resolution',
    },

    kessler_dominate: {
      act: 3,
      check: {
        type: 'discipline',
        label: 'Manipulation + Dominate — six months of memory',
        pool_label: 'MAN + Dominate',
        pool: (c: any) => (c.attributes?.Manipulation || 2) + (c.disciplines?.Dominate || 0),
        hunger: (c: any) => c.hunger || 1,
        difficulty: 4,
        success_next: 'kessler_wiped',
        fail_next: 'kessler_immune',
        success_text: 'His eyes go blank. You rewrite six months as a disappointing failed investigation.',
        fail_text: 'Prague. The scar tissue holds. He blinks. Reaches for the telephone.',
      },
    },

    kessler_wiped: {
      act: 3,
      title: 'A Clean Slate',
      narrative: "He blinks. A man who has been working too hard. He will file a report next week — nothing found, recommending closure. He will recommend himself for reassignment.\n\nHe will have nightmares. Nothing specific. Just a persistent feeling he is forgetting something important.",
      flags_set: ['kessler_wiped'],
      next: 'act3_resolution',
    },

    kessler_immune: {
      act: 3,
      title: 'Prague Again',
      narrative: "He blinks. Shakes his head. Reaches for the telephone.\n\n'I knew there was a reason I prepared for this,' he says. Almost to himself.",
      choices: [
        { text: 'Stop him before he calls.', next: 'kessler_kill', icon: '⚔️' },
        { text: 'The leverage. Now.', next: 'kessler_leverage', requires_flag: 'has_kessler_leverage', icon: '📋' },
      ],
    },

    kessler_negotiate: {
      act: 3,
      check: {
        type: 'social',
        label: 'Manipulation + Persuasion — establish terms that hold',
        pool_label: 'MAN + Persuasion',
        pool: (c: any) => (c.attributes?.Manipulation || 2) + (c.skills?.Persuasion || 0),
        hunger: (c: any) => c.hunger || 1,
        difficulty: 3,
        success_next: 'kessler_asset_success',
        fail_next: 'kessler_negotiate_fails',
        success_text: 'He wants to survive. You want the Masquerade. Those wants align.',
        fail_text: "He reaches for the telephone.",
      },
    },

    kessler_leverage: {
      act: 3,
      title: 'Hans Bremer',
      narrative: "You set the paper on the desk.\n\nKessler reads it. His hands set the coffee cup down very carefully.\n\n'Where did you get this?'\n\n'Does it matter?'\n\nA silence. Outside: Vienna, still celebrating at 4am.\n\n'What do you want?' he asks.",
      check: {
        type: 'social',
        label: 'Manipulation + Intimidation — press from strength',
        pool_label: 'MAN + Intimidation',
        pool: (c: any) => (c.attributes?.Manipulation || 2) + (c.skills?.Intimidation || 0),
        hunger: (c: any) => c.hunger || 1,
        difficulty: 2,
        success_next: 'kessler_asset_success',
        fail_next: 'kessler_leverage_fail',
        success_text: 'A man protecting a false identity has very little room to refuse.',
        fail_text: "He calls the bluff. 'You publish that and I publish everything. We both lose.'",
      },
    },

    kessler_leverage_fail: {
      act: 3,
      choices: [
        { text: 'Kill him.', next: 'kessler_kill', icon: '⚔️' },
        { text: 'Negotiate honestly.', next: 'kessler_negotiate', icon: '🤝' },
      ],
    },

    kessler_kill: {
      act: 3,
      title: 'Final Death',
      narrative: "It takes less than a second.\n\nKessler, to his credit, does not flinch. He is the kind of man who saw this as a possible outcome and decided to proceed anyway.\n\nHis personal files are here. You burn what is in front of you. The official report in Berlin says nothing useful.\n\nYou leave the Imperial Hotel at 4:30am.",
      flags_set: ['kessler_dead', 'kessler_files_burned'],
      next: 'act3_resolution',
    },

    kessler_promise_lie: {
      act: 3,
      title: 'The Broken Promise',
      narrative: "You promise him the conversation. While his back is turned you take his personal file — the one copy outside Berlin.\n\nYou are already at the door.\n\n'Wait,' he says. Not angry. Something worse: unsurprised.\n\nYou leave. The file burns in the stairwell. Kessler sits in Room 14 knowing he has been played, deciding what to do with that knowledge.",
      flags_set: ['kessler_file_burned', 'kessler_knows_betrayed'],
      next: 'act3_resolution',
    },

    kessler_negotiate_fails: {
      act: 3,
      title: 'The Call',
      narrative: "Kessler reaches for the telephone. One second.",
      check: {
        type: 'physical',
        label: 'Stop him before he calls',
        pool_label: 'DEX + Brawl',
        pool: (c: any) => (c.attributes?.Dexterity || 2) + (c.skills?.Brawl || 0),
        hunger: (c: any) => c.hunger || 1,
        difficulty: 2,
        success_next: 'kessler_kill',
        fail_next: 'dead_frenzy_masquerade',
        success_text: 'You reach him first.',
        fail_text: 'The call connects. His men arrive with silver.',
      },
    },

    act3_resolution: {
      act: 4,
      title: 'Before Dawn',
      resolution: true,
      narrative: "The clock says 5:15am. Dawn in two hours.\n\nThe night's work is done — or as done as it will be. Vienna is not saved. Vienna cannot be saved from what is starting here. But you may have saved the specific people whose names were in those documents.",
    },
  },

  locales: {
    hu: {
      title: 'Hamu és Elefántcsont',
      subtitle: 'Kölcsönzött idő nóirja',
      setting: 'Bécs, Ausztria — 1938. március',
      acts: {
        1: 'Az Idézés',
        2: 'A Vadászat',
        3: 'Vér és Tűz',
        4: 'Az Ár',
      },
      endings: {
        dead_brandt_silver: {
          title: 'Ezüst Lövedékek',
          text: "Brandt célzása kiváló. Az első lövés elhibáz. A második a mellkasodba talál. Ezüst lövedék. A súlyos sebzés hideg tűzként terjed a szegycsontodban.\n\nAz alley-ban esel el a raktár mögött. Még eszmélten vagy, amikor közeledik. Leguggol, megvizsgál azzal a kifejezéssel, mint aki két éve vár erre a pillanatra.\n\n'Prága,' mondja halkan. 'Tudtam, hogy lesz egy másik.'\n\nNem látod a napfelkeltét. De érzed.",
        },
        dead_frenzy_masquerade: {
          title: 'A Vadállat Dönt',
          text: "Az éhség túl nagy. A Vadállat nem tárgyal.\n\nA Mariahilfer Strasse-ről leágazó mellékutcán térsel magadhoz. Három halandó van a földön. Egyikük Wehrmacht-katona.\n\nA Camarilla nem fog megvédeni ettől — ők jönnek érted, hogy megvédjék az Álarcot attól, amit tettél.\n\nAz éjszaka megtalál téged a hajnal előtt.",
        },
        bad_documents_destroyed: {
          title: 'Hamu',
          text: "A dokumentumok a Duna-csatornán égnek el reggel 5-kor. Nézed, ahogy a bőrtáska görbül, feketedik és süllyed.\n\nKesslernek négy neve van a saját nyomozásából. Nincsenek dokumentumai. Van egy berlini jelentése, amelynek senki nem fog hinni.\n\nBécs mindenképpen elesik. De a Vérrokonok sértetlenül élik túl a megszállást.\n\nEz nem győzelem. De 1938-ban a túlélés az, amire a győzelem hasonlít.",
        },
        good_escape: {
          title: 'Elefántcsont',
          text: "A nyugati vonat 6:15-kor indul a Westbahnhofról. Te rajta vagy.\n\nA dokumentumok hamu. Kessler megírja a jelentését. Berlinben senki sem fog cselekedni alapján.\n\nBécs elesik. Bécs szenvedni fog. De ennek a városnak a Vérrokonai sértetlenül élik túl a megszállás hosszú éjszakáját — nevük ismeretlen, menedékhelyük ép.\n\nNegyvennyolc órát vásároltál nekik. Elég volt.\n\nEbben a században a negyvennyolc óra minden.",
        },
        perfect_the_asset: {
          title: 'A Besúgó',
          text: "Kessler áthelyezési parancsai egy hét múlva érkeznek. Bukarest.\n\nÉlete végéig magánál hordja annak pontos tudatát, mivel tartozik és kinek. Három nyomozást eltemet. Két razziát átirányít.\n\nA dokumentumok hamu. Vasile saját lábán sétál ki a Bécsi Imperialból.\n\nMiriam képeslapot küld Genfből. Csak ennyit ír: Megmondtam.\n\nAz utolsó éjszakai vonaton hagyod el Bécset. A sötétben a város szinte békésnek látszik.\n\nNem lesz az. De ezt már tudtad.",
        },
      },
      scenes: {
        start: {
          title: 'Kärntner Strasse, hajnali 2 óra',
          narrative: "A borítékot memorizálta. Egyetlen sor: 'Vasile futár eltűnt. A dokumentumok léteznek. Csütörtök hajnalig találd meg őket.'\n\nA kávéházon kívül Bécs hat óra óta ünnepel. Wehrmacht-teherautók hömpölyögnek a Ringstrasse-n, éljenző tömeg között. Egy nő virágot dobott. Egy férfi elöl sírt. Nem lehetett tudni, melyik volt őszinte.\n\nA kávéháztulajdonos — Hofer, ötvenéves — egy pohár vörös bort tesz eléd, amelyet nem rendeltél. Kezei remegnek.\n\nCsütörtök hajnalig van időd. Vasile személyi okmányokat futtat a Camarillának. Ha ezek a dokumentumok rossz kezekbe kerülnek, tizenhét Vérrokon leplezödik le.\n\nHofer figyel téged. Egyszer sem néz el.",
          choices: [
            'Vizsgáld meg a borítékot — valaki szándékosan küldte',
            "Tartsd Hofer tekintetét. Kényszeríts ki egy beszélgetést.",
            'Indulj azonnal. Menj Vasile Józsefváros utcai lakásához.',
            'Keresd meg Miriam Szabót. A Malkavian nyolcvan éve él ebben a városban.',
          ],
        },
        examine_envelope: {
          title: 'Amit a Papír Tud',
          narrative: "A hajtás pontos. Három ránc, tökéletesen párhuzamos — valaki szokása, aki évtizedek óta iktat levelezést. Nem futár. Adminisztrátor.\n\nA viaszpecsétet pengével vágták fel, nem törték fel. Felbontva és visszazárva. Valaki elolvasta ezt, mielőtt te megkaptad.\n\nA jobb alsó sarokban, szinte láthatatlanul: egy nyomtatott szám. 44. A Camarilla adminisztratív levelezése szekvenciális hivatkozási kódokat alkalmaz. Ez a boríték a hálózaton belülről származik.\n\nValaki nem hivatalos figyelmeztetést küld neked hivatalos anyagokon keresztül. Nagyon rövid a lista azokról, akik ezt megtehetnék.\n\nFelnézel. Hofer kezei abbahagyták a remegést. Most szándékosan a pultot nézi, nem téged. Ez rosszabb.",
          check: {
            label: 'Érzékelés + Nyomozás — olvasd ki a teljes képet',
            pool_label: 'ÉRZ + Nyomozás',
            success_text: 'Minden szál összekapcsolódik.',
            fail_text: 'Látod a kódot. Nem érted, mit jelent.',
          },
        },
        examine_success: {
          title: 'Már Jelentett',
          narrative: "Hofer elfogta ezt, mielőtt megkaptad. Fizették, hogy elolvassa, és fizették, hogy figyelje, ki jön érte.\n\nJelentett a jelenlétedről, mielőtt leültél. Aki megfizette, már tudja, hogy itt vagy.\n\nA 44-es kód azt mondja, hogy a feladó a Camarillából való. Hofer viselkedése azt mondja, hogy valaki más is figyel. Két szempár fogságában vagy a pillanattól fogva, hogy belépett az ajtón.",
          choices: [
            'Tedd nyomás alá Hofert. Szerezd meg a nevet.',
            'Menj el csendesen. Tudod, amit tudnod kell.',
            'Keresd meg Miriamot. Ő küldte ezt.',
          ],
        },
        examine_partial: {
          title: 'A Kép Fele',
          narrative: "Elkapod a kódot — belső Camarilla. Valaki a hálózaton belülről küldte ezt a figyelmeztetést. De Hofer viselkedése nem regisztrál fenyegetésként.\n\nElhagyod a kávéházat anélkül, hogy megértenéd: már bejelentöttek.",
          choices: [
            'Menj Vasile Józsefváros utcai lakásához',
            'Keresd meg Miriam Szabót',
          ],
        },
        confront_hofer: {
          title: 'Hofer Beszél',
          narrative: "Tartod a tekintetét a pult felett, amíg el nem néz.\n\n'Felbontottad,' mondod.\n\nNem tagadja. Hangja halkra sűlyed. 'Minden héten jönnek. Január óta. Két ember. Iratokat mutatnak. Jól fizetnek.' Óvatosan letesz egy poharat. 'Ma este rólad kérdeztek. Leírás alapján.'\n\nMég nem hívott. A légzéséből látod.",
          check: {
            label: 'Karizma + Meggyőzés — tartsd szóban',
            pool_label: 'KAR + Meggyőzés',
            success_text: 'A tőled való félelme felülmúlja a tőlük valót.',
            fail_text: 'A telefon után nyúl.',
          },
        },
        hofer_gives_name: {
          title: 'Kessler',
          narrative: "'Oberst Kessler,' mondja Hofer. 'Ahnenerbe. Szobája van a Bécsi Imperialban. Hat hete.'\n\nAhnenerbe. Az SS okkult kutatási részlege. Kategorikusan nem kellene tudniuk, hogy a Vérrokonok léteznek.\n\n'Vasile nevéről is kérdezett,' teszi hozzá Hofer. 'Három napja. Fotója volt.'\n\nMegmondod Hofernek, hogy vegye a családját, és látogasson el a grazi fivéréhez egy hétre. Ne kérdezze, miért.\n\nElmegy.",
          choices: [
            'Menj Vasile Józsefváros utcai lakásához',
            'Előbb keresd meg Miriam Szabót',
            'Menj egyenesen a Bécsi Imperialhoz',
          ],
        },
        hofer_calls: {
          title: 'A Hívás',
          narrative: "Felemeli a kagylót, mielőtt megállíthatnád. Három szót mond, majd leteszi.\n\nGyorsan mész ki. Két sarokkal odébb csizmák csapódása a kövezeten, a kávéház felé tartva.",
          choices: [
            'Mozgás. Józsefváros.',
            'Keresd Miriamot. Közelebb van.',
          ],
        },
        josefstadt_direct: {
          title: 'Laudongasse',
          narrative: "Vasile lakása egy harmadik emeleti walk-up a Laudongasse-n. Két polgári ruhás férfi áll a sarkon, különböző irányba nézve. Figyelők.\n\nA lakás ablaka sötét. Az épület kapuja résnyire nyitva.",
          check: {
            label: 'Ügyesség + Lopakodás — közelítés láttatlanul',
            pool_label: 'ÜGY + Lopakodás',
            success_text: 'Árnyékok és türelem.',
            fail_text: 'Az egyik figyelő pontosan a rossz pillanatban fordul meg.',
          },
        },
        josefstadt_wise: {
          title: 'Laudongasse — Körültekintően',
          narrative: "Kétszer körbejárod a háztömböt. Két figyelő. Egy harmadik emeleti ablak résnyire nyitva a hideg ellenére. Az épület kapuja résnyire tárva — nemrég.\n\nValaki sietett ki. Vagy sietősen vittek ki.",
          check: {
            label: 'Ügyesség + Lopakodás — közelítés láttatlanul',
            pool_label: 'ÜGY + Lopakodás',
            success_text: 'Tiszta megközelítés.',
            fail_text: 'Még az óvatosság sem elég ma éjjel.',
          },
        },
        josefstadt_flat: {
          title: 'A Lakás',
          narrative: "Vasile lakását szakszerűen kutatták át — a fiókokat visszahelyezték, nem kiürítették, a párnákat visszatették, nem felhasítottak.\n\nKét dolgot mulasztottak el.\n\nElőször: egy lazán illő tégla a kandalló mögött. Belül: egy nő fülbevalója és egy kétnapos kávéházi számla a Taborstrasse-ről.\n\nMásodszor: a szekrény ajtajának belső oldalán, nagyon apró ceruzaírással: Sz.M. tud.\n\nMiriam Szabó. És ez alatt, más tintával: Ha megtalálják — ne bízz a raktárban. Figyelik.",
          choices: [
            'A Taborstrasse-i kávéház. Ott tevékenykedik Miriam.',
            'Menj a raktárhoz mégis',
            'Bécsi Imperial. Kessler fogva tartja Vasilét.',
          ],
        },
        josefstadt_spotted: {
          title: 'Leleplezve',
          narrative: "A figyelő megfordul. Szemetek találkozik.\n\nFutsz. Három utca, egy tető, egy szolgálati bejárat. Négy percen belül tiszta. De nem értük el a lakást.\n\nKessler most tudja, hogy valaki dolgozik ellene.",
          choices: [
            'Keresd meg Miriam Szabót',
            'A Bécsi Imperial. Vidd Kesslerhez közvetlenül.',
          ],
        },
        contact_miriam_initial: {
          title: 'Taborstrasse',
          narrative: "A könyvesbolt a Taborstrasse-n. Miriam Szabó hátul ül, egy magyar újság keresztrejtvényébe merülve. Fel sem néz.\n\n'Kíváncsi voltam, mikor jössz,' mondja. Az akcentusa ma éjjel védtelen. 'Én küldtem a borítékot. Camarilla anyagokat használtam, mert azt akartam, hogy tudj, valódi.'\n\nLeteszi az újságot. Amikor rád néz, a szeme élesebb, mint amit a Malkavian hírnév sejtet.\n\n'Amire keresel, megvan nekem. Minden. Vasile adta nekem, mielőtt elvitték.' Szünet. 'De cserébe valamit akarok.'",
          choices: [
            'Kérdezd meg, mit akar',
            'Kérdezd meg, miért nem szólt közvetlenül a Camarillának',
            'Kérdezd meg, hol van Vasile',
          ],
        },
        contact_miriam_with_clues: {
          title: 'Taborstrasse — Tudod a dolgokat',
          narrative: "Miriam felnéz, amikor belépsz. Felfogja az arckifejezésed. Leteszi az újságot.\n\n'A lakásnál jártál,' mondja.\n\n'Sz.M. tud,' mondod.\n\nValami feloldódik benne. 'Jó. A megfelelő emberben bízott.' Int a veled szemben lévő székre. 'Én küldtem a borítékot. Megvannak a dokumentumok — Vasile adta nekem az éjjel, mielőtt elvitték. Azt is tudom, hol van.'\n\nÖsszefonja a kezét. 'És valamit szeretnék cserébe mindezért.'",
        },
        contact_miriam_urgent: {
          title: 'Taborstrasse — Sürgős',
          narrative: "Miriam az ajtóban áll, amikor megérkezel, kis táskával a lábánál, felöltözve.\n\n'Kíváncsi voltam, mennyi ideig tart,' mondja. 'Megvannak a dokumentumok — Vasile adta nekem három éjjel ezelőtt. Vasile a Bécsi Imperialban van, Kessler szuitájában, a 14-es szobában.'\n\nFelveszi a táskát. 'Ma este elhagyom Bécset. Egy dologban segítek, mielőtt megyek. Válassz óvatosan.'",
          choices: [
            'Mondd el Kessler gyenge pontjait',
            'Csinálj egy csődbontást a Bécsi Imperialban',
            'Segíts megtervezni a menekülési útvonalat Bécsből',
          ],
        },
        miriam_wants: {
          title: 'Az Ára',
          narrative: "'El akarok hagyni Bécset,' mondja Miriam. 'Nyolcvan éve vagyok itt. Tudom, milyenek a megszállások. Ez rosszabb lesz a legtöbbnél.'\n\nAz ablakhoz lép. Lent az utcán Wehrmacht-teherautók oszlopa vonul keletre, lassan és nehezen.\n\n'A Camarilla nem menekít ki engem. De neked kell, amid van — a dokumentumok, Vasile tartózkodási helye, és valami más. Kesslerről. Arról, mi tette félénkké a fajtáddal szemben.'\n\nMegfordul. 'Juttass el Svájcba. Mindent megadok.'",
          choices: [
            'Egyezz bele — elkíséred a svájci határig',
            'Feltételesen egyezz bele — előbb az információ, aztán meglátjuk',
            'Nyomj rá — mit tud Kesslerről?',
          ],
        },
        miriam_deal_made: {
          title: 'A Megállapodás',
          narrative: "Egyszer bólint. Nincs kézfogás. A Vérrokonok között a szavad vagy ér valamit, vagy nem.\n\n'Vasile a Bécsi Imperial 14-es szobájában van. Nem tört meg — de hajnali csütörtökig fog. Kesslernek van egy Brandt nevű embere, aki a kihallgatást végzi. SS. 1936-ban Prágában volt.'\n\nHagyja, hogy ez beessen.\n\n'Prága az oka, hogy Kessler nehezen Dominálható. Brandt az oka, hogy Kessler életben maradt, miután hat hónapig nyomozta a fajtádat. Ezüst lövedékeket hord.'\n\nÁtadja a bőrtáskát. Belül: egy lezárt okmánycsomag. Tizenhét név és cím.",
          choices: [
            'Menj a Bécsi Imperialhoz',
            'Mondj el többet Brandtról előbb',
          ],
        },
        miriam_deal_partial: {
          title: 'Fele Most',
          narrative: "Figyel. Dönt.\n\n'Fele most. Fele a határnál.'\n\nMegadja Vasile tartózkodási helyét — a 14-es szoba, Bécsi Imperial — és mond Brandtról. Az emberről, akit Kessler ilyen helyzetekre tart. SS. Ahnenerbe specialista. Prága 1936.\n\n'Ezüst lőszert hord. Kerüli a szemkontaktust. Húsz percenként jelent.'\n\nA dokumentumtáskát megtartja. 'Ha Vasile szabad és mi vonaton ülünk, megkapod a többit.'",
          choices: ['Menj a Bécsi Imperialhoz'],
        },
        miriam_kessler_weakness: {
          title: 'Prága, 1936',
          narrative: "'Volt egy Vérrokon Prágában. Régi. Azt a hibát követte el, hogy Dominálni próbált egy csoport Ahnenerbe-ügynököt demonstrációként.\n\nTúl sokat vállalt. Kessler a szobában volt. A Dominancia rosszul érte — részleges ellenállás, töredezett beültetett emlék, de egyben oltóanyag is. Az elméje hegszövetet képzett a tapasztalat köré.'\n\nMiriam átad egy hajtogatott papírt. 'Kessler igazi neve. Hans Bremer. Az eredeti Kessler 1934-ben halt meg Dachauban. Ha ez a megfelelő emberekhez jutna el a Birodalom struktúráján belül—' A többit elhallgatja.",
        },
        miriam_brandt_detail: {
          title: 'Ismerd az Ellenséged',
          narrative: "'Brandt a 89. gyalogosban szolgált, mielőtt az Ahnenerbe-hez került. Kiváló lövész. Felesége Münchenben — Clara. Stressz alatt rá gondol; látható a kezein.\n\nHat ezüst lövedéket hord. Tudja, nem kell a szemedbe nézni. Tudja, a tűz és a napfény veszélyes. Nem tudja az éhségről — arról, mit tesz az ítélőképességeddel. Ez az előnyöd.\n\nHúsz percenként jelent. Ha kimarad egy jelzés, Kessler erősítést hív. Ablakod van.\n\nNe engedd, hogy ő lőjön először.'",
          choices: ['Menj a Bécsi Imperialhoz'],
        },
        miriam_distraction: {
          title: 'A Riasztás',
          narrative: "Miriam telefont használ Klein íróasztaláról. Tizenegy perccel később tűzriasztás hallható a Bécsi Imperial keleti szárnyában.\n\nÁtadja a dokumentumtáskát, amíg a riasztás még szól. 'Vasile a 14-es szobában van. Nyolc percetek van, mielőtt Brandt rájön, hogy ez egy csapda.'",
        },
        miriam_escape_route: {
          title: 'A Kiút',
          narrative: "'A Westbahn-vonal Salzburgba, majd délre Innsbruckba és át a Brenneren. De a határok napokban kezdenek zárni.'\n\nKihúz egy fiókot és két okmánykészletet vesz elő. 'Svájci tartózkodási engedélyek. Nagyon jó hamisítványok — a zürichi Nosferatu tartozik nekem egy szívességgel.'\n\nAtadja az egyiket. 'A 6:15-ös vonat a Westbahnhofról. Együtt megyünk.'",
        },
        miriam_why_hidden: {
          title: 'Miért Nem a Camarilla',
          narrative: "'Mert a Camarilla hozzáértő embert küldött volna,' mondja, azzal a laposságával, aki sokszor csalódott. 'A hozzáértő emberek kérdéseket tesznek fel, amelyekre nem akarok válaszolni.'\n\nSzünet. 'Neked azért küldtem a borítékot, mert elég új vagy ahhoz, hogy kétségbeesett légy, és elég képes ahhoz, hogy ne legyél haszontalan.'",
        },
        miriam_vasile_location: {
          title: 'Hol Van Vasile',
          narrative: "'Bécsi Imperial. 14-es szoba, földszint, keleti szárny.' Mondja, anélkül, hogy megcédulákat néz. 'Két napja van ott. Nem tört meg — Vasile makacs, mint a Gangrel-ek makacs szoknak lenni. De mindenki eléri a határát. Brandt türelmes.'",
        },
        warehouse_watched: {
          title: 'Leopoldváros — Megfigyelve',
          narrative: "A csatornai út melletti raktárnál két ember ül egy parkoló autóban. Negyven perccel ezelőtt érkeztek, és azóta nem mozdultak. Kessler emberei.\n\nVasilenak igaza volt. A főbejáraton belépni azt jelenti, hogy beléjük sétálsz.",
          choices: [
            'Közelíts hátulról — a csatorna felőli bejáraton keresztül',
            'Hagyd. Keresd inkább Miriamot.',
          ],
        },
        hunger_pressure: {
          title: 'A Visszafogottság Ára',
          narrative: "Három óra óta vagy mozgásban. A város tele van meleg testekkel — ünneplő katonák, ablakból néző polgárok, részeg mulatozók.\n\nAz éhség nem veszi tudomásul ezt.\n\nNem ösztön. Egy hang, és racionális érveket hoz: veszélyes dologba mész csökkent kapacitással. A táplálkozás most nem gyengeség. Felkészülés.\n\nAz érv nem téves. Ez a probléma a Vadállattal — szinte soha nincs teljesen igaza.\n\nEgy Wehrmacht-katona levált a csoportjától. Padon ül a Naschmarkt közelében, fejét hátravetve, félig alszik.",
          choices: [
            'Táplálkozz. Teljes erőre van szükséged ahhoz, ami következik.',
            'Tartsd vissza magad. Nem táplálkozol katonáktól.',
            'Keress diszkrétebb áldozatot — az éjszakai bárokban mindig van hajlandó résztvevő.',
          ],
        },
        hunger_feed_soldier: {
          title: 'A Könnyű Döntés',
          narrative: "Gyorsan táplálkozol. A katona nem fog emlékezni.\n\nAz éhség csökken. A tisztaság visszatér. És vele valami más: a tudat, mit tettél épp. Egy részeg, elszakadt Wehrmacht-katona, aki valószínűleg tett dolgokat az elmúlt hat órában, amelyekről nem akarsz tudni.\n\nEz volt a könnyű döntés. A Vadállat racionális érveket hozott. Beleegyeztél.\n\nÍgy kezdődik mindig.",
        },
        hunger_resist: {
          title: 'A Nehéz Döntés',
          narrative: "Ott hagyod. Padon alva, tudatlan, meleg.\n\nAz éhség elcsendesedik, türelmesen, a tudatod hátterében. Ott lesz mindahhoz, ami következik — minden kihúzásnál, minden konfrontációnál, minden pillanatban, amikor gyorsabbnak vagy erősebbnek kellene lenned, mint amilyen vagy.\n\nA visszafogottságot választottad. Valahol valamibe fog kerülni. Ez az alku.",
        },
        hunger_careful_feed: {
          title: 'Megfontolt Megközelítés',
          narrative: "Az Opernring melletti bár sajátos vendégkört vonz — színházi embereket, művészeket, az a fajta bécsi, aki mindig is tudta, hogy az éjszaka furcsább dolgokat is tartalmaz, mint amit a legtöbben bevallanak.\n\nEgy fiatal zenész, aki az Anschluss miatt boldogtalan, ahogy a művészek boldogtalanok — hangosan, mintha az elégedetlenségük ellenzékiséget alkotna. Amikor a figyelem teljes súlyát fordítod rá, teljesen hajlandónak mutatkozik.\n\nTiszta táplálkozás. Irgalmas is, a létezésed mértékeivel mérve.",
        },
        act2_approach: {
          title: 'Konvergencia',
          narrative: "Bécs hajnali háromkor más minőségű, mint éjfélkor. Az ünneplés megalvadt. Férficsoportok állnak keresztutakon ok nélkül. Egy zsidó boltos szögeli be az ablakait lámpafénynél, gyorsan dolgozva, senkire sem nézve.\n\nHárom szál húzódik. A dokumentumok. Vasile. Kessler.\n\nÉs valahol a háttérben: Brandt.",
          choices: [
            'Bécsi Imperial — szabadítsd ki Vasilét és szembesülj Kesslerrel',
            'Keresd meg Miriamot előbb, ha még nem tetted',
          ],
        },
        imperial_approach_informed: {
          title: 'A Bécsi Imperial',
          narrative: "Bécs legpompásabb szállodája jelenleg teli van az Anschlusst ünneplő német tisztekkel. A hall konyakos és friss egyenruhás szagú.\n\nA 14-es szoba a földszint, keleti szárny. Brandt húsz percenként jelent — ami azt jelenti, hogy vagy Vasiléval van, vagy a közelben. Tizenöt percig figyelted: egy ember halad el a keleti folyosón nyolc percenként.\n\nA megközelítés módja számít.",
          choices: [
            'Elrejtőzés — menj el az őrök mellett láthatatlanul',
            'Társasági — te ide tartozol, és a jelenlétedből ez sugárzik',
            'Szolgálati bejárat — a konyhán és a személyzeti folyosókon keresztül',
            'Közvetlen — kopogtass a 14-es szobán. Találkozz Kesslerrel a te feltételeid szerint.',
          ],
        },
        hotel_obfuscate: {
          check: {
            label: 'Érzékelés + Elrejtőzés — Árnyékköpeny',
            pool_label: 'ÉRZ + Elrejtőzés',
            success_text: 'Bútor vagy. Falra vetett árnyék.',
            fail_text: 'Az éhség megnehezíti a koncentrációt. Brandt egy ajtóból lép ki előtted.',
          },
        },
        hotel_social: {
          check: {
            label: 'Karizma + Etikett — te ide tartozol',
            pool_label: 'KAR + Etikett',
            success_text: 'Egy SS ezredes innivalóra invitál. Udvariasan visszautasítod és elsiklasz.',
            fail_text: 'Brandt a folyosó végén van. Nem néz rád közvetlenül. De abbahagyja a sétát.',
          },
        },
        hotel_service: {
          check: {
            label: 'Ügyesség + Lopakodás — személyzeti folyosók',
            pool_label: 'ÜGY + Lopakodás',
            success_text: 'Fehérneműraktár. Egy bejáró konyha. Tíz méterre kerülsz a 14-es szobától.',
            fail_text: 'Egy éjszakai portás kinyit egy ajtót közvetlenül az utadba. Kiált.',
          },
        },
        hotel_spotted_brandt: {
          title: 'Brandt',
          narrative: "Nem hív segítségért. Nem nyúl azonnal a fegyveréhez. Szembefordul veled, kezeit láthatóan tartva, és gondos németséggel mondja: 'Számítottam valakire.'\n\nA szeme a gallérodnál fókuszál. Nem az arcodnál.\n\n'Tudom, nem kell közvetlenül rád néznem,' mondja. 'Tudom, elfelejtetheted velem ezt a beszélgetést, ha mégis néznék.' Szünet. 'Két éve készülök erre. Szeretnék beszélni, mielőtt ez olyanná válik, amit egyikünk sem akar.'",
          choices: [
            'Beszélj. Nyilván tud valamit.',
            'Cselekedj, mielőtt a fegyveréhez ér.',
            'Használj Diszciplínát — Dominancia vagy Jelenlét',
          ],
        },
        brandt_talk: {
          title: 'Amit Brandt Tud',
          narrative: "'Prágában voltam,' mondja. Nagyon mozdulatlan. 'Láttam, mire képes a fajtád. Azt is láttam, mi lett Kesslerből utána — a részleges ellenállás, a megszállottság.'\n\nKéztartása látható. Ezüst lőszer a zakójában.\n\n'Kessler nyomozása ma éjjel mindenképpen lezárul — parancsot kapott a berlini konszolidációra. De válaszok nélkül nem fog elmenni.'\n\nBrandt a gallérodnál pillant. 'A 14-es szobában lévő futár — meg fog törni. Nem azért, mert kegyetlenek vagyunk. Mert három napja nem táplálkozott, és ez az, amit az tesz a fajtáddal, nem igaz? Az éhség.'",
          choices: [
            'Mindenben igaza van. Tárgyalj.',
            'Túl sokat tud. Ez a beszélgetés itt ér véget.',
            'Kérdezz rá Kessler igazi nevére — teszteld, ő is tudja-e',
          ],
        },
        brandt_negotiate: {
          title: 'Feltételek',
          narrative: "'Amit én akarok,' mondja Brandt lassan, 'az az, hogy túléljek egy háborút. Én vagyok az egyetlen ember a Birodalomban, aki tudja, hogy a fajtád létezik, és azt is tudja, hogy az Ahnenerbe megközelítése öngyilkos.'\n\nNagyon lassan belenyúl a zsebébe és kivesz egy füzetet. Leteszi egy oldalasztalra.\n\n'Minden név és helyszín, amit két év alatt összegyűjtöttem. Nem a hivatalos jelentés — az Kesslernél van. A jegyzetek. Minden.'\n\nA füzetet feléd tolja. 'Cserébe: akinek jelented, tudja meg, hogy Hauptsturmführer Brandt elérhető ügynökként. Amikor a háború fordul — és fordulni fog — szövetségesekre lesz szükségetek a struktúrán belül.'",
          choices: [
            'Elfogadod. Ez rendkívül hasznos.',
            'Elfogadod és Dominálod, hogy felejtse el ezt a találkozót.',
            'Visszautasítod. Nem kötöl alkut az SS-szel.',
          ],
        },
        brandt_deal_accepted: {
          title: 'Szokatlan Szövetség',
          narrative: "Elveszed a füzetet. Brandt egy töredéknyit ellazul.\n\n'A futár a folyosó végén van. Kessler a 14-es szobában. Tizenkét perced van, mielőtt be kellene jelentenem.'\n\nFélreáll.\n\n'Még egy dolog,' mondja, a hátadhoz. 'Prága. Az idős, aki megpróbálta dominálni minket. Megöltük. Arra az esetre, ha kíváncsi vagy, képesek vagyunk-e erre. Azt akarom, hogy tudd a választ, mielőtt megállapodunk a bizalomban.'",
        },
        brandt_deal_dominate: {
          check: {
            label: 'Manipuláció + Dominancia — Hipnózis és átírás',
            pool_label: 'MAN + Dominancia',
            success_text: 'Üvegessé válik a szeme. Gondosan szólsz. Amikor visszatér, más beszélgetésre fog emlékezni.',
            fail_text: 'Az elméjének valamije ellenáll. Prága hegszövetet hagyott.',
          },
        },
        brandt_dominate_success: {
          title: 'Átírva',
          narrative: "Az alku valódi. Az emlék nem az. Arra fog ébredni, hogy azt hiszi, rutinőrjáratot tartott és semmit sem talált.\n\nA füzet a tiéd. Vasile a folyosó végén van.",
        },
        brandt_immune: {
          title: 'Prága Megint',
          narrative: "Pislog. Egyszer megrázza a fejét. A keze a zakójához mozdul.\n\n'Prága,' mondja halkan. 'Tudtam, hogy lesz ilyen nap.'\n\nKihúzza a fegyvert.",
        },
        brandt_kessler_name: {
          title: 'Hans Bremer',
          narrative: "Valami átfut Brandt arcán.\n\n'Hol hallottad azt a nevet?' Nagyon hosszú szünet. 'Nem számít. Igen. Tudom. 1935 óta tudom.' Kienged. 'Megmentette az életem Prágában. Sosem találtam a megfelelő pillanatot eldönteni, mit jelent ez a lojalitásomra nézve.'",
        },
        brandt_discipline: {
          check: {
            label: 'Dominancia vagy Jelenlét — állítsd meg',
            pool_label: 'MAN + Dominancia vagy KAR + Jelenlét',
            success_text: 'Megdermed. Amit tenni készült, azt most nem akarja tenni.',
            fail_text: 'Tudta, hogy ez jön. A szeme már a padlón van.',
          },
        },
        brandt_fight_first: {
          title: 'Első Lépés',
          narrative: "Mielőtt előrányúlhatna, bezárod a távolságot. Gyors — kiképzett, felkészült — de nem számított arra, hogy azonnal elkötelezed magad.\n\nA harc egy szállodai folyosón zajlik. Vendégek két szobával odébb. Minden hang számít.",
        },
        brandt_fight_after_talk: {
          title: 'Nincs Alku',
          narrative: "'Értem,' mondja Brandt. Majd nagyon simán kihúzza a fegyvert, annak a valakinek a begyakorolt mozdulatával, aki tudta, hogy ez a valószínű kimenetel.\n\nEzüst lövedékek.",
        },
        brandt_fight: {
          title: 'Hauptsturmführer Brandt',
          narrative: "Brandt nem olyan, mint a raktárban lévő férfiak. Nem riad meg a sebességedtől. Nem fagy le a szemedtől. Mozgásban marad, távolságot tart, a folyosó geometriáját annak könnyedségével használja, aki alaposan átgondolta, hogyan küzdjön szűk térben nálánál gyorsabb valamivel szemben.\n\nAz első lövés szándékosan elhibáz — figyelmeztetés, vagy újrakalibrálás. A második nem fog.\n\nMinden lövés Álarc megsértése. Fejezd be gyorsan.",
          combat: {
            label: 'Hauptsturmführer Brandt',
            description: 'Kiképzett SS tiszt, aki kimondottan erre a találkozóra készült. Az ezüst lövedékek súlyos sebzést okoznak.',
          },
        },
        brandt_fight_win: {
          title: 'Elesett, Nem Meghalt',
          narrative: "Brandt eszméletlen a folyosó padlóján. Három bordája törött, lefegyverezve, lélegzik.\n\nNálad van a fegyvere. Hat ezüst lövedék.\n\nValaki hallotta a küzdelmet. Négy percen belül valaki kinyit egy ajtót.\n\nVasile a folyosó végén. Kessler a 14-es szobában.",
          choices: [
            'Szabadítsd ki Vasilét. Indulj azonnal.',
            'Szabadítsd ki Vasilét, majd intézd el Kesslert.',
            'Menj egyenesen Kesslerhez, amíg Brandt le van.',
          ],
        },
        hotel_room_14: {
          title: '14-es Szoba',
          narrative: "Vasile a szomszéd szobában van. Három nap táplálkozás nélkül. Az éhség látható abban, ahogy tartja magát — gondosan, mint egy ember, aki próbál nem gondolni arra, amit akar.\n\nMeglát téged, és valami feloldódik. Nem megkönnyebbülés. Egy ember elszántsága, aki arra várt, hogy megtudja, jön-e segítség, és most tudja a választ.",
          choices: [
            'Szabadítsd ki Vasilét azonnal és fuss',
            'Előbb kutasd át a szobát — értsd meg, mit tud Kessler',
            'Várj Kesslerre — lesben állj itt a saját feltételeid szerint',
          ],
        },
        kessler_direct_knock: {
          title: '14-es Szoba — Közvetlen',
          narrative: "Kopogtatál.\n\nSzünet. Majd: 'Tessék.'\n\nKessler az íróasztalnál ül. Akták nyitva. Amikor felnéz rád, az arckifejezése annak az embernek az irányított nyugalma, aki számított valami ilyesmire, és még nem döntötte el teljesen, mit érezzen az igazolódásról.",
        },
        search_kessler_room: {
          title: 'A Kutatás',
          narrative: "Hat hónap munkája. Kessler módszeres. Nem tudja, mik a Vérrokonok — de tudja, hogy vannak emberek, akik nem öregszenek, kerülik a napfényt, és nem hagynak fényképes nyomot.\n\nNégy neve van. Tizenhét, ha megszerzi Vasile dokumentumait. Az egyik a te neved.\n\nAz íróasztalon: egy tervezetlevél Berlinnek, kérvényezve kiterjesztett fogvatartási protokollok engedélyezését. Holnapra keltezve.",
          choices: [
            'Égesd el az egészet — a kutatásait, a levelet, mindent',
            'Szabadítsd ki Vasilét és menj',
            'Várj Kesslerre',
          ],
        },
        burn_research: {
          title: 'A Szál Elégetése',
          narrative: "Az akták jól égnek. Négy perc.\n\nKiszabadítod Vasilét. Alig tud járni. A szolgálati folyosón jártok, amikor hallod, hogy Kessler visszatér, és az utána következő csend.\n\nTudja. Újraépíti majd. De az újrakezdés időt vesz igénybe, és az idő 1938-ban az egyetlen, amivel senki sem rendelkezik.",
        },
        kessler_ambush: {
          title: 'A Lesből Támadás',
          narrative: "Kessler hajnali 4-kor tér vissza. Belép és megáll — annak a kiképzett mozdulatlanságával, aki érez valamit, ami nem stimmel. A keze a zakójához mozdul.",
          check: {
            label: 'Kezdeményezés — csapj le, mielőtt fegyvert húz',
            pool_label: 'ÉRZ + Higgadtság',
            success_text: 'Mozogsz. Ő nem ér a pisztolyhoz.',
            fail_text: 'Gyorsabb a vártnál.',
          },
        },
        vasile_rescue: {
          title: 'Vasile Megmentése',
          narrative: "A szoba a keleti folyosó végén. Nincs bezárva — miért zárnák be az ajtót, ha Brandt maga a zár?\n\nVasile a fal mellett. Három napja nem táplálkozott. Rád néz, és az első kérdése:\n\n'Megszerezted a dokumentumokat?'",
          choices: [
            'Igen — biztonságban vannak',
            'Nem — elégtek vagy elvesztek',
            'Tudsz járni? Később is megbeszélhetjük.',
          ],
        },
        vasile_rescue_then_kessler: {
          title: 'És Aztán',
          narrative: "Vasile talpra áll. Brandt eszméletlen alakját megjegyzés nélkül veszi szemügyre.\n\n'Kessler?' kérdezi.\n\n'Még egy dolog.'",
        },
        vasile_docs_safe: {
          narrative: "Hosszan, lassan kifújja a levegőt. 'Jó. Menjünk.' Feláll. Stabilabb, mint kellene.\n\n'Gangrel,' mondja, mintha ez mindent megmagyarázna. Meg is magyaráz.",
        },
        vasile_no_docs: {
          narrative: "Vasile lehunyja a szemét. 'Akkor Kesslernek megvan, amire szüksége van, akár szabad vagyok, akár nem.' Kinyitja őket lapos egyértelműséggel. 'Egyenesen Kesslerhez megyek. Magamat adom cserébe a nevekért.'\n\nKomolyan gondolja.",
          choices: [
            'Engedd — a nevek fontosabbak egy futárnál',
            'Állítsd meg — ez rosszul végződik',
          ],
        },
        vasile_can_walk: {
          narrative: "'Igen.' Feláll. 'Az éhség négyen van. Tudok járni. Nem tudok harcolni.' Rád néz. 'Egyikünk sem kellene, hogy most harcban legyen. Mi a kimentési terv?'",
        },
        vasile_sacrificed: {
          narrative: "Vasile hajnali 5-kor sétál be a Bécsi Imperialba, és nem jön ki.\n\nA dokumentumok három nappal később hiányosan jutnak vissza a Camarillához. Ami Vasile-val ezután történt, arról egyetlen nyilvántartás sem számol be.",
        },
        kessler_captured: {
          title: 'Az Oberst',
          narrative: "Kessler a padlón van, a csuklója szorítva, pisztolya az egész szoba másik végén. Nem pánikol. Figyel. Még most is, még a kezeddel a torkán is, adatokat jegyez.\n\n'Szóval,' mondja. 'Prága mégis igaz volt.'\n\nNincs megijedve. Pontosabban — van, de úgy döntött, hogy a félelmet adatként kezeli.",
        },
        kessler_armed_standoff: {
          title: 'Patthelyzet',
          narrative: "Kesslernek van a pisztolya. Neked van a fölényesen gyorsabb reakciókészséged. A szoba sötét. Egyikőtök sem mozdul.\n\n'Nem fogok lőni, ha nem kényszerítesz,' mondja. 'Beszélni akarok. Két éve akarok ilyen valakivel beszélni.'\n\nA pisztoly nem remeg.",
        },
        kessler_meeting: {
          title: 'Kávé Hajnali 4-kor',
          narrative: "Kessler tölt két csésze kávét. Egyet eléd tesz.\n\n'Tudom, nem fogod meginni. De udvariasnak tűnt.'\n\nAz íróasztal mögé ül. A közöttetek lévő akták hat hónap aprólékos munkáját tartalmazzák. Nem rejti el őket. Láttatni akarja veled.\n\n'A nevem — az igazi nevem — Hans Bremer. Gyanítom, ezt tudod.'",
          choices: [
            'Igen. Mit akarsz ebből a beszélgetésből?',
            'Öld meg. Hat hónap kutatás vele hal.',
            'Dominálj. Töröld ki az utóbbi hat hónapot.',
            'Használd a nevet tőkekarként.',
          ],
        },
        kessler_choice: {
          title: 'Mit Tegyünk Kesslerrel',
          narrative: "Kessler tud. Nem mindent — de eleget.\n\n'A Birodalom két éven belül háborúban lesz,' mondja. 'Szándékomban áll túlélni. A szokatlan erőforrásokkal bíró emberek hasznosak lehetnek a háborút túlélni akaró valakinek.'\n\nAlkut ajánl. Egyúttal — ha úgy döntesz — céltáblát is kínál önmagából.",
          choices: [
            'Öld meg. Ez itt ér véget.',
            'Dominálás — töröld ki az utóbbi hat hónapot',
            'Tárgyalj. Hallgasd meg a feltételeit.',
            'Használd a tőkekaratot — a hamis személyazonosságát',
          ],
        },
        kessler_wants: {
          title: 'Mit Akar Kessler',
          narrative: "'Meg akarom érteni, amit találtam,' mondja. 'Nem fegyverként. Nem egy láncba, amely döntéseket hoz, amelyeket nem irányítok. Megérteni.'\n\nKihúz egy irattartót egy fiókból. 'Ez a személyes másolatom. A hivatalos jelentés Berlinben van.' Szünet. 'El tudnám égetni ezt.'\n\nAz íróasztalra teszi. 'Egy beszélgetést akarok. Egy őszintét. Arról, mik vagytok és mit jelent ez. Aztán el akarok hagyni Bécset és elgondolkodni, el tudok-e hallgatni mindenről.'",
          choices: [
            'Add meg a beszélgetést. Az őszinteség kockázatvállalás — vállald.',
            'Dominálj.',
            'Ígérd meg a beszélgetést. Vedd az aktáját. Menj el.',
            'Öld meg.',
          ],
        },
        kessler_honest_talk: {
          title: 'Egy Őszinte Éjszaka',
          narrative: "Hajnali 4-ig beszéltek.\n\nNem mondasz el mindent. Eleget mondasz — az Álarcot, miért létezik, milyen az alternatíva.\n\nJó kérdéseket tesz fel. Olyanokat, amelyek arra utalnak, hogy két éve gondolkodik ezen.\n\nHajnali 4-kor elégeti a személyes aktáját. Nézed, ahogy elmegy.\n\n'A berlini hivatalos jelentés valószínű hamisításként írja le,' mondja. 'Három hónappal ezelőtt szándékosan így írtam meg, amikor elkezdtem hinni, hogy a nyomozás valódi. Egy biztosítási kötvény.'",
          choices: [
            'Hagyd ennyiben. Törékeny béke.',
            'Túl hasznos ahhoz, hogy elengedje. Javasolj formális megállapodást.',
          ],
        },
        kessler_asset_proposal: {
          check: {
            label: 'Manipuláció + Meggyőzés — ajánlj valami valódit',
            pool_label: 'MAN + Meggyőzés',
            success_text: 'Túlélni akarja a háborút. Ebben tudsz segíteni.',
            fail_text: "'Hallgatok. De nem tudom megbízni azt, amit nem tudok ellenőrizni.'",
          },
        },
        kessler_asset_success: {
          title: 'A Besúgó',
          narrative: "A feltételek húsz percet vesznek igénybe. Módszeres, még az önfenntartásban is.\n\nLezárja a bécsi nyomozást. Berlinbe megy. Nem nyújt be kiegészítő jelentéseket. Cserébe: erőforrások, amikor szüksége van rájuk, és a tudat, hogy egy hatalmasnak érdekében áll a folytatódó túlélése.\n\nKézfogással kötöd meg az alkut azzal az emberrel, aki pontosan tudja, mi vagy.",
        },
        kessler_asset_fail: {
          title: 'Nem Elég',
          narrative: "Meggyőzetlen. Nem ellenséges — erre túl óvatos — de meggyőzetlen.\n\nKessler lezárja a nyomozást, mert nincs más választása. De a megállapodás, amelyet szerettél volna, nem létezik.\n\nMegtartja az aktáit. Valahol. És valamikor valaki megtalálja majd őket.",
        },
        kessler_peaceful_end: {
          title: 'Törékeny Dolog',
          narrative: "Hajnal előtt mész el. Kessler az íróasztalnál ül, a papírkosarában hamuval és egy döntéssel, amelyet még nem fejezett be teljesen.\n\nKét hét múlva Berlinbe kerül. Lezárja a bécsi aktát. A háborút hírszerzéssel tölti, és kompetensen csinálja, és túléli.\n\nSoha nem lesz teljesen biztos abban, hogy a megfelelő döntést hozta.",
        },
        kessler_dominate: {
          check: {
            label: 'Manipuláció + Dominancia — hat hónap emlék',
            pool_label: 'MAN + Dominancia',
            success_text: 'Üres lesz a szeme. Hat hónapot írsz át egy csüggedt, sikertelen nyomozásként.',
            fail_text: 'Prága. A hegszövet kitart. Pislog. A telefon felé nyúl.',
          },
        },
        kessler_wiped: {
          title: 'Tiszta Lap',
          narrative: "Pislog. Egy ember, aki túl keményen dolgozott. Jövő héten egy jelentést fog beadni — semmi sem található, bezárást ajánl. Áthelyezést fog javasolni magának.\n\nRémálmai lesznek. Semmi konkrét. Csak egy tartós érzés, hogy elfelejt valamit fontosat.",
        },
        kessler_immune: {
          title: 'Prága Megint',
          narrative: "Pislog. Megrázza a fejét. A telefon felé nyúl.\n\n'Tudtam, hogy van oka, hogy felkészültem erre,' mondja. Szinte önmagához.",
          choices: [
            'Állítsd meg, mielőtt felhív.',
            'A tőkekarat. Most.',
          ],
        },
        kessler_negotiate: {
          check: {
            label: 'Manipuláció + Meggyőzés — állapíts meg tartható feltételeket',
            pool_label: 'MAN + Meggyőzés',
            success_text: 'Túlélni akar. Te az Álarcot akarod. Ezek az akarások egybeesnek.',
            fail_text: 'A telefon felé nyúl.',
          },
        },
        kessler_leverage: {
          title: 'Hans Bremer',
          narrative: "Leteszed a papírt az íróasztalra.\n\nKessler elolvassa. A kezei nagyon óvatosan teszik le a kávéscsészét.\n\n'Hol szerezted ezt?'\n\n'Fontos?'\n\nSzünet. Kívül: Bécs, még mindig ünnepel hajnali 4-kor.\n\n'Mit akarsz?' kérdezi.",
          check: {
            label: 'Manipuláció + Megfélemlítés — nyomj az erőpozícióból',
            pool_label: 'MAN + Megfélemlítés',
            success_text: 'Egy hamis személyazonosságot védő embernek nagyon kevés tere van visszautasítani.',
            fail_text: "'Tedd ki, és én is kiteszek mindent. Mindketten veszítünk.'",
          },
        },
        kessler_leverage_fail: {
          choices: [
            'Öld meg.',
            'Tárgyalj őszintén.',
          ],
        },
        kessler_kill: {
          title: 'Végső Halál',
          narrative: "Kevesebb mint egy másodpercig tart.\n\nKessler, dicsőségére legyen mondva, nem riad vissza. Olyan ember ő, aki ezt lehetséges kimenetelként látta, és úgy döntött, hogy mindenképpen folytatja.\n\nA személyes aktái itt vannak. Elégetem, ami előttem van. A berlini hivatalos jelentés semmi hasznosat nem tartalmaz.\n\nHajnali 4:30-kor hagyod el a Bécsi Imperialt.",
        },
        kessler_promise_lie: {
          title: 'A Szegett Ígéret',
          narrative: "Megígéred neki a beszélgetést. Amíg elfordul, elveszed a személyes aktáját — az egyetlen berlinen kívüli másolatot.\n\nMár az ajtónál állsz.\n\n'Várj,' mondja. Nem dühösen. Ami ennél rosszabb: meglepetlenül.\n\nElmész. Az akta elég a lépcsőházban. Kessler ott ül a 14-es szobában, tudva, hogy átverték, és eldönti, mit tesz ezzel az ismerettel.",
        },
        kessler_negotiate_fails: {
          title: 'A Hívás',
          narrative: "Kessler a telefon felé nyúl. Egy másodperc.",
          check: {
            label: 'Állítsd meg, mielőtt felhív',
            pool_label: 'ÜGY + Dulakodás',
            success_text: 'Előre érsz.',
            fail_text: 'A hívás összeköttetésbe lép. Az emberei ezüsttel érkeznek.',
          },
        },
        act3_resolution: {
          title: 'Hajnal Előtt',
          narrative: "Az óra 5:15-öt mutat. Hajnal két óra múlva.\n\nAz éjszaka munkája kész — vagy legalábbis annyira kész, amennyire lesz. Bécs nincs megmentve. Bécs nem menthető meg attól, ami itt kezdődik. De megmentheted azokat a konkrét embereket, akiknek neve azokban a dokumentumokban volt.",
        },
      },
    },
  },
};
