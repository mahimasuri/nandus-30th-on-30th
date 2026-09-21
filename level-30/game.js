let xp=0,secret="",attempts=0,guessDigits=[],songIndex=0,photoIndex=0;
const $=id=>document.getElementById(id);
const screens=["boot","intro","bulls","music","sports","food","final","reward"];
function show(id){screens.forEach(s=>$(s).classList.toggle("active",s===id));window.scrollTo(0,0);maybePhoto(id)}
function addXP(n){xp+=n;["xp1","xp2","xp3","xp4","finalXp"].forEach(id=>{if($(id))$(id).textContent=String(xp).padStart(3,"0")})}
function uniqueNumber(){return [..."123456789"].sort(()=>Math.random()-.5).slice(0,4).join("")}
function scoreGuess(g){
  let bulls=0; for(let i=0;i<4;i++)if(g[i]===secret[i])bulls++;
  let present=0; for(const d of g)if(secret.includes(d))present++;
  return {bulls,cows:present-bulls,states:[...g].map((d,i)=>d===secret[i]?"bull":secret.includes(d)?"cow":"miss")};
}
function renderSlots(){[0,1,2,3].forEach(i=>$("guessSlots").children[i].textContent=guessDigits[i]||"_")}
function resetBulls(){
  secret=uniqueNumber();attempts=0;guessDigits=[];$("history").innerHTML="";$("attemptCount").textContent="0 / 10";$("bullsWin").classList.add("hidden");$("guessError").textContent="";$("bullsMessage").textContent="“You have teamwork. I have computing power. Seems fair.”";renderSlots()
}
function makeKeypad(){
  const box=$("keypad");box.innerHTML="";
  [..."123456789"].forEach(d=>{const b=document.createElement("button");b.textContent=d;b.onclick=()=>{if(guessDigits.length<4&&!guessDigits.includes(d)){guessDigits.push(d);renderSlots()}};box.appendChild(b)});
  const zero=document.createElement("button");zero.textContent="0";zero.style.visibility="hidden";box.appendChild(zero)
}
function submitGuess(){
  $("guessError").textContent="";
  if(guessDigits.length!==4){$("guessError").textContent="Choose four different digits first.";return}
  attempts++;const g=guessDigits.join(""),r=scoreGuess(g);
  const row=document.createElement("div");row.className="attempt";
  const tiles=document.createElement("div");tiles.className="tiles";
  g.split("").forEach((d,i)=>{const t=document.createElement("span");t.className="digit-tile "+r.states[i];t.textContent=d;tiles.appendChild(t)});
  const label=document.createElement("span");label.className="score";label.textContent=`🐂 ${r.bulls} · 🐄 ${r.cows}`;
  const small=document.createElement("small");small.textContent=`GUESS ${attempts}`;
  row.append(tiles,label,small);$("history").prepend(row);
  $("attemptCount").textContent=`${attempts} / 10`;guessDigits=[];renderSlots();
  if(r.bulls===4){addXP(100);$("bullsMessage").textContent="“Okay. That was genuinely impressive. Teamwork wins this round.”";$("bullsWin").classList.remove("hidden")}
  else if(attempts>=10){secret=uniqueNumber();attempts=0;$("history").innerHTML="";$("attemptCount").textContent="0 / 10";$("bullsMessage").textContent="“Fresh number. Birthday rules. Try again.”"}
  else $("bullsMessage").textContent=["“Ohhh. That was close.”","“Interesting choice.”","“I see a strategy forming.”","“Okay Nandu, I’m paying attention now.”","“This is getting interesting.”"][Math.floor(Math.random()*5)]
}
function renderChoices(id,items,feedbackId,points){
  const box=$(id);box.innerHTML="";
  items.forEach(item=>{const b=document.createElement("button");b.className="choice";b.textContent=item.label;b.onclick=()=>{[...box.children].forEach(x=>x.classList.remove("selected"));b.classList.add("selected");$(feedbackId).textContent=item.feedback;if(!b.dataset.done){addXP(points);b.dataset.done="1"}};box.appendChild(b)})
}
function setSong(i){songIndex=(i+CONFIG.music.length)%CONFIG.music.length;const s=CONFIG.music[songIndex];$("trackTitle").textContent=s.title;$("trackArtist").textContent=s.artist;$("playerProgress").style.width=`${20+songIndex*19}%`}
let audioCtx=null;
function clickTone(){
  try{
    audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
    const o=audioCtx.createOscillator(), g=audioCtx.createGain();
    o.frequency.value=660; g.gain.setValueAtTime(.025,audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.08);
    o.connect(g).connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime+.08);
  }catch(e){}
}
function togglePlay(){
  const b=$("playSong");
  clickTone();
  if(b.textContent==="▶"){
    b.textContent="Ⅱ";
    document.querySelector(".record")?.classList.add("spinning");
    const song=CONFIG.music[songIndex];
    if(song?.url) window.open(song.url,"_blank","noopener,noreferrer");
  }else{
    b.textContent="▶";
    document.querySelector(".record")?.classList.remove("spinning");
  }
}
function maybePhoto(id){
  if(!["bulls","music","sports","food"].includes(id))return;
  setTimeout(showPhoto,650);
}
function showPhoto(){
  if(!CONFIG.photos.length)return;
  const file=CONFIG.photos[photoIndex++%CONFIG.photos.length];
  $("popupPhoto").src=`assets/${file}`;$("photoNo").textContent=`EVIDENCE ${String(photoIndex).padStart(2,"0")}`;
  const captions=["NANDU DATABASE: visual evidence received.","Photographer mode: confirmed.","Kid energy detected.","No context required. The database has spoken.","Archive note: this one made the cut.","System has logged another Nandu moment."];
  $("photoCaption").textContent=captions[(photoIndex-1)%captions.length];$("photoPopup").classList.remove("hidden")
}
function boot(){
  $("introText").textContent="I have been informed that you are turning 30. I have therefore prepared a highly scientific birthday assessment. Don’t worry. I made it fun. Probably.";
  makeKeypad();renderSlots();
  $("startBtn").onclick=()=>show("intro");$("beginBtn").onclick=()=>{show("bulls");resetBulls()};
  $("backspaceBtn").onclick=()=>{guessDigits.pop();renderSlots()};$("guessBtn").onclick=submitGuess;
  $("musicBtn").onclick=()=>show("music");$("sportsBtn").onclick=()=>show("sports");$("foodBtn").onclick=()=>show("food");$("finalBtn").onclick=()=>show("final");$("rewardBtn").onclick=()=>show("reward");$("replayBtn").onclick=()=>location.reload();
  $("globalPlay").onclick=e=>e.currentTarget.textContent=e.currentTarget.textContent==="▶"?"Ⅱ":"▶";
  $("playSong").onclick=togglePlay;
  $("trackTitle").onclick=()=>{const song=CONFIG.music[songIndex]; if(song?.url) window.open(song.url,"_blank","noopener,noreferrer")};$("prevSong").onclick=()=>setSong(songIndex-1);$("nextSong").onclick=()=>setSong(songIndex+1);$("shuffleSong").onclick=()=>setSong(Math.floor(Math.random()*CONFIG.music.length));$("repeatSong").onclick=()=>setSong(songIndex);
  $("closePhoto").onclick=()=>{$("photoPopup").classList.add("hidden"); if(photoIndex<CONFIG.photos.length && Math.random()<.65) setTimeout(showPhoto,500)};$("photoPopup").onclick=e=>{if(e.target===$("photoPopup"))$("photoPopup").classList.add("hidden")};
  renderChoices("musicChoices",[
    {label:"🎵 Laavah — Jasmine",feedback:"“A strong choice. Nandu FM approves.”"},
    {label:"😎 Wakhra Swag",feedback:"“Weekend mode has officially started.”"},
    {label:"✨ Lipstick — Charlie Puth",feedback:"“Melody credentials confirmed.”"},
    {label:"🌻 Sunflower — Post Malone",feedback:"“Excellent. Vibe department satisfied.”"}],"musicFeedback",50);
  renderChoices("sportsChoices",[
    {label:"🏎️ F1 weekend — Ferrari mode",feedback:"“Valid. Very on-brand.”"},
    {label:"🏸 Badminton — one quick game",feedback:"“A very reasonable use of a Saturday.”"},
    {label:"🚲 Cycling — see where the road goes",feedback:"“Adventure detected.”"},
    {label:"🏕️ Camping — disappear into nature",feedback:"“Outdoor mode activated.”"}],"sportsFeedback",50);
  renderChoices("foodChoices",[
    {label:"🍕 Wood-fired pizza",feedback:"“The standards are high. As expected.”"},
    {label:"🍣 Sushi",feedback:"“A respectable decision.”"},
    {label:"🥞 Good dosa + podi",feedback:"“Now we’re talking.”"},
    {label:"🫓 Chole bhature",feedback:"“Bold. Delicious.”"},
    {label:"🍝 Pasta",feedback:"“Classic Nandu territory.”"}],"foodFeedback",50);
  setSong(0);addXP(0)
}
boot();