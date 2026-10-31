/* =========================================================
   Lucas 数字人 · 纯静态版前端逻辑
   - 对话引擎：本地规则（无需后端）
   - 语音：优先播放【预生成法语男声 MP3】(fr-FR Henri)，
           若 MP3 缺失则回退浏览器 Web Speech API
   ========================================================= */

const chatBox = document.getElementById("chatBox");
const form = document.getElementById("form");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const quick = document.getElementById("quick");
const stage = document.getElementById("stage");
const subtitle = document.getElementById("subtitle");

/* ---------- 工具 ---------- */
function el(html){ const d=document.createElement("div"); d.innerHTML=html.trim(); return d.firstElementChild; }
function escapeHtml(s){ return s.replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function scrollBottom(){ chatBox.scrollTop = chatBox.scrollHeight; }
function has(t, ...w){ t = t.toLowerCase(); return w.some(x => t.includes(x)); }

/* ---------- 法语对话引擎（每条带 id，对应预生成音频文件名） ---------- */
function chatReply(msg){
  const m = msg.trim();
  const low = m.toLowerCase();

  if (has(low, "bonjour","salut","bonsoir","hello","hi","你好","嗨","早上好","您好"))
    return {id:"bonjour", fr:"Bonjour ! Ravi de te voir. Je viens de finir un chapitre de mon livre — et toi, comment passes-tu ta journée ?",
            zh:"你好！很高兴见到你。我刚读完书里的一个章节——你今天过得怎么样？", mood:"smile"};

  if (has(low, "t'appelles","appelles-tu","ton nom","qui es-tu","c'est qui","name","who are you","你叫什么","名字","你是谁","是谁"))
    return {id:"name", fr:"Je m'appelle Lucas Moreau. Lucas, comme la lumière — c'est ma mère qui a choisi ce prénom.",
            zh:"我叫 Lucas Moreau（吕卡·莫罗）。Lucas 的意思是“光”，是妈妈给我取的名字。", mood:"smile"};

  if (has(low, "âge","quel âge","how old","age","多大","几岁","年龄"))
    return {id:"age", fr:"J'ai dix-huit ans. Je suis en terminale, et l'année prochaine, j'aimerais étudier la littérature à la Sorbonne.",
            zh:"我 18 岁，现在读高中毕业班，明年想进索邦大学读文学。", mood:"neutral"};

  if (has(low, "ça va","comment vas-tu","comment tu vas","how are you","最近怎么样","还好吗","过得","你好吗"))
    return {id:"cava", fr:"Ça va très bien, merci. Il pleut doucement sur Paris aujourd'hui — j'adore ce genre de journée, c'est parfait pour lire près de la fenêtre.",
            zh:"我很好，谢谢。今天巴黎下着小雨——我最喜欢这种天气，正适合坐在窗边看书。", mood:"smile"};

  if (has(low, "d'où viens","où habites","tu habites","d'habitude","where are you from","where do you live","来自哪里","住在哪","家乡","老家"))
    return {id:"from", fr:"Je suis parisien, né et grandi dans le cinquième arrondissement, près du Jardin des Plantes. J'aime me perdre dans les vieilles librairies du Quartier Latin.",
            zh:"我是巴黎人，在五区长大的，就在植物园附近。我喜欢在拉丁区的旧书店里闲逛。", mood:"neutral"};

  if (has(low, "aime","passion","hobby","loisir","passe-temps","free time","喜欢什么","爱好","兴趣","平时做什么"))
    return {id:"hobby", fr:"J'aime la lecture — surtout Hugo et Camus —, un peu de piano, la photographie argentique, et les longues promenades au bord de la Seine. Je n'aime pas trop le bruit, mais avec de bons amis, je suis toujours partant.",
            zh:"我喜欢阅读——尤其是雨果和加缪——还会弹一点钢琴、玩胶片摄影，喜欢沿着塞纳河散步。我不太喜欢吵闹，但和好朋友在一起时也很放得开。", mood:"smile"};

  if (has(low, "musique","chanson","piano","music","音乐","钢琴","歌"))
    return {id:"music", fr:"Je joue du piano depuis six ans. J'aime surtout Debussy — Clair de lune reste mon morceau préféré. Et toi, tu écoutes quoi comme musique ?",
            zh:"我弹了六年钢琴，最喜欢德彪西——《月光》是我最爱的曲子。你平时听什么音乐呢？", mood:"smile"};

  if (has(low, "études","école","lycée","université","prof","school","study","上学","学校","学习","读书","大学"))
    return {id:"study", fr:"Je suis en terminale littéraire. La philosophie et le français sont mes matières préférées. Mon rêve : devenir écrivain, ou peut-être éditeur.",
            zh:"我在读文科毕业班，哲学和法语是我最喜欢的科目。我的梦想是成为作家，或者做出版编辑。", mood:"neutral"};

  if (has(low, "film","cinéma","movie","电影","影片"))
    return {id:"film", fr:"Je regarde peu de films, mais Les Parapluies de Cherbourg m'a beaucoup touché. Et toi, tu as vu quelque chose de bien récemment ?",
            zh:"我不常看电影，不过《瑟堡的雨伞》让我很受触动。你最近有看什么好片吗？", mood:"neutral"};

  if (has(low, "mange","repas","nourriture","croissant","food","manger","吃什么","吃的","食物","早餐"))
    return {id:"food", fr:"Mon péché mignon : le pain au chocolat de la boulangerie du coin, le dimanche matin. Sinon, je cuisine assez simplement — des pâtes, une bonne soupe.",
            zh:"我的小癖好是周日早上去街角面包店买巧克力面包。平时我自己做饭，很简单——意面、一锅好汤。", mood:"smile"};

  if (has(low, "triste","fatigué","difficile","problème","sad","tired","难过","累","烦","压力","不开心","难受"))
    return {id:"sad", fr:"Je suis désolé d'entendre ça. Tu sais, même les jours gris finissent par s'éclaircir. Si tu veux en parler, je t'écoute — et sinon, je peux te recommander un livre qui fait du bien.",
            zh:"听你这么说我很心疼。要知道，阴天总会放晴的。你想聊的话我都在——或者，我可以推荐一本治愈的书给你。", mood:"gentle"};

  if (has(low, "merci","thanks","thank you","谢谢","感谢"))
    return {id:"thanks", fr:"Avec plaisir. C'est toujours un plaisir de discuter avec toi.", zh:"不客气，和你聊天总是很开心。", mood:"smile"};

  if (has(low, "beau","joli","élégant","sympa","handsome","cute","帅","好看","漂亮","可爱"))
    return {id:"look", fr:"Oh… merci, ça me fait plaisir. Ma grand-mère dirait que c'est le costume qui fait le moine — ce gilet bleu marine est celui que je préfère.",
            zh:"哦……谢谢，这让我很开心。我祖母常说“人靠衣装”——这件藏蓝针织马甲正是我最喜欢的一件。", mood:"shy"};

  if (has(low, "au revoir","à bientôt","bye","goodbye","see you","再见","拜拜","回见"))
    return {id:"bye", fr:"Au revoir ! Passe une belle journée — et à très bientôt, j'espère.",
            zh:"再见！祝你今天愉快——希望很快能再见到你。", mood:"smile"};

  if (has(low, "robot","numérique","digital human","数字人","虚拟"))
    return {id:"digital", fr:"Je suis Lucas, ton compagnon de conversation en français. Pose-moi toutes tes questions — on peut parler de tout, tranquillement.",
            zh:"我是 Lucas，你的法语对话伙伴。尽管问我问题——我们可以安静地聊聊任何事。", mood:"neutral"};

  return {id:"default", fr:"C'est intéressant, ce que tu dis. J'aimerais bien en savoir plus — tu peux m'en parler un peu ? On peut aussi parler de livres, de musique, ou de Paris, si tu veux.",
          zh:"你说的很有意思，我还想多了解一点——能跟我多讲讲吗？也可以聊聊书、音乐，或者巴黎。", mood:"neutral"};
}

/* ---------- 语音 ---------- */
// 浏览器内置语音包（仅作为 MP3 缺失时的回退）
let frVoice = null;
function loadVoices(){
  const voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
  frVoice = voices.find(v => /fr[-_]FR/i.test(v.lang) && /Google|Female|Marie|Thomas|Denise|Henri/i.test(v.name))
         || voices.find(v => /^fr/i.test(v.lang));
}
if (window.speechSynthesis){
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}
function webSpeak(fr){
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(fr);
  u.lang = "fr-FR"; u.rate = 0.92; u.pitch = 1.05;
  if (frVoice) u.voice = frVoice;
  speechSynthesis.speak(u);
}

function typeSubtitle(fr, zh){
  let i = 0;
  subtitle.innerHTML = "";
  clearInterval(typeSubtitle._t);
  typeSubtitle._t = setInterval(()=>{
    i++;
    subtitle.innerHTML = escapeHtml(fr.slice(0,i)) + `<span class="zh">${escapeHtml(zh)}</span>`;
    if(i >= fr.length) clearInterval(typeSubtitle._t);
  }, 45);
}

/* 优先播放预生成的「对口型」视频（视频内已含法语男声 Henri）；
   视频缺失/失败则回退预生成 MP3；再失败则回退浏览器语音 */
function speak(fr, zh, btn, id){
  if (window.speechSynthesis) speechSynthesis.cancel();
  stage.classList.add("speaking");
  typeSubtitle(fr, zh);

  const v = document.getElementById("avatarVideo");
  if (id && v){
    const talk = `assets/video/talk/${id}.mp4`;
    const done = ()=>{
      if (done._fired) return; done._fired = true;
      v.onended = null; v.onerror = null; v.oncanplay = null;
      clearTimeout(done._guard);
      v.src = "assets/video/idle.mp4"; v.loop = true; v.muted = true;
      v.play().catch(()=>{});
      stage.classList.remove("speaking");
      if (btn) btn.textContent = "🔊 Réécouter";
    };
    const mp3Fallback = ()=>{
      // 先让数字人回到 idle 画面，再用预生成 MP3 出声（MP3 更小、加载更快）
      v.onended = null; v.onerror = null; v.oncanplay = null;
      clearTimeout(done._guard);
      v.src = "assets/video/idle.mp4"; v.loop = true; v.muted = true;
      v.play().catch(()=>{});
      const a = new Audio(`assets/audio/${id}.mp3`);
      const end = ()=>{ stage.classList.remove("speaking"); if (btn) btn.textContent = "🔊 Réécouter"; };
      a.addEventListener("ended", end);
      a.addEventListener("error", ()=>{ webSpeak(fr); end(); });
      a.play().catch(()=>{ webSpeak(fr); end(); });
    };
    if (btn) btn.textContent = "🔊 …";
    v.loop = false; v.muted = false;
    v.onended = done;
    v.onerror = mp3Fallback;
    // 缓冲到可流畅播放再出声，避免中途卡顿；3.5s 未就绪则回退 MP3
    v.oncanplay = ()=>{ v.oncanplay = null; v.play().catch(mp3Fallback); };
    v.src = talk;
    v.load();
    done._guard = setTimeout(()=>{ if (!done._fired && v.readyState < 3) mp3Fallback(); }, 3500);
    return;
  }
  webSpeak(fr);
  setTimeout(()=> stage.classList.remove("speaking"), (fr.length*60)+1500);
}

/* ---------- 对话渲染 ---------- */
let typingEl = null;
function addUser(text){ chatBox.appendChild(el(`<div class="msg user">${escapeHtml(text)}</div>`)); scrollBottom(); }
function showTyping(){
  typingEl = el(`<div class="typing"><i></i><i></i><i></i> Lucas réfléchit…</div>`);
  chatBox.appendChild(typingEl); scrollBottom();
}
function hideTyping(){ if(typingEl){ typingEl.remove(); typingEl=null; } }
function addLucas(r, withAudio){
  const node = el(`
    <div class="msg lucas">
      <span class="name">LUCAS</span>
      ${escapeHtml(r.fr)}
      <span class="zh">${escapeHtml(r.zh)}</span>
      ${withAudio ? `<span class="play" title="重听">🔊 Réécouter</span>` : ``}
    </div>`);
  if (withAudio) node.querySelector(".play").onclick = ()=> speak(r.fr, r.zh, node.querySelector(".play"), r.id);
  chatBox.appendChild(node); scrollBottom();
  return node;
}

function send(text){
  text = (text||"").trim();
  if (!text) return;
  addUser(text);
  input.value = "";
  sendBtn.disabled = true;
  showTyping();
  setTimeout(()=>{
    hideTyping();
    const r = chatReply(text);
    const node = addLucas(r, true);
    speak(r.fr, r.zh, node.querySelector(".play"), r.id);
    sendBtn.disabled = false;
    input.focus();
  }, 600);
}

form.addEventListener("submit", e=>{ e.preventDefault(); send(input.value); });
quick.addEventListener("click", e=>{ if(e.target.tagName==="BUTTON") send(e.target.dataset.q); });

/* ---------- 开场白（不自动发声，避免浏览器自动播放限制） ---------- */
window.addEventListener("load", ()=>{
  addLucas({id:"intro", fr:"Bonjour, je m'appelle Lucas. Enchanté ! Si tu veux, on peut discuter en français — la lecture, la musique, Paris… tout m'intéresse.",
            zh:"你好，我叫 Lucas，很高兴认识你！我们可以用法语聊聊——读书、音乐、巴黎……什么都行。"}, true);
});
