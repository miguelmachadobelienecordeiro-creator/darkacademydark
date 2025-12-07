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

// ----------------- LOGIN -----------------
function login(){
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    if(!email || !password){ alert("Preencha todos os campos!"); return; }
    database.ref("users").once("value").then(snap=>{
        let loggedIn=false;
        snap.forEach(userSnap=>{
            const user=userSnap.val();
            if(user.email===email && user.password===password){
                loggedIn=true;
                localStorage.setItem("currentUser", userSnap.key);
                localStorage.setItem("currentNick", user.nick);
                window.location.href="dashboard.html";
            }
        });
        if(!loggedIn) alert("Email ou senha incorretos!");
    });
}

// ----------------- REGISTRO -----------------
function register(){
    const nick=document.getElementById("register-nick").value;
    const email=document.getElementById("register-email").value;
    const password=document.getElementById("register-password").value;
    if(!nick || !email || !password){ alert("Preencha todos os campos!"); return; }
    const userId='user_'+Date.now();
    database.ref("users/"+userId).set({
        nick:nick,
        email:email,
        password:password,
        profilePic:"default-profile.png",
        stats:{}
    }).then(()=>{
        alert("Cadastro realizado com sucesso!");
        localStorage.setItem("currentUser",userId);
        localStorage.setItem("currentNick",nick);
        window.location.href="dashboard.html";
    }).catch(err=>alert("Erro ao cadastrar: "+err));
}

// ----------------- DASHBOARD -----------------
let currentUserId=localStorage.getItem("currentUser");
let currentUserNick=localStorage.getItem("currentNick");
if(currentUserId && document.getElementById("welcome")){
    database.ref("users/"+currentUserId).once("value").then(snap=>{
        const user=snap.val();
        if(user){
            document.getElementById("welcome").innerText=`Bem-vindo, ${user.nick}`;
            document.getElementById("profile-pic").src=user.profilePic||"default-profile.png";
            loadAllRankings();
            loadPendingValidations();
        } else {
            localStorage.removeItem("currentUser");
            window.location.href="index.html";
        }
    });
}

// ----------------- EDITAR PERFIL -----------------
function editProfile(){
    const newNick=prompt("Digite seu novo nick:","");
    if(newNick){
        database.ref(`users/${currentUserId}/nick`).set(newNick).then(()=>{
            alert("Nick atualizado!");
            document.getElementById("welcome").innerText=`Bem-vindo, ${newNick}`;
            currentUserNick=newNick;
            loadAllRankings();
        });
    }
    const newPic=prompt("URL da nova foto de perfil:","");
    if(newPic){
        database.ref(`users/${currentUserId}/profilePic`).set(newPic).then(()=>{
            document.getElementById("profile-pic").src=newPic;
            alert("Foto de perfil atualizada!");
        });
    }
}

// ----------------- MODOS -----------------
let currentMode="bedwars";
let chattingWith=null;
const allowedVideoUsers=["DARK","ARTHUR","60k"];
const modeContainer=document.getElementById("mode-container");

function showMode(mode){
    currentMode=mode;
    modeContainer.innerHTML="";

    const kills=document.createElement("input"); kills.placeholder="Kills"; kills.id="stat-kills";
    const wins=document.createElement("input"); wins.placeholder="Vitórias"; wins.id="stat-wins";
    const partidas=document.createElement("input"); partidas.placeholder="Partidas"; partidas.id="stat-partidas";

    if(mode==="fortnite") wins.style.display="none";
    if(mode==="clashroyale") { kills.placeholder="Trofeus"; wins.style.display="none"; partidas.style.display="none"; }
    if(mode==="freefire") { wins.placeholder="Danos"; partidas.placeholder="Partidas"; }

    let serverInput=null;
    if(mode==="bedwars"){
        serverInput=document.createElement("select"); serverInput.id="stat-server";
        ["Hylex","Mush","Hypixel"].forEach(s=>{
            const option=document.createElement("option");
            option.value=s; option.text=s;
            serverInput.appendChild(option);
        });
    }

    const video=document.createElement("input"); video.placeholder="URL do vídeo"; video.id="stat-video";
    const submitBtn=document.createElement("button"); submitBtn.innerText="Enviar"; submitBtn.onclick=()=>submitStats();

    modeContainer.appendChild(kills);
    if(wins.style.display!=="none") modeContainer.appendChild(wins);
    modeContainer.appendChild(partidas);
    if(serverInput) modeContainer.appendChild(serverInput);
    modeContainer.appendChild(video);
    modeContainer.appendChild(submitBtn);
}

// ----------------- ENVIO DE STATS -----------------
function submitStats(){
    const kills=Number(document.getElementById("stat-kills").value)||0;
    const winsEl=document.getElementById("stat-wins");
    const wins=winsEl ? Number(winsEl.value):0;
    const partidas=Number(document.getElementById("stat-partidas").value)||0;
    const serverEl=document.getElementById("stat-server");
    const server=serverEl?serverEl.value:"";
    const videoURL=document.getElementById("stat-video").value||"";

    const pendingRef=database.ref(`pendingValidations/${currentMode}/${currentUserId}`);
    const newData={
        kills,
        wins,
        partidas,
        server,
        video:videoURL,
        nick:currentUserNick
    };
    pendingRef.set(newData).then(()=>{
        alert("Stats enviados para validação!");
        modeContainer.innerHTML="";
    });
}

