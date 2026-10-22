import type { Player } from '../types';

/**
 * 2026 Week 7 offensive rosters as of October 22. Ratings are generated from
 * EA SPORTS Madden NFL 27 Week 5 ratings, the latest official update on this date.
 *
 * Row format:
 *   [id, name, years, blurb, SPD, BRS, JKE, PWR, VIS, HND, SZE]
 */

type Row = [string, string, string, string, number, number, number, number, number, number, number];

const POOLS: Record<string, Row[]> = {
  ari: [
    ['now-ari-allgeier', 'Tyler Allgeier', '2026–', 'Signed to be the thunder in a room built entirely out of rookies.', 85, 88, 82, 90, 83, 75, 82],
    ['now-ari-hull', 'Evan Hull', '2026–', 'Evan Hull: Northwestern; 209 pounds, 80 acceleration, ARI RB6.', 79, 80, 73, 65, 58, 65, 73],
    ['now-ari-knight', 'Bam Knight', '2022–', 'Undrafted out of NC State and has started games nobody remembers.', 88, 88, 85, 78, 75, 74, 77],
    ['now-ari-love', 'Jeremiyah Love', '2026–', 'Notre Dame back taken in the first round who runs away from angles.', 94, 94, 91, 83, 76, 77, 80],
    ['now-ari-benson', 'Trey Benson', '2024–', 'Trey Benson: Florida State; 225 pounds, 80 acceleration, ARI RB5.', 79, 80, 73, 65, 58, 65, 81],
    ['now-ari-conner', 'James Conner', '2021–', 'James Conner: Pittsburgh; 233 pounds, 88 vision, ARI RB4.', 88, 86, 82, 92, 83, 77, 91],
  ],
  atl: [
    ['now-atl-bijan', 'Bijan Robinson', '2023–', 'Runs like a man who has never once been tackled by the first defender.', 96, 93, 99, 91, 93, 87, 81],
    ['now-atl-brobinson', 'Brian Robinson Jr.', '2026–', 'Third franchise in three years for a man who has never had a bad one.', 87, 90, 79, 90, 81, 72, 89],
    ['now-atl-sermon', 'Trey Sermon', '2026–', 'Trey Sermon: Ohio State; 215 pounds, 92 acceleration, ATL RB3.', 84, 92, 82, 83, 70, 75, 82],
  ],
  bal: [
    ['now-bal-rali', 'Rasheen Ali', '2024–', 'Scored 23 touchdowns in a season at Marshall and is fifth on this depth chart.', 92, 92, 83, 75, 74, 75, 77],
    ['now-bal-henry', 'Derrick Henry', '2024–', 'Six foot three and 247 pounds, and he is still pulling away at 31.', 93, 87, 83, 99, 96, 75, 99],
    ['now-bal-jhill', 'Justice Hill', '2019–', 'Third down back who blocks better than most tight ends do.', 90, 90, 87, 75, 81, 90, 72],
    ['now-bal-randall', 'Adam Randall', '2026–', 'Adam Randall: Clemson; 232 pounds, 90 speed, BAL RB4.', 90, 89, 82, 75, 72, 71, 91],
  ],
  buf: [
    ['now-buf-cook', 'James Cook III', '2022–', 'Led the league in rushing touchdowns and asked to be paid like it.', 93, 94, 97, 76, 90, 80, 70],
    ['now-buf-rdavis', 'Ray Davis', '2024–', 'Went to four colleges, then ran for 97 yards on a Sunday night as a rookie.', 88, 88, 85, 84, 78, 81, 75],
    ['now-buf-tyjohnson', 'Ty Johnson', '2022–', 'Special teams captain who turns up with a 40 yard run twice a year.', 90, 89, 85, 73, 82, 81, 74],
  ],
  car: [
    ['now-car-dillon', 'AJ Dillon', '2026–', 'Signed at 28 to be the biggest man in a room full of quick little backs.', 87, 85, 79, 90, 78, 77, 94],
    ['now-car-etienne', 'Trevor Etienne', '2026–', 'Trevor Etienne: Georgia; 198 pounds, 93 acceleration, CAR RB3.', 92, 93, 82, 82, 75, 80, 70],
    ['now-car-hubbard', 'Chuba Hubbard', '2021–', 'Signed an extension nobody outside the building believed he would get.', 91, 92, 87, 83, 88, 84, 81],
    ['now-car-tyus', 'Anthony Tyus III', '2026–', 'Anthony Tyus III: Ohio; 226 pounds, 82 acceleration, CAR RB4.', 81, 82, 75, 68, 60, 68, 84],
    ['now-car-brooks', 'Jonathon Brooks', '2024–', 'First back taken in his draft and both knees have gone since.', 90, 91, 88, 82, 73, 72, 78],
  ],
  chi: [
    ['now-chi-roschon', 'Roschon Johnson', '2023–', 'Blocks like a fullback and got buried behind better runners at Texas too.', 86, 89, 80, 83, 80, 75, 85],
    ['now-chi-monangai', 'Kyle Monangai', '2025–', 'Seventh round pick who led the Big Ten in rushing and nobody noticed.', 86, 88, 83, 89, 84, 77, 72],
    ['now-chi-scott', 'Zavier Scott', '2026–', 'Zavier Scott: Maine; 221 pounds, 80 acceleration, CHI RB6.', 79, 80, 73, 65, 58, 65, 82],
    ['now-chi-swift', 'D\'Andre Swift', '2024–', 'Every team that trades for him decides within a year that they were wrong.', 90, 90, 90, 80, 90, 81, 70],
    ['now-chi-brown', 'Brittain Brown', '2026–', 'Brittain Brown: UCLA; 205 pounds, 84 acceleration, CHI RB4.', 82, 84, 77, 80, 75, 72, 79],
  ],
  cin: [
    ['now-cin-tbrooks', 'Tahj Brooks', '2025–', 'Carried the ball 900 times at Texas Tech and went in the sixth round.', 88, 92, 84, 78, 73, 80, 76],
    ['now-cin-cbrown', 'Chase Brown', '2023–', 'Went in the fifth round and outran a 1,000 yard veteran for the job.', 93, 95, 88, 78, 84, 84, 75],
    ['now-cin-perine', 'Samaje Perine', '2023–', 'Ran for 427 yards in one college game and blocks blitzers for a living.', 86, 90, 77, 89, 78, 84, 90],
  ],
  cle: [
    ['now-no-estime', 'Audric Estime', '2026–', 'Audric Estime: Notre Dame; 227 pounds, 90 acceleration, CLE RB3.', 87, 90, 82, 82, 78, 75, 83],
    ['now-cle-judkins', 'Quinshon Judkins', '2025–', 'Ran for 1,000 yards at two different blue blood programs.', 90, 91, 86, 87, 84, 83, 83],
    ['now-cle-mclaughlin', 'Jaleel McLaughlin', '2026–', 'Jaleel McLaughlin: Youngstown St.; 187 pounds, 92 acceleration, CLE RB2.', 92, 92, 83, 71, 73, 80, 61],
    ['now-cle-sampson', 'Dylan Sampson', '2025–', 'Scored 22 touchdowns at Tennessee and catches everything they throw him.', 92, 91, 87, 77, 75, 77, 67],
    ['now-cle-rsanders', 'Raheim Sanders', '2026–', 'They call him Rocket, and at 227 pounds that is not really about the speed.', 90, 89, 83, 80, 74, 75, 85],
  ],
  dal: [
    ['now-dal-demercado', 'Emari Demercado', '2026–', 'Went undrafted out of TCU and took a kick 90 yards on his first day.', 91, 91, 83, 79, 74, 75, 74],
    ['now-dal-goodson', 'Tyler Goodson', '2026–', 'Tyler Goodson: Iowa; 197 pounds, 92 acceleration, DAL RB2.', 91, 92, 85, 66, 69, 75, 67],
    ['now-dal-javonte', 'Javonte Williams', '2025–', 'Broke 20 tackles on one drive as a rookie, then rebuilt an entire knee.', 88, 90, 85, 93, 88, 80, 81],
    ['now-dal-mdavis', 'Malik Davis', '2026–', 'Undrafted in 2022 and he has outlasted four backs they drafted ahead of him.', 88, 92, 83, 73, 80, 78, 72],
  ],
  den: [
    ['now-den-badie', 'Tyler Badie', '2023–', 'Ran for 1,600 yards at Missouri at 190 pounds and nobody drafted him high.', 89, 93, 80, 78, 74, 78, 69],
    ['now-den-dobbins', 'J.K. Dobbins', '2025–', 'Finally got a full season and ran for over a thousand in it.', 90, 91, 89, 85, 82, 74, 77],
    ['now-den-harvey', 'RJ Harvey', '2025–', 'Was a quarterback in high school and ran a 4.4 at the combine.', 92, 94, 86, 84, 81, 77, 71],
    ['now-den-coleman', 'Jonah Coleman', '2026–', 'Five foot nine and 229 pounds, which is a bowling ball with a jump cut.', 87, 90, 78, 86, 76, 81, 77],
  ],
  det: [
    ['now-det-gibbs', 'Jahmyr Gibbs', '2023–', 'They took a running back twelfth overall and he made it look obvious.', 99, 95, 98, 83, 90, 87, 71],
    ['now-det-jackson', 'Justin Jackson', '2026–', 'Justin Jackson: Northwestern; 199 pounds, 80 acceleration, DET RB6.', 79, 80, 73, 65, 58, 65, 73],
    ['now-det-saylors', 'Jacob Saylors', '2026–', 'East Tennessee State back who has made this roster three summers running.', 88, 90, 78, 78, 75, 75, 73],
    ['now-det-vaki', 'Sione Vaki', '2024–', 'Lined up at safety on Saturday and at running back the same afternoon.', 89, 91, 84, 79, 73, 78, 81],
    ['now-det-pacheco', 'Isiah Pacheco', '2026–', 'Isiah Pacheco: Rutgers; 216 pounds, 95 acceleration, DET RB4.', 93, 95, 84, 85, 75, 80, 79],
  ],
  gb: [
    ['now-gb-jacobs', 'Josh Jacobs', '2024–', 'The league rushing champion brought the same heavy workload north to Green Bay.', 90, 89, 87, 96, 90, 83, 81],
    ['now-gb-kjohnson', 'Kaleb Johnson', '2026–', 'Came back to the state where his father grew up, for a fourth round pick.', 88, 90, 87, 86, 75, 74, 86],
    ['now-gb-lloyd', 'MarShawn Lloyd', '2024–', 'Six carries in two seasons for a man they spent a third rounder on.', 90, 92, 86, 82, 77, 74, 76],
    ['now-gb-strong', 'Pierre Strong Jr.', '2026–', 'Pierre Strong Jr.: S. Dakota St.; 207 pounds, 93 acceleration, GB RB3.', 92, 93, 83, 76, 71, 69, 75],
    ['now-gb-cbrooks', 'Chris Brooks', '2024–', 'Six foot one and 225 pounds, and he went undrafted out of BYU.', 89, 88, 80, 79, 74, 72, 84],
  ],
  hou: [
    ['now-hou-jawharjordan', 'Jawhar Jordan', '2026–', 'Jawhar Jordan: Louisville; 185 pounds, 80 acceleration, HOU RB6.', 79, 80, 73, 65, 58, 65, 66],
    ['now-hou-marks', 'Woody Marks', '2025–', 'Caught 261 passes in college, which is a receiver number.', 88, 88, 87, 80, 87, 84, 76],
    ['now-hou-montgomery', 'David Montgomery', '2026–', 'Arrived at 29 to fall forward on every carry, which is the whole job.', 87, 88, 85, 89, 90, 86, 83],
    ['now-hou-ogunbowale', 'Dare Ogunbowale', '2026–', 'Dare Ogunbowale: Wisconsin; 205 pounds, 87 speed, HOU RB3.', 87, 85, 82, 65, 78, 80, 76],
    ['now-hou-bbrooks', 'British Brooks', '2024–', 'A college tailback who earned an NFL job by turning himself into a fullback.', 81, 82, 75, 68, 60, 68, 80],
  ],
  ind: [
    ['now-ind-giddens', 'DJ Giddens', '2025–', 'Second best back in the state of Kansas and they took him anyway.', 91, 92, 80, 83, 76, 69, 79],
    ['now-ind-mcgowan', 'Seth McGowan', '2026–', 'Left Oklahoma under a cloud, went to Cincinnati, and ran his way back.', 89, 90, 80, 78, 76, 69, 84],
    ['now-ind-jtaylor', 'Jonathan Taylor', '2020–', 'Ran for 1,811 yards in a season and does it again whenever he is healthy.', 94, 93, 90, 97, 99, 81, 82],
  ],
  jax: [
    ['now-jax-abdullah', 'Ameer Abdullah', '2026–', 'Eleven seasons of third downs, and he has never once missed a blitz pickup.', 88, 91, 86, 70, 79, 83, 71],
    ['now-jax-lallen', 'LeQuint Allen Jr.', '2025–', 'Caught 64 passes at Syracuse and blocks like he means it.', 89, 92, 85, 82, 72, 78, 77],
    ['now-jax-crodriguez', 'Chris Rodriguez Jr.', '2026–', 'Kentucky bruiser who finally got a room where somebody would use him.', 89, 91, 78, 84, 81, 65, 82],
    ['now-jax-tuten', 'Bhayshul Tuten', '2025–', 'Ran a 4.32 at 206 pounds, which is not supposed to be possible.', 95, 99, 88, 82, 80, 72, 73],
  ],
  kc: [
    ['now-kc-ejohnson', 'Emmett Johnson', '2026–', 'Was the whole of Nebraska for a season and is the third man here.', 89, 90, 83, 77, 78, 83, 74],
    ['now-kc-bsmith', 'Brashard Smith', '2025–', 'Was a receiver at Miami and a running back at SMU, and got drafted as one.', 93, 93, 85, 69, 76, 78, 69],
    ['now-kc-kwalker', 'Kenneth Walker III', '2026–', 'Traded for a third rounder to give the best offense in football a runner.', 93, 93, 90, 96, 94, 75, 76],
  ],
  lv: [
    ['now-lv-hemby', 'Roman Hemby', '2026–', 'Roman Hemby: Indiana; 210 pounds, 80 acceleration, LV RB6.', 79, 80, 73, 65, 58, 65, 77],
    ['now-lv-jeanty', 'Ashton Jeanty', '2025–', 'Ran for 2,601 yards in one college season and went sixth overall.', 90, 92, 90, 92, 87, 78, 76],
    ['now-lv-laube', 'Dylan Laube', '2024–', 'Caught 68 passes at New Hampshire and covers kicks here.', 88, 89, 85, 76, 72, 87, 74],
    ['now-lv-mwashington', 'Mike Washington Jr.', '2026–', 'Fourth round rookie who arrived to take the carries nobody wants.', 94, 93, 80, 82, 78, 72, 85],
    ['now-lv-collier', 'Chris Collier', '2026–', 'Chris Collier: Lock Haven; 203 pounds, 82 acceleration, LV RB4.', 81, 82, 75, 68, 60, 68, 71],
  ],
  lac: [
    ['now-lac-hampton', 'Omarion Hampton', '2025–', 'Two hundred and twenty pounds with a 4.46, taken 22nd overall.', 90, 93, 83, 91, 83, 84, 83],
    ['now-lac-kmitchell', 'Keaton Mitchell', '2026–', 'The knee held up, and he still runs like nobody has told him about it.', 94, 95, 85, 63, 78, 81, 61],
    ['now-lac-vidal', 'Kimani Vidal', '2024–', 'Ran for 1,661 yards at Troy and went in the sixth round for being short.', 90, 90, 86, 79, 82, 77, 73],
  ],
  lar: [
    ['now-lar-connors', 'Dean Connors', '2026–', 'Dean Connors: Houston; 206 pounds, 91 acceleration, LAR RB3.', 91, 91, 84, 71, 67, 80, 76],
    ['now-lar-corum', 'Blake Corum', '2024–', 'Won a national title at Michigan and waits his turn without complaining.', 93, 91, 87, 84, 80, 74, 70],
    ['now-lar-kyren', 'Kyren Williams', '2022–', 'Went in the fifth round and has led the league in carries since.', 88, 90, 86, 96, 93, 83, 74],
    ['now-lar-rivers', 'Ronnie Rivers', '2022–', 'His father played here too, and neither of them ever got many carries.', 87, 91, 85, 61, 70, 78, 68],
  ],
  mia: [
    ['now-was-kallen', 'Kaytron Allen', '2026–', 'Kaytron Allen: Penn State; 216 pounds, 91 acceleration, MIA RB3.', 89, 91, 79, 85, 75, 74, 81],
    ['now-mia-gordon', 'Ollie Gordon II', '2025–', 'Won the Doak Walker as a sophomore and slid to the sixth round.', 86, 88, 83, 87, 81, 78, 86],
    ['now-mia-carloswashington', 'Carlos Washington Jr.', '2026–', 'Carlos Washington Jr.: SE Louisiana; 210 pounds, 80 acceleration, MIA RB6.', 79, 80, 73, 65, 58, 65, 75],
    ['now-mia-jwright', 'Jaylen Wright', '2024–', 'Ran a 4.38 at Tennessee and has 100 career carries to show for it.', 93, 93, 86, 82, 74, 74, 78],
    ['now-mia-achane', 'De\'Von Achane', '2023–', 'The fastest man in the sport, and he is listed at 188 pounds.', 99, 99, 91, 77, 84, 89, 66],
  ],
  min: [
    ['now-min-claiborne', 'Demond Claiborne', '2026–', 'Wake Forest speed taken on day three to give this offense a jolt.', 93, 90, 88, 76, 70, 72, 69],
    ['now-min-dallas', 'DeeJay Dallas', '2026–', 'DeeJay Dallas: Miami; 225 pounds, 87 speed, MIN RB2.', 87, 85, 78, 83, 77, 81, 81],
    ['now-min-ajones', 'Aaron Jones Sr.', '2024–', 'Signed for one year at 29 and ran for a thousand out of nowhere.', 88, 91, 89, 84, 87, 83, 73],
    ['now-min-jmason', 'Jordan Mason', '2025–', 'Went undrafted out of Georgia Tech and runs like he is still annoyed about it.', 89, 92, 79, 90, 85, 65, 85],
  ],
  ne: [
    ['now-ne-henderson', 'TreVeyon Henderson', '2025–', 'Ran a 4.43 at 202 pounds and returned a kick 100 yards in his first month.', 95, 92, 89, 82, 81, 75, 73],
    ['now-ne-kiner', 'Corey Kiner', '2026–', 'Cincinnati back who runs angry and went undrafted for being short.', 88, 89, 80, 82, 74, 74, 74],
    ['now-ne-rhamondre', 'Rhamondre Stevenson', '2021–', 'Four hundred pound squat, and the ball keeps coming out at the worst moment.', 88, 87, 86, 92, 87, 83, 88],
    ['now-ne-montgomery', 'Myles Montgomery', '2026–', 'Myles Montgomery: UCF; 205 pounds, 82 acceleration, NE RB4.', 81, 82, 75, 68, 60, 68, 74],
  ],
  no: [
    ['now-no-donaldson', 'CJ Donaldson', '2026–', 'An Ohio State back carrying 236 pounds into the Saints backfield.', 87, 89, 77, 79, 70, 78, 91],
    ['now-no-kamara', 'Alvin Kamara', '2017–', 'Scored six touchdowns in one afternoon and has never dropped anything since.', 87, 91, 86, 87, 82, 89, 78],
    ['now-no-kmiller', 'Kendre Miller', '2023–', 'Has torn something in his leg in all three of his seasons here.', 90, 90, 85, 84, 81, 71, 83],
    ['now-no-chandler', 'Ty Chandler', '2026–', 'Ty Chandler: North Carolina; 204 pounds, 95 acceleration, NO RB5.', 92, 95, 79, 76, 78, 75, 74],
    ['now-no-etienne', 'Travis Etienne Jr.', '2026–', 'Went home to Louisiana and got the ball twenty times a week again.', 92, 93, 88, 82, 85, 80, 77],
  ],
  nyg: [
    ['now-nyg-singletary', 'Devin Singletary', '2024–', 'Motor. That is the whole scouting report and it has lasted seven years.', 86, 88, 88, 82, 80, 80, 68],
    ['now-nyg-skattebo', 'Cam Skattebo', '2025–', 'Broke 100 tackles in a college season and dares people to hit him.', 85, 90, 85, 94, 85, 81, 80],
    ['now-nyg-tracy', 'Tyrone Tracy Jr.', '2024–', 'Played receiver at Iowa, moved to running back at Purdue, and it worked.', 90, 91, 88, 78, 80, 75, 81],
  ],
  nyj: [
    ['now-nyj-ballen', 'Braelon Allen', '2024–', 'Started college at 17 and is now 235 pounds of very young man.', 88, 89, 84, 87, 79, 71, 99],
    ['now-nyj-idavis', 'Isaiah Davis', '2024–', 'South Dakota State bruiser who went in the fifth and blocks well.', 87, 90, 82, 80, 76, 75, 82],
    ['now-nyj-hall', 'Breece Hall', '2022–', 'Blew out a knee in October and ran a 4.39 the following August.', 92, 91, 95, 85, 87, 81, 81],
    ['now-nyj-nwangwu', 'Kene Nwangwu', '2024–', 'Has returned four kickoffs for touchdowns and carried the ball eleven times.', 92, 94, 82, 69, 69, 66, 80],
    ['now-nyj-trayanum', 'Chip Trayanum', '2026–', 'Chip Trayanum: Toledo; 224 pounds, 80 acceleration, NYJ RB5.', 79, 80, 73, 65, 58, 65, 77],
  ],
  phi: [
    ['now-phi-saquon', 'Saquon Barkley', '2024–', 'Ran backwards over a defender on television and then ran for 2,000 yards.', 95, 94, 99, 90, 87, 86, 86],
    ['now-phi-bigsby', 'Tank Bigsby', '2025–', 'Traded for a pair of picks to be the thunder nobody else wanted.', 92, 92, 85, 85, 82, 68, 81],
    ['now-phi-pierce', 'Dameon Pierce', '2026–', 'Dameon Pierce: Florida; 214 pounds, 89 speed, PHI RB2.', 89, 88, 82, 91, 74, 75, 79],
    ['now-phi-shipley', 'Will Shipley', '2024–', 'Clemson back who returns kicks and waits behind the best in the league.', 91, 91, 86, 77, 78, 71, 77],
  ],
  pit: [
    ['now-pit-dowdle', 'Rico Dowdle', '2026–', 'Ran for a thousand yards last season and nobody offered him much for it.', 89, 90, 90, 85, 82, 77, 81],
    ['now-pit-heidenreich', 'Eli Heidenreich', '2026–', 'Played receiver at Navy and would have owed the service five years.', 91, 93, 85, 72, 65, 84, 75],
    ['now-pit-homer', 'Travis Homer', '2026–', 'Travis Homer: Miami; 202 pounds, 92 acceleration, PIT RB3.', 90, 92, 82, 71, 75, 78, 71],
    ['now-pit-nichols', 'Lew Nichols', '2026–', 'Lew Nichols: Central Michigan; 220 pounds, 80 acceleration, PIT RB5.', 79, 80, 73, 65, 58, 65, 76],
    ['now-pit-warren', 'Jaylen Warren', '2022–', 'Went undrafted, and he blocks 260 pound linebackers at 5 foot 8.', 90, 94, 86, 85, 91, 84, 74],
    ['now-pit-hurleman', 'Max Hurleman', '2026–', 'Max Hurleman: Notre Dame; 200 pounds, 80 acceleration, PIT RB6.', 79, 80, 73, 65, 58, 65, 72],
  ],
  sf: [
    ['now-sf-black', 'Kaelon Black', '2026–', 'Split carries at Illinois for four years and never once complained.', 91, 93, 80, 84, 79, 71, 76],
    ['now-sf-james', 'Jordan James', '2026–', 'Oregon back who waited a year and then took the job in September.', 89, 92, 86, 78, 73, 68, 75],
    ['now-sf-cmc', 'Christian McCaffrey', '2022–', 'The best receiver on the team is the running back, and it is not close.', 90, 92, 94, 84, 99, 99, 76],
    ['now-sf-guerendo', 'Isaac Guerendo', '2024–', 'Isaac Guerendo: Louisville; 221 pounds, 92 acceleration, SF RB4.', 92, 92, 83, 77, 77, 77, 82],
  ],
  sea: [
    ['now-sea-henry', 'Robert Henry Jr.', '2026–', 'Robert Henry Jr.: UTSA; 199 pounds, 90 acceleration, SEA RB4.', 88, 90, 83, 73, 72, 80, 70],
    ['now-sea-holani', 'George Holani', '2024–', 'Boise State all time great who went undrafted and made the roster anyway.', 89, 92, 79, 76, 76, 78, 75],
    ['now-sea-jones', 'Velus Jones Jr.', '2026–', 'Velus Jones Jr.: Tennessee; 200 pounds, 95 acceleration, SEA RB3.', 94, 95, 78, 63, 71, 92, 74],
    ['now-sea-price', 'Jadarian Price', '2026–', 'Tore an Achilles before he ever played at Notre Dame and still runs a 4.4.', 89, 90, 86, 75, 81, 74, 77],
    ['now-sea-ewilson', 'Emanuel Wilson', '2026–', 'Fort Valley State is not a place scouts visit and he keeps making rosters.', 90, 93, 83, 83, 81, 77, 82],
    ['now-sea-charbonnet', 'Zach Charbonnet', '2023–', 'Zach Charbonnet: UCLA; 220 pounds, 93 trucking, SEA RB5.', 88, 89, 83, 91, 85, 84, 85],
  ],
  tb: [
    ['now-tb-gainwell', 'Kenny Gainwell', '2026–', 'Catches out of the backfield, and Philadelphia trusted him in January.', 89, 86, 89, 78, 83, 81, 70],
    ['now-tb-irving', 'Bucky Irving', '2024–', 'Fourth round pick who broke more tackles than backs twice his size.', 89, 91, 94, 76, 84, 80, 70],
    ['now-tb-stucker', 'Sean Tucker', '2023–', 'A heart condition scared everybody off him and he went undrafted.', 92, 90, 80, 82, 79, 78, 76],
    ['now-tb-williams', 'Josh Williams', '2026–', 'LSU is on the resume; Tampa Bay is the next chance.', 79, 80, 73, 65, 58, 65, 71],
  ],
  ten: [
    ['now-ten-carter', 'Michael Carter', '2026–', 'Michael Carter: North Carolina; 201 pounds, 89 change of direction, TEN RB5.', 86, 84, 88, 80, 74, 78, 68],
    ['now-ten-chestnut', 'Julius Chestnut', '2022–', 'Undrafted out of Sacred Heart and blocks his way onto the roster yearly.', 88, 90, 79, 84, 74, 77, 84],
    ['now-ten-mullings', 'Kalel Mullings', '2026–', 'Kalel Mullings: Michigan; 226 pounds, 80 acceleration, TEN RB6.', 79, 80, 73, 65, 58, 65, 85],
    ['now-ten-pollard', 'Tony Pollard', '2024–', 'Got the every down job at last and ran for a thousand quietly.', 90, 93, 88, 78, 87, 86, 78],
    ['now-ten-singleton', 'Nicholas Singleton', '2026–', 'Penn State back who runs a 4.37 and shared carries there for four years.', 93, 94, 82, 79, 70, 80, 83],
    ['now-ten-spears', 'Tyjae Spears', '2023–', 'Plays without an ACL in one knee and jukes people out of the stadium.', 88, 91, 87, 77, 77, 86, 72],
  ],
  was: [
    ['now-was-croskey', 'Jacory Croskey-Merritt', '2025–', 'Played one college game in his final year and went in the seventh round.', 92, 95, 85, 80, 84, 68, 75],
    ['now-was-ekeler', 'Austin Ekeler', '2026–', 'Austin Ekeler: Western Colorado; 200 pounds, 91 acceleration, WAS RB2.', 89, 91, 87, 82, 78, 90, 74],
    ['now-was-reynolds', 'Craig Reynolds', '2026–', 'Craig Reynolds: Kutztown; 225 pounds, 80 acceleration, WAS RB6.', 79, 80, 73, 65, 58, 65, 79],
    ['now-was-rwhite', 'Rachaad White', '2026–', 'Caught 64 passes in a season once and arrived to do it here.', 89, 91, 86, 82, 82, 89, 81],
    ['now-was-mcnichols', 'Jeremy McNichols', '2024–', 'Jeremy McNichols: Boise State; 205 pounds, 89 acceleration, WAS RB3.', 87, 89, 82, 78, 80, 80, 72],
  ],
};

export const RB_CURRENT: Player[] = Object.entries(POOLS).flatMap(([teamId, rows]) =>
  rows.map(([id, name, years, blurb, speed, burst, juke, power, vision, hands, size]) => ({
    id,
    name,
    teamId,
    position: 'RB' as const,
    years,
    blurb,
    attributes: { speed, burst, juke, power, vision, hands, size },
  })),
);
