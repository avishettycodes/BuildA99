import type { Player } from '../types';

/**
 * 2026 Week 2 offensive depth charts as of September 20. Ratings are generated from
 * EA SPORTS Madden NFL 27 Week 1 ratings, the latest official update on this date.
 *
 * Row format:
 *   [id, name, years, blurb, HND, BLK, SPD, RTE, YAC, TGH, SZE]
 */

type Row = [string, string, string, string, number, number, number, number, number, number, number];

const POOLS: Record<string, Row[]> = {
  ari: [
    ['now-ari-mcbride', 'Trey McBride', '2022–', 'Catches 110 passes a year and nobody outside the desert has noticed.', 99, 76, 88, 98, 99, 92, 76],
    ['now-ari-higgins', 'Elijah Higgins', '2023–', 'Was a receiver at Stanford until somebody handed him a tight end jersey.', 82, 31, 89, 68, 88, 85, 72],
    ['now-ari-long', 'Hunter Long', '2025–', 'Was drafted to catch passes and has been kept around to block instead.', 79, 69, 81, 65, 72, 81, 76],
    ['now-ari-reiman', 'Tip Reiman', '2024–', 'Tip Reiman: Illinois; 271 pounds, 87 toughness, ARI TE4.', 79, 83, 84, 56, 80, 87, 84],
    ['now-ari-geers', 'Jameson Geers', '2026–', 'Jameson Geers: Minnesota; 250 pounds, 74 toughness, ARI TE5.', 64, 59, 70, 54, 64, 72, 76],
  ],
  atl: [
    ['now-atl-pitts', 'Kyle Pitts Sr.', '2021–', 'Went fourth overall, had a 1,000 yard rookie year, and has chased it since.', 85, 69, 90, 81, 88, 84, 78],
    ['now-atl-woerner', 'Charlie Woerner', '2024–', 'Blocks for a living and has never been asked to run a real route.', 73, 85, 82, 60, 67, 83, 79],
    ['now-atl-hooper', 'Austin Hooper', '2026–', 'Made two Pro Bowls here a long time ago and came back at 31.', 86, 76, 84, 65, 82, 84, 78],
    ['now-atl-muse', 'Nick Muse', '2026–', 'Nick Muse: South Carolina; 252 pounds, 84 toughness, ATL TE4.', 76, 78, 81, 57, 74, 83, 80],
  ],
  bal: [
    ['now-bal-andrews', 'Mark Andrews', '2018–', 'Type one diabetic, and he is the leading touchdown scorer in club history.', 91, 73, 87, 90, 93, 92, 79],
    ['now-bal-smythe', 'Durham Smythe', '2026–', 'Ninth season of blocking down on ends for whoever will have him.', 86, 80, 80, 66, 74, 83, 78],
    ['now-bal-hibner', 'Matthew Hibner', '2026–', 'SMU tight end who arrived undrafted and hits people on kick coverage.', 81, 71, 87, 62, 77, 84, 77],
    ['now-bal-cuevas', 'Josh Cuevas', '2025–', 'Went undrafted and made the roster on special teams and nothing else.', 78, 69, 83, 57, 77, 85, 73],
  ],
  buf: [
    ['now-buf-kincaid', 'Dalton Kincaid', '2023–', 'First round pick who runs routes like a slot receiver and drops too many.', 93, 71, 86, 84, 82, 83, 75],
    ['now-buf-knox', 'Dawson Knox', '2019–', 'Scored in January the week after his brother died and pointed at the sky.', 83, 78, 86, 69, 77, 77, 78],
    ['now-buf-hawes', 'Jackson Hawes', '2025–', 'Fifth round rookie brought in to block, and he is very good at it.', 75, 85, 78, 62, 77, 83, 77],
    ['now-buf-morrisx', 'Keleki Latu', '2025–', 'Rookie who has to beat out three players who would start almost anywhere else.', 75, 71, 76, 60, 75, 79, 78],
  ],
  car: [
    ['now-car-tremble', 'Tommy Tremble', '2021–', 'Drafted to block and he has quietly become good enough to leave on the field.', 79, 80, 86, 72, 77, 79, 77],
    ['now-car-evans', 'Mitchell Evans', '2025–', 'Notre Dame captain taken in the fifth to do the dirty work.', 80, 73, 81, 68, 82, 81, 79],
    ['now-car-granger', 'Darren Waller', '2026–', 'Retired at 31, sat out a whole year, and un-retired to score touchdowns at 33.', 85, 59, 87, 80, 93, 81, 75],
    ['now-car-franks', 'Feleipe Franks', '2024–', 'Carolina moved him from quarterback to tight end and it actually took.', 76, 52, 83, 53, 80, 79, 71],
    ['now-car-jtsanders', 'Ja\'Tavion Sanders', '2024–', 'Catches everything thrown near him and puts a shoulder into nobody.', 79, 64, 83, 69, 86, 84, 76],
  ],
  chi: [
    ['now-chi-loveland', 'Colston Loveland', '2025–', 'Tenth overall pick who was the best route runner in his draft.', 92, 78, 86, 83, 82, 91, 78],
    ['now-chi-kmet', 'Cole Kmet', '2020–', 'Does the unglamorous half of the job well and catches 60 balls doing it.', 88, 80, 85, 77, 74, 84, 83],
    ['now-chi-wilson', 'Sam Roush', '2026–', 'Stanford blocker taken in the third round to do the work nobody claps for.', 75, 80, 82, 56, 77, 85, 85],
    ['now-chi-kalinic', 'Nikola Kalinic', '2026–', 'Nikola Kalinic: York University; 245 pounds, 85 toughness, CHI TE4.', 73, 78, 78, 56, 64, 72, 73],
    ['now-chi-large', 'Hayden Large', '2026–', 'Hayden Large: Iowa; 250 pounds, 85 toughness, CHI TE5.', 68, 76, 82, 53, 82, 85, 77],
  ],
  cin: [
    ['now-cin-gesicki', 'Mike Gesicki', '2024–', 'Played basketball until he was 20 and blocking has never entered into it.', 88, 73, 84, 75, 91, 85, 79],
    ['now-cin-sample', 'Drew Sample', '2019–', 'Second round pick used entirely as a blocker for seven seasons.', 77, 83, 81, 66, 69, 75, 81],
    ['now-cin-fannin', 'Erick All Jr.', '2024–', 'Tore the same knee at Michigan and again as a rookie, and he still plays like this.', 80, 71, 86, 69, 83, 84, 80],
    ['now-cin-endries', 'Jack Endries', '2026–', 'Led Cal in catches, transferred to Texas, and went in the fourth round.', 84, 64, 84, 63, 78, 85, 76],
  ],
  cle: [
    ['now-cle-fannin', 'Harold Fannin Jr.', '2025–', 'Set a college record for the position that had stood since the seventies.', 85, 76, 82, 80, 96, 92, 72],
    ['now-cle-whiteheart', 'Blake Whiteheart', '2024–', 'Wake Forest tight end who has never caught a professional pass.', 75, 76, 82, 59, 83, 81, 75],
    ['now-cle-ryan', 'Carsen Ryan', '2026–', 'Was a fullback at BYU and they are still working out what he is.', 80, 71, 82, 53, 82, 85, 77],
    ['now-cle-royer', 'Joe Royer', '2026–', 'Joe Royer: Cincinnati; 247 pounds, 84 speed, CLE TE4.', 83, 69, 84, 65, 83, 84, 78],
  ],
  dal: [
    ['now-dal-ferguson', 'Jake Ferguson', '2022–', 'Fourth round pick whose grandfather coached the Packers to a Super Bowl.', 89, 83, 81, 84, 88, 84, 75],
    ['now-dal-spannford', 'Brevyn Spann-Ford', '2024–', 'Six foot seven and undrafted, and he made the roster on blocking.', 77, 76, 80, 62, 74, 83, 89],
    ['now-dal-schoonmaker', 'Luke Schoonmaker', '2023–', 'Second round pick who has been the second tight end for three years.', 80, 78, 85, 62, 78, 77, 78],
    ['now-dal-fant', 'Princeton Fant', '2026–', 'Princeton Fant: Tennessee; 235 pounds, 87 speed, DAL TE4.', 74, 66, 87, 60, 83, 81, 68],
    ['now-dal-rogers', 'DJ Rogers', '2026–', 'DJ Rogers: TCU; 245 pounds, 74 toughness, DAL TE5.', 64, 59, 70, 54, 64, 72, 73],
  ],
  den: [
    ['now-den-engram', 'Evan Engram', '2025–', 'Signed at 31 to be a slot receiver wearing a tight end number.', 82, 76, 86, 77, 96, 81, 70],
    ['now-den-trautman', 'Adam Trautman', '2023–', 'Third round pick who has settled into blocking and never complaining.', 83, 80, 81, 68, 83, 84, 79],
    ['now-den-adkins', 'Nate Adkins', '2023–', 'Twelve snaps a game, all of them on first and second down.', 79, 80, 77, 57, 69, 79, 76],
    ['now-den-bentley', 'Dallen Bentley', '2026–', 'Undrafted out of BYU, and he is here because he blocks without complaining.', 79, 66, 85, 66, 82, 83, 77],
    ['now-den-lohner', 'Caleb Lohner', '2026–', 'Caleb Lohner: Utah; 250 pounds, 83 speed, DEN TE5.', 74, 62, 83, 62, 72, 81, 82],
  ],
  det: [
    ['now-det-laporta', 'Sam LaPorta', '2023–', 'Broke the rookie tight end record and blocks like he was raised on a farm.', 95, 73, 86, 89, 91, 89, 73],
    ['now-det-wright', 'Brock Wright', '2021–', 'Nobody drafted him and he has started January games as an extra lineman.', 79, 73, 85, 62, 64, 76, 79],
    ['now-det-conklin', 'Tyler Conklin', '2026–', 'Has not missed a game in nine years and nobody has built an offense around him.', 87, 73, 83, 63, 83, 81, 75],
    ['now-det-meeks', 'Jackson Meeks', '2026–', 'A 235-pound college receiver who Detroit now carries in the tight end room.', 80, 52, 84, 69, 90, 81, 66],
  ],
  gb: [
    ['now-gb-kraft', 'Tucker Kraft', '2023–', 'Finishes every catch by lowering a shoulder into whoever arrives first.', 91, 80, 88, 84, 93, 88, 82],
    ['now-gb-smith', 'Jonnu Smith', '2024–', 'Caught 88 passes at 29 after eight seasons of nobody knowing what he was.', 86, 73, 88, 77, 93, 88, 75],
    ['now-gb-whyle', 'Josh Whyle', '2023–', 'Blocks down on ends and turns up on kickoffs every single week.', 84, 76, 83, 63, 83, 79, 80],
    ['now-gb-redman', 'Mark Redman', '2026–', 'Six foot six out of San Diego State, and the hands are why he sticks.', 76, 66, 78, 60, 75, 85, 85],
    ['now-gb-musgrave', 'Luke Musgrave', '2023–', 'Luke Musgrave: Oregon State; 253 pounds, 89 speed, GB TE5.', 85, 76, 89, 71, 72, 80, 81],
    ['now-gb-yassmin', 'Thomas Yassmin', '2026–', 'Thomas Yassmin: Utah; 245 pounds, 74 toughness, GB TE6.', 64, 59, 70, 54, 64, 72, 73],
  ],
  hou: [
    ['now-hou-schultz', 'Dalton Schultz', '2023–', 'Third franchise doing the identical job, and he never drops third and seven.', 96, 83, 83, 81, 82, 84, 77],
    ['now-hou-moreau', 'Foster Moreau', '2026–', 'Signed at 29 to block on first down and catch a touchdown a month.', 86, 78, 83, 66, 77, 83, 77],
    ['now-hou-klein', 'Marlin Klein', '2026–', 'German, played basketball until he was 18, and now blocks defensive ends.', 73, 73, 85, 68, 78, 84, 79],
    ['now-hou-stover', 'Cade Stover', '2024–', 'Played linebacker at Ohio State, moved to tight end, and blocks like it.', 77, 83, 84, 62, 78, 85, 76],
    ['now-hou-jordan', 'Brevin Jordan', '2021–', 'Enormous talent that has never once made it through a whole October.', 79, 69, 86, 65, 93, 84, 73],
  ],
  ind: [
    ['now-ind-warren', 'Tyler Warren', '2025–', 'Took a direct snap, ran it in, and then caught one in the same afternoon.', 88, 83, 84, 84, 90, 99, 83],
    ['now-ind-aliecox', 'Mo Alie-Cox', '2018–', 'Never played college football and has caught 150 professional passes.', 83, 78, 82, 71, 71, 81, 83],
    ['now-ind-ogletree', 'Drew Ogletree', '2022–', 'Youngstown State to here, and he has hardly been on the field since.', 79, 73, 81, 65, 74, 79, 82],
    ['now-ind-mallory', 'Will Mallory', '2023–', 'Will Mallory: Miami; 239 pounds, 91 toughness, IND TE4.', 78, 57, 87, 63, 83, 85, 73],
    ['now-ind-towt', 'Carson Towt', '2026–', 'Carson Towt: Notre Dame; 250 pounds, 74 toughness, IND TE5.', 64, 59, 70, 54, 64, 72, 81],
  ],
  jax: [
    ['now-jax-strange', 'Brenton Strange', '2023–', 'Waited two entire years for a chance and then caught all of it.', 85, 83, 83, 72, 75, 88, 77],
    ['now-jax-boerkircher', 'Nate Boerkircher', '2026–', 'Nebraska tight end who caught nine passes in college and blocks like this.', 76, 78, 80, 56, 82, 84, 79],
    ['now-jax-morris', 'Quintin Morris', '2025–', 'Fourth franchise in six years, and he covers kicks better than he runs routes.', 80, 57, 82, 59, 82, 79, 71],
    ['now-jax-koziol', 'Tanner Koziol', '2026–', 'Caught 84 passes at Ball State and moved to Houston to be seen.', 83, 76, 82, 54, 83, 87, 79],
  ],
  kc: [
    ['now-kc-kelce', 'Travis Kelce', '2013–', 'The best route running tight end there has ever been, at 36.', 90, 83, 84, 90, 96, 95, 79],
    ['now-kc-gray', 'Noah Gray', '2021–', 'Fifth round pick who blocks, catches touchdowns, and never says a word.', 89, 69, 87, 69, 83, 83, 71],
    ['now-kc-briningstool', 'Jake Briningstool', '2025–', 'Clemson record holder who went undrafted and made the roster.', 78, 69, 81, 68, 77, 80, 76],
    ['now-kc-wiley', 'Jared Wiley', '2024–', 'Fourth round pick who tore a knee before anybody saw him play.', 81, 69, 85, 71, 82, 87, 80],
    ['now-kc-gyllenborg', 'John Michael Gyllenborg', '2026–', 'John Michael Gyllenborg: Wyoming; 251 pounds, 86 speed, KC TE5.', 76, 62, 86, 59, 80, 83, 79],
  ],
  lv: [
    ['now-lv-bowers', 'Brock Bowers', '2024–', 'No rookie at the position had ever caught as many as he did in year one.', 97, 73, 90, 99, 94, 92, 70],
    ['now-lv-mayer', 'Michael Mayer', '2023–', 'Second round pick who would start anywhere that did not already have Bowers.', 81, 83, 82, 69, 80, 88, 80],
    ['now-lv-thomas', 'Ian Thomas', '2025–', 'Eighth season of blocking on the edge for whoever will have him.', 79, 69, 82, 69, 80, 81, 76],
    ['now-lv-myarick', 'Chris Myarick', '2026–', 'Chris Myarick: Temple; 261 pounds, 79 strength, LV TE4.', 75, 73, 78, 56, 74, 79, 83],
    ['now-lv-runyon', 'Carter Runyon', '2026–', 'Carter Runyon: Towson; 243 pounds, 85 speed, LV TE5.', 75, 69, 85, 56, 75, 80, 76],
  ],
  lac: [
    ['now-lac-kolar', 'Charlie Kolar', '2026–', 'Iowa State record holder who waited four years and then got handed a job.', 80, 69, 84, 68, 80, 80, 79],
    ['now-lac-njoku', 'David Njoku', '2026–', 'Went into a burning house to pull a child out, and he plays like that too.', 86, 71, 86, 75, 94, 84, 75],
    ['now-lac-gadsden', 'Oronde Gadsden', '2025–', 'His father caught passes here too, and he was a receiver until last year.', 82, 59, 86, 77, 83, 83, 75],
  ],
  lar: [
    ['now-lar-parkinson', 'Colby Parkinson', '2024–', 'Six foot seven, and the money says star while the usage says blocker.', 87, 71, 85, 72, 71, 77, 86],
    ['now-lar-higbee', 'Tyler Higbee', '2016–', 'Ten seasons here, and he blocks on first down and disappears on third.', 85, 73, 82, 69, 82, 89, 83],
    ['now-lar-ferguson', 'Terrance Ferguson', '2025–', 'Second round rookie from Oregon who runs like a receiver.', 79, 69, 85, 68, 78, 87, 77],
    ['now-lar-allen', 'Davis Allen', '2023–', 'Fifth round pick from Clemson who plays when somebody gets hurt.', 82, 71, 82, 57, 72, 79, 79],
    ['now-lar-klare', 'Max Klare', '2026–', 'Caught 51 passes at Purdue, transferred to Ohio State, and can actually run.', 78, 73, 84, 72, 86, 85, 77],
  ],
  mia: [
    ['now-mia-dulcich', 'Greg Dulcich', '2026–', 'Was a walk on receiver at UCLA and has been hurt in every season since.', 81, 64, 84, 71, 90, 80, 74],
    ['now-mia-kacmarek', 'Will Kacmarek', '2026–', 'Ohio kid who arrived undrafted and has hands nobody expected him to have.', 80, 76, 81, 60, 74, 85, 84],
    ['now-mia-traore', 'Seydou Traore', '2026–', 'Grew up in France playing basketball and had never seen a football at 17.', 82, 59, 85, 65, 83, 87, 71],
    ['now-mia-joly', 'Justin Joly', '2026–', 'Nobody drafted him out of NC State because he runs a 4.8, and he still catches it.', 82, 66, 83, 68, 88, 89, 73],
    ['now-mia-turner', 'Cole Turner', '2026–', 'Cole Turner: Nevada; 240 pounds, 81 agility, MIA TE5.', 79, 64, 81, 62, 82, 70, 76],
  ],
  min: [
    ['now-min-hockenson', 'T.J. Hockenson', '2022–', 'Caught 95 passes in a season and rebuilt a knee to do it again.', 85, 76, 83, 83, 90, 91, 79],
    ['now-min-oliver', 'Josh Oliver', '2023–', 'Nobody in the sport moves a defensive end sideways the way he does.', 84, 98, 85, 66, 72, 80, 82],
    ['now-min-bartholomew', 'Gavin Bartholomew', '2025–', 'Sixth round pick from Pittsburgh who earned an active job with his blocking.', 76, 71, 82, 60, 82, 83, 76],
    ['now-min-yurosek', 'Ben Yurosek', '2025–', 'Ben Yurosek: Georgia; 251 pounds, 76 toughness, MIN TE4.', 66, 64, 72, 57, 67, 75, 75],
  ],
  ne: [
    ['now-ne-henry', 'Hunter Henry', '2021–', 'Nine hundred yards at 30 for a team nobody expected anything from.', 92, 85, 85, 83, 77, 84, 79],
    ['now-ne-westover', 'Eli Raridon', '2026–', 'Two knee reconstructions at Notre Dame, and he is still only 23 years old.', 77, 73, 85, 59, 80, 84, 78],
    ['now-ne-arkin', 'Tanner Arkin', '2026–', 'Nobody drafted him and he has yet to dress for a game that counted.', 66, 85, 76, 44, 69, 83, 81],
    ['now-ne-latu', 'Cameron Latu', '2026–', 'Was a pass rusher at Alabama until they moved him and he got drafted.', 76, 71, 80, 65, 80, 84, 76],
    ['now-ne-hill', 'Julian Hill', '2023–', 'Julian Hill: Campbell Univ.; 251 pounds, 87 toughness, NE TE5.', 74, 78, 83, 62, 82, 84, 77],
  ],
  no: [
    ['now-no-johnson', 'Juwan Johnson', '2020–', 'Was a receiver at Penn State and needed three years to learn this job.', 85, 55, 86, 77, 93, 84, 69],
    ['now-no-fant', 'Noah Fant', '2026–', 'New Orleans signed him to run seams, which is all he has ever wanted.', 84, 64, 87, 71, 88, 83, 76],
    ['now-no-delp', 'Oscar Delp', '2026–', 'Blocked for two national titles at Georgia and caught very little.', 81, 76, 88, 62, 82, 87, 77],
    ['now-no-welch', 'Treyton Welch', '2026–', 'Treyton Welch: Wyoming; 240 pounds, 84 speed, NO TE4.', 78, 64, 84, 59, 83, 84, 74],
    ['now-no-matavao', 'Moliki Matavao', '2026–', 'Moliki Matavao: UCLA; 260 pounds, 88 toughness, NO TE5.', 77, 73, 79, 60, 75, 85, 84],
  ],
  nyg: [
    ['now-nyg-likely', 'Isaiah Likely', '2026–', 'Would have started for twenty other teams and finally went to one of them.', 89, 64, 84, 80, 91, 83, 72],
    ['now-nyg-johnson', 'Theo Johnson', '2024–', 'Fourth round pick with 4.57 speed at 259 pounds and a rebuilt foot.', 81, 78, 87, 72, 83, 87, 85],
    ['now-nyg-manhertz', 'Chris Manhertz', '2024–', 'Played college basketball and has blocked for eleven professional seasons.', 72, 97, 78, 53, 78, 80, 76],
    ['now-nyg-fidone', 'Thomas Fidone II', '2025–', 'Two ruined knees at Nebraska and somebody spent a late pick on him anyway.', 77, 69, 81, 66, 80, 79, 79],
  ],
  nyj: [
    ['now-nyj-taylor', 'Mason Taylor', '2025–', 'His father is in the Hall of Fame for chasing quarterbacks, not catching passes.', 84, 76, 83, 72, 80, 88, 77],
    ['now-nyj-sadiq', 'Kenyon Sadiq', '2026–', 'They spent a first round pick on a tight end, which teams have stopped doing.', 78, 73, 99, 74, 90, 88, 72],
    ['now-nyj-ruckert', 'Jeremy Ruckert', '2022–', 'Grew up twenty miles away and blocks a great deal more than he catches.', 80, 87, 81, 62, 74, 83, 79],
    ['now-nyj-beck', 'Andrew Beck', '2026–', 'Andrew Beck: Texas; 255 pounds, 88 toughness, NYJ TE4.', 72, 83, 85, 60, 78, 85, 77],
    ['now-nyj-woods', 'Jelani Woods', '2026–', 'Fourth franchise for a man who has been injured in all four of his seasons.', 78, 76, 85, 66, 85, 85, 84],
  ],
  phi: [
    ['now-phi-goedert', 'Dallas Goedert', '2018–', 'Played second fiddle for six years and would start on most other rosters.', 90, 78, 86, 87, 93, 91, 81],
    ['now-phi-mundt', 'Johnny Mundt', '2026–', 'Scored the first touchdown of his career in year seven and they mobbed him.', 79, 71, 83, 66, 75, 83, 75],
    ['now-phi-jenkins', 'E.J. Jenkins', '2026–', 'Six foot seven, played basketball at South Carolina, and is 27 years old.', 76, 55, 85, 53, 77, 79, 78],
    ['now-phi-calcaterra', 'Grant Calcaterra', '2022–', 'Grant Calcaterra: SMU; 240 pounds, 84 speed, PHI TE4.', 83, 66, 84, 71, 80, 79, 73],
    ['now-phi-stowers', 'Eli Stowers', '2026–', 'Was a quarterback at Texas A&M and is a receiving tight end at Vanderbilt.', 84, 57, 89, 68, 86, 87, 73],
  ],
  pit: [
    ['now-pit-washington', 'Darnell Washington', '2023–', 'Six foot seven and 295 pounds, and he blocks like an extra tackle.', 78, 98, 84, 60, 88, 91, 99],
    ['now-pit-freiermuth', 'Pat Freiermuth', '2021–', 'Muth. Nothing thrown at him inside the twenty has ever hit the grass.', 88, 83, 83, 78, 80, 87, 82],
    ['now-pit-tonyan', 'Robert Tonyan', '2026–', 'Ninth season, and the eleven touchdown year is still what people say first.', 84, 66, 85, 63, 77, 76, 74],
  ],
  sf: [
    ['now-sf-kittle', 'George Kittle', '2017–', 'Blocks like a tackle, runs like a receiver, and enjoys it more than anybody.', 94, 99, 87, 92, 96, 99, 78],
    ['now-sf-farrell', 'Luke Farrell', '2025–', 'Signed for blocking money, which is a genuinely strange sentence.', 78, 78, 77, 59, 67, 81, 79],
    ['now-sf-willis', 'Brayden Willis', '2023–', 'Brayden Willis: Oklahoma; 240 pounds, 84 speed, SF TE3.', 77, 85, 84, 54, 80, 85, 74],
    ['now-sf-tonges', 'Jake Tonges', '2024–', 'Nobody drafted him at 22 and he scored his first at 26.', 83, 71, 86, 72, 78, 72, 73],
  ],
  sea: [
    ['now-sea-barner', 'AJ Barner', '2024–', 'Fourth round pick who blocks properly and scored four touchdowns as a rookie.', 87, 76, 78, 72, 78, 85, 81],
    ['now-sea-saubert', 'Eric Saubert', '2024–', 'Nine years and seven franchises later he is still blocking on the edge.', 78, 73, 82, 63, 80, 84, 80],
    ['now-sea-arroyo', 'Elijah Arroyo', '2025–', 'Second round rookie who missed two college seasons with a knee.', 81, 69, 87, 72, 83, 85, 80],
    ['now-sea-kallerup', 'Nick Kallerup', '2025–', 'Went unsigned out of Minnesota and lives one injury from a game day.', 73, 83, 81, 51, 61, 75, 83],
  ],
  tb: [
    ['now-tb-otton', 'Cade Otton', '2022–', 'Fourth round pick who caught 90 passes when everybody else got hurt.', 87, 85, 81, 72, 71, 80, 78],
    ['now-tb-durham', 'Payne Durham', '2023–', 'Gets two throws a month and both of them come on third and short.', 78, 76, 77, 57, 80, 85, 80],
    ['now-tb-kieft', 'Ko Kieft', '2022–', 'Blocks on 95 percent of his snaps and looks like he grew up on a farm.', 74, 87, 72, 62, 67, 81, 83],
    ['now-tb-sinnott', 'Bauer Sharp', '2026–', 'Was a fullback at Oklahoma and they drafted him to go and hit people.', 77, 64, 85, 62, 85, 87, 77],
  ],
  ten: [
    ['now-ten-helm', 'Gunnar Helm', '2025–', 'Fourth round rookie from Texas who caught 60 passes in his last year.', 81, 71, 78, 69, 80, 85, 75],
    ['now-ten-bellinger', 'Daniel Bellinger', '2026–', 'Blocks properly, and 25 catches a season is exactly what they wanted.', 84, 78, 84, 65, 74, 83, 80],
    ['now-ten-granson', 'Kylen Granson', '2026–', 'Arrived at 28 to catch the ball on third down and nothing else at all.', 79, 71, 84, 65, 85, 80, 70],
    ['now-ten-martinrobinson', 'David Martin-Robinson', '2026–', 'Temple tight end this team has cut and signed again twice.', 78, 76, 85, 57, 83, 81, 73],
    ['now-ten-kanak', 'Jaren Kanak', '2026–', 'Jaren Kanak: Oklahoma; 234 pounds, 90 toughness, TEN TE5.', 79, 62, 88, 53, 78, 85, 68],
  ],
  was: [
    ['now-was-okonkwo', 'Chig Okonkwo', '2026–', 'Runs like a receiver, and Tennessee never worked out what to do with him.', 85, 69, 88, 74, 88, 80, 70],
    ['now-was-bates', 'John Bates', '2021–', 'Five years of blocking down on ends for 40 catches in total.', 77, 83, 77, 62, 78, 77, 83],
    ['now-was-sinnott', 'Ben Sinnott', '2024–', 'Kansas State captain who hits people on kick coverage for fun.', 79, 71, 83, 68, 90, 84, 76],
    ['now-was-yankoff', 'Colson Yankoff', '2026–', 'Was a quarterback at Washington and a receiver at UCLA before this.', 73, 62, 85, 56, 77, 76, 68],
  ],
};

export const TE_CURRENT: Player[] = Object.entries(POOLS).flatMap(([teamId, rows]) =>
  rows.map(([id, name, years, blurb, hands, blocking, speed, routeRunning, yac, toughness, size]) => ({
    id,
    name,
    teamId,
    position: 'TE' as const,
    years,
    blurb,
    attributes: { hands, blocking, speed, routeRunning, yac, toughness, size },
  })),
);
