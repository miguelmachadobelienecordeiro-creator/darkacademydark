// ----------------- CONFIG FIREBASE -----------------
const firebaseConfig = {
  apiKey: "AIzaSyCkmqu60VH5bsHE4c8J0fZesiPGBFJprw0",
  authDomain: "dark-academy-dc5f4.firebaseapp.com",
  databaseURL: "https://dark-academy-dc5f4-default-rtdb.firebaseio.com",
  projectId: "dark-academy-dc5f4",
  storageBucket: "dark-academy-dc5f4.firebasestorage.app",
  messagingSenderId: "182340690460",
  appId: "1:182340690460:web:ee84ca564efb931a7535d9",
  measurementId: "G-66Q9VXG8CE"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ----------------- GLOBALS -----------------
let currentUserId = localStorage.getItem("currentUser");
let currentUserNick = localStorage.getItem("currentNick");
let chattingWith = null;

// Admins por nick
const ADMINS_NICKS = ["DARK","ARTHUR","60K"];

// ----------------- UTIL -----------------
function el(id){ return document.getElementById(id); }
function setContent(html){ const c = el("content"); if(c) c.innerHTML = html; }

// ----------------- NAV / PAGES -----------------
window.loadPage = function(page){
  if(!currentUserId){
    alert("Faça login primeiro!");
    window.location.href = "index.html";
    return;
  }

  const content = el("content");
  if(!content) return;

  if(page==="home"){
    setContent(`<div class="card"><h2>Bem-vindo, ${currentUserNick}</h2><p>Use o menu à esquerda para navegar.</p></div>`);
  }

  if(page==="bedwars"){
    setContent(`
      <div class="card">
        <h2>BedWars</h2>
        <label>Kills:</label><input id="bw-kills" type="number" class="input"><br>
        <label>Vitórias:</label><input id="bw-wins" type="number" class="input"><br>
        <label>Partidas jogadas:</label><input id="bw-partidas" type="number" class="input"><br>
        <label>Link do vídeo:</label><input id="bw-video" type="text" class="input"><br>
        <button onclick="saveBedwars()">Enviar para Validação</button>
      </div>`);
  }

  if(page==="freefire"){
    setContent(`
      <div class="card">
        <h2>Free Fire</h2>
        <label>Kills:</label><input id="ff-kills" type="number" class="input"><br>
        <label>Dano:</label><input id="ff-dano" type="number" class="input"><br>
        <label>Modo:</label>
        <select id="ff-modo" class="input"><option>Ranked</option><option>CS</option></select><br>
        <label>Link do vídeo:</label><input id="ff-video" type="text" class="input"><br>
        <button onclick="saveFreeFire()">Enviar para Validação</button>
      </div>`);
  }

  if(page==="fortnite"){
    setContent(`
      <div class="card">
        <h2>Fortnite</h2>
        <label>Kills:</label><input id="fn-kills" type="number" class="input"><br>
        <label>Link do vídeo:</label><input id="fn-video" type="text" class="input"><br>
        <button onclick="saveFortnite()">Enviar para Validação</button>
      </div>`);
  }

  if(page==="clashroyale"){
    setContent(`
      <div class="card">
        <h2>Clash Royale</h2>
        <label>Troféus ganhos:</label><input id="cr-trofeus" type="number" class="input"><br>
        <label>Tag do jogador:</label><input id="cr-tag" type="text" class="input"><br>
        <label>Link do vídeo:</label><input id="cr-video" type="text" class="input"><br>
        <button onclick="saveClash()">Enviar para Validação</button>
      </div>`);
  }

  if(page==="rankings"){
    setContent(`
      <div class="card">
        <h2>Rankings Detalhados</h2>
        <h3>BedWars</h3><div id="rank-bedwars"></div>
        <h3>Free Fire</h3><div id="rank-freefire"></div>
        <h3>Fortnite</h3><div id="rank-fortnite"></div>
        <h3>Clash Royale</h3><div id="rank-clashroyale"></div>
      </div>`);
    loadAllRankings();
  }

  if(page==="validacoes"){
    if(!ADMINS_NICKS.includes(currentUserNick)){
      setContent(`<div class="card">Acesso negado. Apenas admins podem ver esta página.</div>`);
      return;
    }
    setContent(`<div class="card"><h2>Validações Pendentes</h2><div id="pending-validations"></div></div>`);
    loadPendingValidations();
  }

  if(page==="chat"){
    setContent(`
      <div class="card">
        <h2>Chat Privado</h2>
        <input id="chat-to" placeholder="ID do usuário" class="input">
        <button onclick="openChat(document.getElementById('chat-to').value.trim())" class="send-btn">Abrir chat</button>
        <div id="chat-messages"></div>
        <input id="chat-input" placeholder="Digite sua mensagem..." class="input">
        <button onclick="sendMessage(document.getElementById('chat-input').value)" class="send-btn">Enviar</button>
      </div>`);
  }
};

// ----------------- DASHBOARD INIT -----------------
function initDashboard(){
  currentUserId = localStorage.getItem("currentUser");
  currentUserNick = localStorage.getItem("currentNick");
  if(!currentUserId){ window.location.href="index.html"; return; }
  loadPage("home");
}
document.addEventListener("DOMContentLoaded", initDashboard);

// ----------------- SALVAR MODALIDADES -----------------
function saveBedwars(){ database.ref(`users/${currentUserId}/stats/bedwars`).set({
  kills:Number(el("bw-kills").value)||0,
  wins:Number(el("bw-wins").value)||0,
  partidas:Number(el("bw-partidas").value)||0,
  video:el("bw-video").value,
  validado:false
}); alert("BedWars enviado para validação!"); }

function saveFreeFire(){ database.ref(`users/${currentUserId}/stats/freefire`).set({
  kills:Number(el("ff-kills").value)||0,
  dano:Number(el("ff-dano").value)||0,
  modo:el("ff-modo").value,
  video:el("ff-video").value,
  validado:false
}); alert("Free Fire enviado para validação!"); }

function saveFortnite(){ database.ref(`users/${currentUserId}/stats/fortnite`).set({
  kills:Number(el("fn-kills").value)||0,
  video:el("fn-video").value,
  validado:false
}); alert("Fortnite enviado para validação!"); }

function saveClash(){ database.ref(`users/${currentUserId}/stats/clashroyale`).set({
  trofeus:Number(el("cr-trofeus").value)||0,
  tag:el("cr-tag").value,
  video:el("cr-video").value,
  validado:false
}); alert("Clash Royale enviado para validação!"); }

// ----------------- RANKINGS -----------------
function loadAllRankings(){ ["bedwars","freefire","fortnite","clashroyale"].forEach(loadRankingForMode); }

function loadRankingForMode(mode){
  const container = el("rank-"+mode); if(!container) return;
  database.ref("users").once("value").then(snap=>{
    let arr=[];
    snap.forEach(uSnap=>{
      const u = uSnap.val();
      const stats = u.stats?.[mode];
      if(stats?.validado) arr.push({uid:uSnap.key,nick:u.nick,stats});
    });

    // Ordenar pelo score da modalidade
    arr.sort((a,b)=>{
      switch(mode){
        case "bedwars": return (b.stats.kills + b.stats.wins*10 + b.stats.partidas*0.5) - (a.stats.kills + a.stats.wins*10 + a.stats.partidas*0.5);
        case "freefire": return (b.stats.kills + (b.stats.dano||0)/100) - (a.stats.kills + (a.stats.dano||0)/100);
        case "fortnite": return (b.stats.kills||0) - (a.stats.kills||0);
        case "clashroyale": return (b.stats.trofeus||0) - (a.stats.trofeus||0);
      }
    });

    container.innerHTML="";
    arr.forEach((u,i)=>{
      let div=document.createElement("div");
      div.className="rank-entry";
      let info="";
      switch(mode){
        case "bedwars": info=`Kills: ${u.stats.kills} | Wins: ${u.stats.wins} | Partidas: ${u.stats.partidas} | <a href="${u.stats.video}" target="_blank">Vídeo</a>`; break;
        case "freefire": info=`Kills: ${u.stats.kills} | Dano: ${u.stats.dano} | Modo: ${u.stats.modo} | <a href="${u.stats.video}" target="_blank">Vídeo</a>`; break;
        case "fortnite": info=`Kills: ${u.stats.kills} | <a href="${u.stats.video}" target="_blank">Vídeo</a>`; break;
        case "clashroyale": info=`Troféus: ${u.stats.trofeus} | Tag: ${u.stats.tag} | <a href="${u.stats.video}" target="_blank">Vídeo</a>`; break;
      }
      div.innerHTML=`<span>${i+1}º - ${u.nick}</span><span>${info}</span>`;
      container.appendChild(div);
    });
  });
}

// ----------------- VALIDAÇÕES PENDENTES -----------------
function loadPendingValidations(){
  const container=el("pending-validations"); if(!container) return;
  database.ref("users").once("value").then(snap=>{
    container.innerHTML="";
    snap.forEach(uSnap=>{
      const u = uSnap.val();
      ["bedwars","freefire","fortnite","clashroyale"].forEach(mode=>{
        const s = u.stats?.[mode];
        if(s && !s.validado){
          let div=document.createElement("div");
          div.className="rank-entry";
          let info="";
          switch(mode){
            case "bedwars": info=`Kills: ${s.kills} | Wins: ${s.wins} | Partidas: ${s.partidas} | <a href="${s.video}" target="_blank">Vídeo</a>`; break;
            case "freefire": info=`Kills: ${s.kills} | Dano: ${s.dano} | Modo: ${s.modo} | <a href="${s.video}" target="_blank">Vídeo</a>`; break;
            case "fortnite": info=`Kills: ${s.kills} | <a href="${s.video}" target="_blank">Vídeo</a>`; break;
            case "clashroyale": info=`Troféus: ${s.trofeus} | Tag: ${s.tag} | <a href="${s.video}" target="_blank">Vídeo</a>`; break;
          }
          div.innerHTML=`<span>${u.nick} (${mode})</span><span>${info}</span>`;
          const btnV=document.createElement("button"); btnV.textContent="Validar"; btnV.onclick=()=>validateUser(uSnap.key,mode,true);
          const btnR=document.createElement("button"); btnR.textContent="Recusar"; btnR.onclick=()=>validateUser(uSnap.key,mode,false);
          div.appendChild(btnV); div.appendChild(btnR);
          container.appendChild(div);
        }
      });
    });
  });
}

function validateUser(userId,mode,approve){
  if(!approve) return database.ref(`users/${userId}/stats/${mode}`).remove().then(()=>loadPendingValidations());
  database.ref(`users/${userId}/stats/${mode}`).update({validado:true}).then(()=>{
    loadPendingValidations();
    loadRankingForMode(mode);
  });
}

// ----------------- CHAT -----------------
function openChat(withUserId){
  if(!withUserId){ alert("Digite o ID do usuário"); return; }
  chattingWith=withUserId;
  const chatBox=el("chat-messages");
  chatBox.innerHTML="";
  const chatId=[currentUserId,chattingWith].sort().join("_");
  database.ref("chat/"+chatId).on("child_added",snap=>{
    const m=snap.val();
    const div=document.createElement("div");
    div.innerHTML=`<b>${m.from===currentUserId?"Você":m.from}:</b> ${m.msg}`;
    chatBox.appendChild(div);
    chatBox.scrollTop=chatBox.scrollHeight;
  });
}

function sendMessage(msg){
  if(!chattingWith){ alert("Abra um chat com um usuário primeiro!"); return; }
  const chatId=[currentUserId,chattingWith].sort().join("_");
  database.ref("chat/"+chatId).push({from:currentUserId,to:chattingWith,msg,timestamp:Date.now()});
}

// ----------------- LOGOUT -----------------
function logout(){ localStorage.removeItem("currentUser"); localStorage.removeItem("currentNick"); window.location.href="index.html"; }
