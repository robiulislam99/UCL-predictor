import { Fixture } from "./types";
import { TeamName, TEAMS } from "./teams";

// 2026/27 UEFA Champions League league phase — all 144 matches.
//
// Source: UEFA fixture list (published 29 August 2026), via the UEFA
// calendar and Wikipedia's league-phase page; results cross-checked against
// uefa.com. Format: 36 clubs, 8 matchdays, each club plays 8 different
// opponents (4 home, 4 away), 2 from each seeding pot.
//
// Kickoffs are UTC. UEFA lists 18:45 / 21:00 CET/CEST (UTC+2 up to
// 24 October, UTC+1 after); matchday 8 is all 21:00. Picks lock at kickoff.
//
// To update after a game: add the full-time score as the last argument,
// [home, away]. Never change an id — saved picks are keyed by it (the
// "md1-…" ids are kept from the first version of the app for that reason).

type Result = [number, number];

function m(id: string, matchday: number, kickoff: string, home: TeamName, away: TeamName, result?: Result): Fixture {
  return {
    id,
    matchday,
    kickoff,
    home,
    away,
    homeColor: TEAMS[home].color,
    awayColor: TEAMS[away].color,
    ...(result ? { result: { home: result[0], away: result[1] } } : {}),
  };
}

export const fixtures: Fixture[] = [
  // Matchday 1
  m("ucl-2049558", 1, "2026-09-08T16:45:00Z", "AEK Athens", "LASK", [1, 0]),
  m("ucl-2049556", 1, "2026-09-08T16:45:00Z", "Club Brugge", "Aston Villa", [2, 3]),
  m("ucl-2049554", 1, "2026-09-08T19:00:00Z", "Borussia Dortmund", "Villarreal", [3, 2]),
  m("ucl-2049557", 1, "2026-09-08T19:00:00Z", "Lille", "Real Betis", [2, 3]),
  m("ucl-2049555", 1, "2026-09-08T19:00:00Z", "Porto", "Manchester City", [0, 2]),
  m("ucl-2049553", 1, "2026-09-08T19:00:00Z", "Real Madrid", "Inter Milan", [2, 1]),
  m("ucl-2049561", 1, "2026-09-09T16:45:00Z", "Barcelona", "Feyenoord", [5, 1]),
  m("ucl-2049564", 1, "2026-09-09T16:45:00Z", "VfB Stuttgart", "Viking", [3, 1]),
  m("md1-liverpool-atletico", 1, "2026-09-09T19:00:00Z", "Liverpool", "Atlético Madrid", [2, 1]),
  m("ucl-2049563", 1, "2026-09-09T19:00:00Z", "Napoli", "Arsenal", [0, 1]),
  m("ucl-2049559", 1, "2026-09-09T19:00:00Z", "Paris Saint-Germain", "Slovan Bratislava", [6, 1]),
  m("ucl-2049562", 1, "2026-09-09T19:00:00Z", "Sporting CP", "Galatasaray", [3, 1]),
  m("ucl-2049568", 1, "2026-09-10T16:45:00Z", "Fenerbahçe", "Roma", [1, 1]),
  m("ucl-2049567", 1, "2026-09-10T16:45:00Z", "PSV Eindhoven", "Shakhtar Donetsk", [1, 1]),
  m("ucl-2049565", 1, "2026-09-10T19:00:00Z", "Bayern Munich", "Bodø/Glimt", [5, 0]),
  m("ucl-2049570", 1, "2026-09-10T19:00:00Z", "Como", "RB Leipzig", [4, 1]),
  m("ucl-2049566", 1, "2026-09-10T19:00:00Z", "Manchester United", "Sabah", [4, 0]),
  m("ucl-2049569", 1, "2026-09-10T19:00:00Z", "Slavia Prague", "Lens", [2, 3]),

  // Matchday 2
  m("ucl-2049577", 2, "2026-10-13T16:45:00Z", "Lens", "Sporting CP", [0, 2]),
  m("ucl-2049579", 2, "2026-10-13T16:45:00Z", "Sabah", "Slavia Prague", [2, 0]),
  m("ucl-2049572", 2, "2026-10-13T19:00:00Z", "Arsenal", "Lille", [3, 0]),
  m("ucl-2049573", 2, "2026-10-13T19:00:00Z", "Atlético Madrid", "Manchester United", [2, 0]),
  m("ucl-2049576", 2, "2026-10-13T19:00:00Z", "Galatasaray", "Barcelona", [1, 4]),
  m("ucl-2049571", 2, "2026-10-13T19:00:00Z", "Inter Milan", "Club Brugge", [3, 4]),
  m("ucl-2049574", 2, "2026-10-13T19:00:00Z", "RB Leipzig", "PSV Eindhoven", [1, 0]),
  m("ucl-2049578", 2, "2026-10-13T19:00:00Z", "Viking", "Bayern Munich", [3, 3]),
  m("ucl-2049575", 2, "2026-10-13T19:00:00Z", "Villarreal", "Napoli", [3, 1]),
  m("ucl-2049584", 2, "2026-10-14T16:45:00Z", "Feyenoord", "Como", [3, 2]),
  m("ucl-2049588", 2, "2026-10-14T16:45:00Z", "LASK", "Liverpool", [3, 6]),
  m("ucl-2049582", 2, "2026-10-14T19:00:00Z", "Aston Villa", "Fenerbahçe", [6, 0]),
  m("ucl-2049585", 2, "2026-10-14T19:00:00Z", "Bodø/Glimt", "Borussia Dortmund", [1, 0]),
  m("md1-mancity-psg", 2, "2026-10-14T19:00:00Z", "Manchester City", "Paris Saint-Germain", [2, 4]),
  m("ucl-2049583", 2, "2026-10-14T19:00:00Z", "Real Betis", "Porto", [3, 2]),
  m("ucl-2049581", 2, "2026-10-14T19:00:00Z", "Roma", "Real Madrid", [3, 4]),
  m("ucl-2049586", 2, "2026-10-14T19:00:00Z", "Shakhtar Donetsk", "AEK Athens", [3, 1]),
  m("ucl-2049587", 2, "2026-10-14T19:00:00Z", "Slovan Bratislava", "VfB Stuttgart", [0, 3]),

  // Matchday 3
  m("ucl-2049595", 3, "2026-10-20T16:45:00Z", "Fenerbahçe", "Slavia Prague", [2, 2]),
  m("ucl-2049597", 3, "2026-10-20T16:45:00Z", "Sabah", "Borussia Dortmund", [1, 2]),
  m("ucl-2049590", 3, "2026-10-20T19:00:00Z", "Liverpool", "Villarreal", [4, 3]),
  m("ucl-2049591", 3, "2026-10-20T19:00:00Z", "Manchester City", "AEK Athens", [5, 1]),
  m("ucl-2049594", 3, "2026-10-20T19:00:00Z", "Napoli", "Bodø/Glimt", [4, 3]),
  m("md1-psg-barcelona", 3, "2026-10-20T19:00:00Z", "Paris Saint-Germain", "Barcelona", [4, 2]),
  m("ucl-2049593", 3, "2026-10-20T19:00:00Z", "Porto", "PSV Eindhoven", [0, 1]),
  m("ucl-2049592", 3, "2026-10-20T19:00:00Z", "Roma", "Slovan Bratislava", [4, 0]),
  m("ucl-2049596", 3, "2026-10-20T19:00:00Z", "VfB Stuttgart", "Atlético Madrid", [1, 1]),
  m("ucl-2049606", 3, "2026-10-21T16:45:00Z", "Como", "Manchester United", [4, 1]),
  m("ucl-2049605", 3, "2026-10-21T16:45:00Z", "Lille", "Galatasaray", [2, 4]),
  m("ucl-2049602", 3, "2026-10-21T19:00:00Z", "Aston Villa", "Viking", [3, 1]),
  m("ucl-2049598", 3, "2026-10-21T19:00:00Z", "Bayern Munich", "Arsenal", [2, 2]),
  m("ucl-2049603", 3, "2026-10-21T19:00:00Z", "Club Brugge", "Lens", [3, 0]),
  m("ucl-2049600", 3, "2026-10-21T19:00:00Z", "Inter Milan", "Shakhtar Donetsk", [1, 0]),
  m("ucl-2049604", 3, "2026-10-21T19:00:00Z", "Real Betis", "Feyenoord", [1, 0]),
  m("ucl-2049599", 3, "2026-10-21T19:00:00Z", "Real Madrid", "RB Leipzig", [4, 1]),
  m("ucl-2049601", 3, "2026-10-21T19:00:00Z", "Sporting CP", "LASK", [2, 3]),

  // Matchday 4
  m("ucl-2049614", 4, "2026-11-03T17:45:00Z", "Galatasaray", "VfB Stuttgart"),
  m("ucl-2049613", 4, "2026-11-03T17:45:00Z", "Shakhtar Donetsk", "Sporting CP"),
  m("ucl-2049608", 4, "2026-11-03T20:00:00Z", "Atlético Madrid", "Bayern Munich"),
  m("ucl-2049607", 4, "2026-11-03T20:00:00Z", "Barcelona", "Aston Villa"),
  m("ucl-2049611", 4, "2026-11-03T20:00:00Z", "Bodø/Glimt", "Lille"),
  m("ucl-2049610", 4, "2026-11-03T20:00:00Z", "Feyenoord", "Inter Milan"),
  m("ucl-2049615", 4, "2026-11-03T20:00:00Z", "LASK", "Slovan Bratislava"),
  m("md1-manutd-roma", 4, "2026-11-03T20:00:00Z", "Manchester United", "Roma"),
  m("ucl-2049612", 4, "2026-11-03T20:00:00Z", "Villarreal", "Paris Saint-Germain"),
  m("ucl-2049622", 4, "2026-11-04T17:45:00Z", "AEK Athens", "Real Madrid"),
  m("ucl-2049620", 4, "2026-11-04T17:45:00Z", "Fenerbahçe", "Liverpool"),
  m("ucl-2049616", 4, "2026-11-04T20:00:00Z", "Borussia Dortmund", "Real Betis"),
  m("ucl-2049623", 4, "2026-11-04T20:00:00Z", "Lens", "Como"),
  m("ucl-2049618", 4, "2026-11-04T20:00:00Z", "PSV Eindhoven", "Club Brugge"),
  m("ucl-2049617", 4, "2026-11-04T20:00:00Z", "Porto", "Napoli"),
  m("ucl-2049619", 4, "2026-11-04T20:00:00Z", "RB Leipzig", "Manchester City"),
  m("ucl-2049621", 4, "2026-11-04T20:00:00Z", "Slavia Prague", "Arsenal"),
  m("ucl-2049624", 4, "2026-11-04T20:00:00Z", "Viking", "Sabah"),

  // Matchday 5
  m("ucl-2049629", 5, "2026-11-24T17:45:00Z", "Bodø/Glimt", "LASK"),
  m("ucl-2049631", 5, "2026-11-24T17:45:00Z", "Galatasaray", "Aston Villa"),
  m("md1-arsenal-dortmund", 5, "2026-11-24T20:00:00Z", "Arsenal", "Borussia Dortmund"),
  m("ucl-2049633", 5, "2026-11-24T20:00:00Z", "Como", "AEK Athens"),
  m("ucl-2049628", 5, "2026-11-24T20:00:00Z", "Feyenoord", "Porto"),
  m("ucl-2049626", 5, "2026-11-24T20:00:00Z", "Manchester City", "Napoli"),
  m("ucl-2049630", 5, "2026-11-24T20:00:00Z", "RB Leipzig", "Lens"),
  m("ucl-2049625", 5, "2026-11-24T20:00:00Z", "Real Madrid", "PSV Eindhoven"),
  m("ucl-2049632", 5, "2026-11-24T20:00:00Z", "Slovan Bratislava", "Real Betis"),
  m("ucl-2049642", 5, "2026-11-25T17:45:00Z", "Sabah", "Barcelona"),
  m("ucl-2049641", 5, "2026-11-25T17:45:00Z", "Slavia Prague", "Villarreal"),
  m("ucl-2049636", 5, "2026-11-25T20:00:00Z", "Atlético Madrid", "Viking"),
  m("ucl-2049638", 5, "2026-11-25T20:00:00Z", "Club Brugge", "Liverpool"),
  m("ucl-2049635", 5, "2026-11-25T20:00:00Z", "Inter Milan", "VfB Stuttgart"),
  m("ucl-2049639", 5, "2026-11-25T20:00:00Z", "Lille", "Bayern Munich"),
  m("md1-psg-roma", 5, "2026-11-25T20:00:00Z", "Paris Saint-Germain", "Roma"),
  m("ucl-2049640", 5, "2026-11-25T20:00:00Z", "Shakhtar Donetsk", "Fenerbahçe"),
  m("ucl-2049637", 5, "2026-11-25T20:00:00Z", "Sporting CP", "Manchester United"),

  // Matchday 6
  m("ucl-2049651", 6, "2026-12-08T17:45:00Z", "Viking", "Feyenoord"),
  m("ucl-2049649", 6, "2026-12-08T17:45:00Z", "Villarreal", "Sabah"),
  m("ucl-2049650", 6, "2026-12-08T20:00:00Z", "AEK Athens", "Galatasaray"),
  m("ucl-2049646", 6, "2026-12-08T20:00:00Z", "Aston Villa", "Paris Saint-Germain"),
  m("ucl-2049644", 6, "2026-12-08T20:00:00Z", "Barcelona", "Manchester City"),
  m("ucl-2049643", 6, "2026-12-08T20:00:00Z", "Bayern Munich", "Slavia Prague"),
  m("ucl-2049647", 6, "2026-12-08T20:00:00Z", "Manchester United", "RB Leipzig"),
  m("ucl-2049648", 6, "2026-12-08T20:00:00Z", "Napoli", "Club Brugge"),
  m("ucl-2049645", 6, "2026-12-08T20:00:00Z", "Roma", "Sporting CP"),
  m("ucl-2049655", 6, "2026-12-09T17:45:00Z", "Real Betis", "Como"),
  m("ucl-2049657", 6, "2026-12-09T17:45:00Z", "Slovan Bratislava", "Shakhtar Donetsk"),
  m("md1-arsenal-realmadrid", 6, "2026-12-09T20:00:00Z", "Arsenal", "Real Madrid"),
  m("ucl-2049654", 6, "2026-12-09T20:00:00Z", "Borussia Dortmund", "Inter Milan"),
  m("ucl-2049659", 6, "2026-12-09T20:00:00Z", "LASK", "Fenerbahçe"),
  m("ucl-2049660", 6, "2026-12-09T20:00:00Z", "Lens", "Bodø/Glimt"),
  m("md1-liverpool-porto", 6, "2026-12-09T20:00:00Z", "Liverpool", "Porto"),
  m("ucl-2049656", 6, "2026-12-09T20:00:00Z", "PSV Eindhoven", "Atlético Madrid"),
  m("ucl-2049658", 6, "2026-12-09T20:00:00Z", "VfB Stuttgart", "Lille"),

  // Matchday 7
  m("ucl-2049666", 7, "2027-01-19T17:45:00Z", "Bodø/Glimt", "Atlético Madrid"),
  m("ucl-2049667", 7, "2027-01-19T17:45:00Z", "Galatasaray", "Feyenoord"),
  m("ucl-2049669", 7, "2027-01-19T20:00:00Z", "AEK Athens", "Roma"),
  m("ucl-2049663", 7, "2027-01-19T20:00:00Z", "Aston Villa", "Borussia Dortmund"),
  m("ucl-2049662", 7, "2027-01-19T20:00:00Z", "Inter Milan", "Liverpool"),
  m("ucl-2049665", 7, "2027-01-19T20:00:00Z", "Lille", "Slovan Bratislava"),
  m("ucl-2049664", 7, "2027-01-19T20:00:00Z", "Porto", "Slavia Prague"),
  m("ucl-2049661", 7, "2027-01-19T20:00:00Z", "Real Madrid", "LASK"),
  m("ucl-2049668", 7, "2027-01-19T20:00:00Z", "VfB Stuttgart", "Club Brugge"),
  m("ucl-2049674", 7, "2027-01-20T17:45:00Z", "Fenerbahçe", "Villarreal"),
  m("ucl-2049678", 7, "2027-01-20T17:45:00Z", "Sabah", "Napoli"),
  m("ucl-2049675", 7, "2027-01-20T20:00:00Z", "Como", "Paris Saint-Germain"),
  m("ucl-2049676", 7, "2027-01-20T20:00:00Z", "Lens", "Manchester City"),
  m("md1-manutd-bayern", 7, "2027-01-20T20:00:00Z", "Manchester United", "Bayern Munich"),
  m("ucl-2049673", 7, "2027-01-20T20:00:00Z", "RB Leipzig", "Shakhtar Donetsk"),
  m("ucl-2049672", 7, "2027-01-20T20:00:00Z", "Real Betis", "Arsenal"),
  m("ucl-2049670", 7, "2027-01-20T20:00:00Z", "Sporting CP", "Barcelona"),
  m("ucl-2049677", 7, "2027-01-20T20:00:00Z", "Viking", "PSV Eindhoven"),

  // Matchday 8
  m("ucl-2049683", 8, "2027-01-27T20:00:00Z", "Arsenal", "Sabah"),
  m("ucl-2049685", 8, "2027-01-27T20:00:00Z", "Atlético Madrid", "Fenerbahçe"),
  m("ucl-2049684", 8, "2027-01-27T20:00:00Z", "Barcelona", "Como"),
  m("ucl-2049680", 8, "2027-01-27T20:00:00Z", "Bayern Munich", "Real Betis"),
  m("ucl-2049686", 8, "2027-01-27T20:00:00Z", "Borussia Dortmund", "AEK Athens"),
  m("ucl-2049688", 8, "2027-01-27T20:00:00Z", "Club Brugge", "Bodø/Glimt"),
  m("ucl-2049690", 8, "2027-01-27T20:00:00Z", "Feyenoord", "RB Leipzig"),
  m("ucl-2049696", 8, "2027-01-27T20:00:00Z", "LASK", "Porto"),
  m("ucl-2049681", 8, "2027-01-27T20:00:00Z", "Liverpool", "Lens"),
  m("md1-mancity-sporting", 8, "2027-01-27T20:00:00Z", "Manchester City", "Sporting CP"),
  m("ucl-2049691", 8, "2027-01-27T20:00:00Z", "Napoli", "Viking"),
  m("ucl-2049689", 8, "2027-01-27T20:00:00Z", "PSV Eindhoven", "VfB Stuttgart"),
  m("ucl-2049679", 8, "2027-01-27T20:00:00Z", "Paris Saint-Germain", "Galatasaray"),
  m("ucl-2049687", 8, "2027-01-27T20:00:00Z", "Roma", "Lille"),
  m("ucl-2049693", 8, "2027-01-27T20:00:00Z", "Shakhtar Donetsk", "Real Madrid"),
  m("ucl-2049694", 8, "2027-01-27T20:00:00Z", "Slavia Prague", "Aston Villa"),
  m("ucl-2049695", 8, "2027-01-27T20:00:00Z", "Slovan Bratislava", "Inter Milan"),
  m("ucl-2049692", 8, "2027-01-27T20:00:00Z", "Villarreal", "Manchester United"),
];