// ----------------- PENDENTES PARA VALIDAR -----------------
function loadPendingValidations(){
    if(!allowedVideoUsers.includes(currentUserNick)) return;

    let container=document.getElementById("validation-container");
    if(!container){
        container=document.createElement("div");
        container.id="validation-container";
        document.body.appendChild(container);
    }

    database.ref("pendingValidations").on("value",snap=>{
        container.innerHTML="<h2>Validações Pendentes</h2>";
        snap.forEach(modeSnap=>{
            const mode=modeSnap.key;
            modeSnap.forEach(userSnap=>{
                const data=userSnap.val();
                const div=document.createElement("div");
                div.style.background="#1a001a"; div.style.margin="5px"; div.style.padding="10px"; div.style.borderRadius="10px"; div.style.color="#fff";
                div.innerHTML=`
                    <strong>${data.nick}</strong> (${mode}) - Kills: ${data.kills}, Vitórias: ${data.wins}, Partidas: ${data.partidas} 
                    <button>Validar</button>
                    <button>Não Validado</button>
                    ${data.video?`<a href="${data.video}" target="_blank">Vídeo</a>`:""}
                `;
                div.querySelectorAll("button")[0].onclick=()=>{
                    database.ref(`users/${userSnap.key}/stats/${mode}`).set({
                        kills:data.kills,
                        wins:data.wins,
                        partidas:data.partidas,
                        server:data.server||"",
                        videos:data.video?[data.video]:[]
                    }).then(()=>{
                        database.ref(`pendingValidations/${mode}/${userSnap.key}`).remove();
                        alert(`${data.nick} validado!`);
                        loadAllRankings();
                    });
                };
                div.querySelectorAll("button")[1].onclick=()=>{
                    database.ref(`pendingValidations/${mode}/${userSnap.key}`).remove();
                    alert(`${data.nick} não validado!`);
                };
                container.appendChild(div);
            });
        });
    });
}

// ----------------- RANKING SEPARADO -----------------
const rankingContainer=document.getElementById("ranking-container");

function loadAllRankings(){
    rankingContainer.innerHTML="";
    ["bedwars","fortnite","freefire","clashroyale"].forEach(mode=>{
        const title=document.createElement("h3");
        title.innerText=mode.charAt(0).toUpperCase()+mode.slice(1);
        rankingContainer.appendChild(title);

        const modeDiv=document.createElement("div");
        rankingContainer.appendChild(modeDiv);

        database.ref("users").once("value").then(snap=>{
            const users=[];
            snap.forEach(u=>{
                const userData=u.val();
                const stats=userData.stats?userData.stats[mode]:null;
                if(stats) users.push({nick:userData.nick,id:u.key,stats,profilePic:userData.profilePic||"default-profile.png"});
            });

            users.sort((a,b)=>b.stats.kills-a.stats.kills);
            users.slice(0,100).forEach((u,index)=>{
                const div=document.createElement("div");
                div.classList.add("rank-card");
                div.innerHTML=`
                    <div style="display:flex;align-items:center;">
                        <div class="rank-number">#${index+1}</div>
                        <img class="rank-pic" src="${u.profilePic}" alt="Foto">
                        <div class="rank-info">
                            <span>${u.nick}</span>
                            <span>Kills: ${u.stats.kills}</span>
                            <span>Vitórias: ${u.stats.wins}</span>
                            <span>Partidas: ${u.stats.partidas}</span>
                        </div>
                    </div>
                    ${allowedVideoUsers.includes(currentUserNick)?`<button onclick="removeRank('${mode}','${u.id}')">Remover do Rank</button>`:""}
                `;
                modeDiv.appendChild(div);
            });
        });
    });
}

function removeRank(mode,userId){
    if(confirm("Remover do ranking?")){
        database.ref(`users/${userId}/stats/${mode}`).remove();
        loadAllRankings();
        alert("Removido do ranking!");
    }
}

// ----------------- CHAT -----------------
function openChat(userId,nick){
    chattingWith=userId;
    document.getElementById("chat-with").innerText=nick;
    document.getElementById("chat-container").style.display="block";

    const messagesDiv=document.getElementById("chat-messages");
    const chatRef=database.ref(`chats/${currentUserId}/${chattingWith}`);
    chatRef.on("value",snap=>{
        messagesDiv.innerHTML="";
        snap.forEach(s=>{
            const m=s.val();
            const div=document.createElement("div");
            div.innerText=`${m.from===currentUserId?"Você":"Outro"}: ${m.text}`;
            messagesDiv.appendChild(div);
        });
        messagesDiv.scrollTop=messagesDiv.scrollHeight;
    });
}

function closeChat(){
    if(!chattingWith) return;
    database.ref(`chats/${currentUserId}/${chattingWith}`).off();
    chattingWith=null;
    document.getElementById("chat-container").style.display="none";
}

function sendMessage(){
    const msgInput=document.getElementById("chat-input");
    if(!chattingWith || msgInput.value==="") return;
    const msg={from:currentUserId,text:msgInput.value,timestamp:Date.now()};
    database.ref(`chats/${currentUserId}/${chattingWith}`).push(msg);
    database.ref(`chats/${chattingWith}/${currentUserId}`).push(msg);
    msgInput.value="";
}
