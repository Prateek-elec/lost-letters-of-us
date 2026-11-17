// 🏆 Minecraft-style "Achievement unlocked!" pop-ups, and the yellow "Prateek joined the game" chat line.
// Each one shows only once (remembered on her phone), with a little counter so she knows there are more to find.

const ACH = {
  world:    ["⛏️", "Our Little World",      "Find the block corner"],
  creeper:  ["💥", "Sssso In Love",         "Get a hug from the Creeper"],
  diamond:  ["💎", "DIAMONDS!",             "Find the rarest thing on the island"],
  craft:    ["🛠️", "Crafted With Love",     "Craft a heart"],
  craftdia: ["💗", "Enchanted",             "Craft a Diamond Heart"],
  sheep:    ["🐑", "One in Six Hundred",    "Meet the pink sheep"],
  home:     ["🛏️", "Home Sweet Home",       "Set your respawn point"],
  letter:   ["✉️", "Memory Miner",          "Open your first lost letter"],
  words:    ["🗝️", "Every Word",            "Find all five words"],
  finale:   ["🚪", "Player Two",            "Open the Last Door"],
  ride:     ["🎡", "Higher Than the Moon",  "Ride the Ferris wheel together"],
  lanterns: ["🏮", "Light Up the Sky",      "Release lanterns together"],
  dance:    ["💃", "Dance Partner",         "Dance together on the dance floor"],
  bench:    ["🪑", "Sit With Me",           "Sit together on a bench"],
  fireworks:["🎆", "Sky on Fire",           "Start the grand firework show"],
  stars:    ["🔭", "Stargazer",             "Look through the telescope"],
  gift:     ["🎁", "Gift Received",         "Open a love coupon"],
  hearts:   ["💞", "Collector of Hearts",   "Find every floating heart"],
  lap:      ["🏁", "Speedrunner",           "Finish a Love Lap"],
};
const ACH_KEY = "lost-letters-achievements";
const achGot = new Set((()=>{ try { return JSON.parse(localStorage.getItem(ACH_KEY)) || []; } catch(e){ return []; } })());
const achBox = document.createElement("div"); achBox.id = "ach"; achBox.setAttribute("aria-live", "polite"); $("#app").appendChild(achBox);
const chatBox = document.createElement("div"); chatBox.id = "mcchat"; chatBox.setAttribute("aria-live", "polite"); $("#app").appendChild(chatBox);
const achQueue = []; let achBusy = false;

function achieve(id){
  if (!ACH[id] || achGot.has(id)) return;
  achGot.add(id); try { localStorage.setItem(ACH_KEY, JSON.stringify([...achGot])); } catch(e){}
  achQueue.push(id); if (!achBusy) achNext();
}
function achNext(){
  const id = achQueue.shift(); if (!id){ achBusy = false; return; } achBusy = true;
  const [icon, title, desc] = ACH[id];
  achBox.innerHTML = `<div class="aicon">${icon}</div><div class="atext"><b>Achievement unlocked!</b><span>${esc(title)}</span><small>${esc(desc)} · ${achGot.size}/${Object.keys(ACH).length}</small></div>`;
  achBox.classList.remove("show"); void achBox.offsetWidth; achBox.classList.add("show");
  chime(1047, .05); chime(1319, .17);
  setTimeout(()=>{ achBox.classList.remove("show"); setTimeout(achNext, 450); }, 4300);
}
// a yellow line like a game chat message
function mcChat(text){
  const p = document.createElement("p"); p.textContent = text; chatBox.appendChild(p);
  setTimeout(()=>p.classList.add("fade"), 7000); setTimeout(()=>p.remove(), 8200);
}
