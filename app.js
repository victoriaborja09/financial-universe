
const STORE_KEY = "financial-universe-v1";

const DEMO_PROFILE = {
  name: "Victoria", age: 22, city: "New York City", employment: "Full-time",
  salary: 110000, payFrequency: "Biweekly", rent: 2400, baseline: 2000,
  checking: 3500, savings: 4000, debt: 15000, debtPayment: 250,
  hasCard: false, has401k: true, match: 4
};

const CARDS = [
  { id:"starter", name:"Starter Cash", tone:"", rewards:"1.5% cash back", annualFee:0, apr:24.99, limit:2500, fx:3, rewardRate:0.015, travelRate:0.015, blurb:"Simple rewards and no annual fee." },
  { id:"everyday", name:"Everyday 2", tone:"dark", rewards:"2% cash back", annualFee:0, apr:27.49, limit:3500, fx:3, rewardRate:0.02, travelRate:0.02, blurb:"Higher flat rewards with the same foreign transaction fee." },
  { id:"travel", name:"Travel Starter", tone:"clay", rewards:"3× travel", annualFee:95, apr:25.99, limit:5000, fx:0, rewardRate:0.01, travelRate:0.03, blurb:"Travel-focused rewards, no foreign transaction fee, and an annual fee." }
];

const SECURITIES = [
  {ticker:"VTI",name:"Vanguard Total Stock Market ETF",type:"ETF",move:-0.04,blurb:"Broad exposure to the U.S. stock market through one fund."},
  {ticker:"VOO",name:"Vanguard S&P 500 ETF",type:"ETF",move:-0.045,blurb:"Tracks large U.S. companies in the S&P 500."},
  {ticker:"SPY",name:"SPDR S&P 500 ETF Trust",type:"ETF",move:-0.044,blurb:"Another widely used S&P 500 index ETF."},
  {ticker:"QQQ",name:"Invesco QQQ Trust",type:"ETF",move:-0.075,blurb:"Large growth and technology-heavy Nasdaq-100 exposure."},
  {ticker:"IWM",name:"iShares Russell 2000 ETF",type:"ETF",move:-0.065,blurb:"Exposure to smaller publicly traded U.S. companies."},
  {ticker:"BND",name:"Vanguard Total Bond Market ETF",type:"Bond ETF",move:0.012,blurb:"Broad investment-grade U.S. bond exposure."},
  {ticker:"TLT",name:"iShares 20+ Year Treasury Bond ETF",type:"Bond ETF",move:0.025,blurb:"Long-duration U.S. Treasury bond exposure."},
  {ticker:"NVDA",name:"NVIDIA",type:"Stock",move:-0.12,blurb:"Single-company exposure to NVIDIA."},
  {ticker:"AAPL",name:"Apple",type:"Stock",move:-0.07,blurb:"Single-company exposure to Apple."},
  {ticker:"MSFT",name:"Microsoft",type:"Stock",move:-0.06,blurb:"Single-company exposure to Microsoft."},
  {ticker:"AMZN",name:"Amazon",type:"Stock",move:-0.09,blurb:"Single-company exposure to Amazon."},
  {ticker:"GOOGL",name:"Alphabet",type:"Stock",move:-0.08,blurb:"Single-company exposure to Alphabet."},
  {ticker:"META",name:"Meta Platforms",type:"Stock",move:-0.10,blurb:"Single-company exposure to Meta."},
  {ticker:"TSLA",name:"Tesla",type:"Stock",move:-0.16,blurb:"Single-company exposure with historically larger price swings."},
  {ticker:"JPM",name:"JPMorgan Chase",type:"Stock",move:-0.035,blurb:"Single-company exposure to a large U.S. bank."},
  {ticker:"BAC",name:"Bank of America",type:"Stock",move:-0.05,blurb:"Single-company exposure to banking and financial services."},
  {ticker:"COST",name:"Costco Wholesale",type:"Stock",move:-0.025,blurb:"Single-company exposure to Costco."},
  {ticker:"KO",name:"Coca-Cola",type:"Stock",move:0.01,blurb:"Single-company exposure to a global consumer staples company."},
  {ticker:"DIS",name:"Walt Disney",type:"Stock",move:-0.055,blurb:"Single-company exposure to Disney."},
  {ticker:"NFLX",name:"Netflix",type:"Stock",move:-0.085,blurb:"Single-company exposure to Netflix."}
];

const MISSION_META = {
  wallet:["Build Your Wallet","Explore how credit products trade off fees, rewards, flexibility and borrowing cost."],
  paycheck:["Put Your Paycheck to Work","See what reaches you after taxes and baseline costs, then choose a 401(k) contribution."],
  allocate:["Where Should Your Money Live?","Choose the financial containers for this month's decision money."],
  invest:["Put Your Money to Work","Funding an investment account and investing the cash inside it are two different steps."],
  expense:["Unexpected Expense","Your laptop dies. Build the $1,800 payment from the resources in your Universe."],
  travel:["Going Abroad","Your earlier card choice matters when you spend $1,500 overseas."],
  volatility:["Market Volatility","Your holdings moved. Decide whether to hold, sell, add or experiment first."],
  bonus:["Year-End Bonus","Allocate a $5,000 after-tax bonus using the tools you unlocked."],
  wrap:["Money Wrap","See the story of your year, then replay it with the same circumstances."]
};

const TOOLKIT = [
  ["Credit & APR","wallet"],["401(k) & employer match","paycheck"],["Account containers","allocate"],
  ["ETFs & diversification","invest"],["Liquidity","expense"],["Foreign transaction fees","travel"],
  ["Volatility","volatility"],["Opportunity cost","bonus"]
];

let state = loadState();
let onboardingStep = 0;
let onboardingDraft = null;
let marketQuery = "";
let marketAccount = "roth";
let selectedTicker = "VTI";
let orderAmount = 0;
let allocationGoal = "unknown";
let volatilityAction = "hold";

function money(n, cents) {
  const v = Number(n || 0);
  return (v < 0 ? "−" : "") + "$" + Math.abs(v).toLocaleString("en-US", {
    minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0
  });
}

function deepCopy(v){ return JSON.parse(JSON.stringify(v)); }
function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

function emptyState(){
  return {
    profile:null, startingProfile:null, isDemo:false, missions:[], missionIdx:0, completed:[],
    app:"missions", cardId:null, k401Pct:null, decisionMoney:0, goal:null, allocation:null,
    accounts:{checking:0,savings:0,k401:0,rothCash:0,brokerageCash:0,debt:0,card:0},
    positions:[], history:[], expense:null, travel:null, volatility:null, bonus:null, lab:[],
    marketStage:0
  };
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? Object.assign(emptyState(), JSON.parse(raw)) : emptyState();
  }catch(e){ return emptyState(); }
}
function saveState(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function currentMission(){ return state.missions[state.missionIdx]; }
function currentCard(){ return CARDS.find(function(c){return c.id === state.cardId;}) || null; }
function security(t){ return SECURITIES.find(function(s){return s.ticker === t;}); }

function missionsFor(profile){
  return (profile.hasCard ? [] : ["wallet"]).concat(["paycheck","allocate","invest","expense","travel","volatility","bonus","wrap"]);
}

function startUniverse(profile, isDemo){
  state = emptyState();
  state.profile = deepCopy(profile);
  state.startingProfile = deepCopy(profile);
  state.isDemo = !!isDemo;
  state.missions = missionsFor(profile);
  state.cardId = profile.hasCard ? "existing" : null;
  state.accounts.checking = profile.checking;
  state.accounts.savings = profile.savings;
  state.accounts.debt = profile.debt;
  state.history.push({tag:"Start",title:"Year 1 begins",detail:profile.city+" · "+profile.employment+" · "+money(profile.salary)+" salary"});
  saveState();
  showDesk();
}

function paycheckCalc(pct){
  const gross = state.profile.salary / 12;
  const employee = state.profile.has401k ? gross * pct / 100 : 0;
  const employer = state.profile.has401k ? gross * Math.min(pct, state.profile.match) / 100 : 0;
  const estimatedTaxes = gross * 0.28;
  const remaining = gross - estimatedTaxes - employee - state.profile.rent - state.profile.baseline - state.profile.debtPayment;
  return {gross:gross, employee:employee, employer:employer, taxes:estimatedTaxes, remaining:Math.max(0,remaining)};
}

function positionValue(p){
  const sec = security(p.ticker);
  const factor = state.marketStage > 0 && sec ? 1 + sec.move : 1;
  return p.invested * factor;
}
function accountValue(account){
  const cash = account === "roth" ? state.accounts.rothCash : state.accounts.brokerageCash;
  return cash + state.positions.filter(function(p){return p.account === account;}).reduce(function(a,p){return a+positionValue(p);},0);
}
function netWorth(){
  return state.accounts.checking + state.accounts.savings + state.accounts.k401 + accountValue("roth") + accountValue("brokerage") - state.accounts.debt - state.accounts.card;
}
function totalCash(){ return state.accounts.checking + state.accounts.savings + state.accounts.rothCash + state.accounts.brokerageCash; }
function appUnlocked(app){
  if(app==="market") return state.completed.indexOf("allocate")>=0 && (state.accounts.rothCash+state.accounts.brokerageCash>0.5 || state.positions.length>0);
  if(app==="lab") return state.completed.indexOf("allocate")>=0;
  if(app==="wallet") return !!state.cardId || !!state.profile.hasCard;
  if(app==="wrap") return currentMission()==="wrap";
  return true;
}

function advance(){
  const cur = currentMission();
  if(cur && state.completed.indexOf(cur) === -1) state.completed.push(cur);
  state.missionIdx += 1;
  if(state.missions[state.missionIdx] === "invest" && state.accounts.rothCash + state.accounts.brokerageCash < 1){
    state.completed.push("invest");
    state.missionIdx += 1;
  }
  if(state.missions[state.missionIdx] === "volatility") state.marketStage = 1;
  state.app = state.missions[state.missionIdx] === "wrap" ? "wrap" : "missions";
  saveState();
  renderDesk();
}

function logDecision(tag,title,detail){
  state.history.push({tag:tag,title:title,detail:detail});
}

function showLanding(){
  document.getElementById("landing").classList.remove("hidden");
  document.getElementById("onboarding").classList.add("hidden");
  document.getElementById("desk").classList.add("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
}

function showOnboarding(){
  onboardingStep = 0;
  onboardingDraft = deepCopy(DEMO_PROFILE);
  onboardingDraft.name = "";
  onboardingDraft.city = "";
  onboardingDraft.checking = 0;
  onboardingDraft.savings = 0;
  onboardingDraft.debt = 0;
  document.getElementById("landing").classList.add("hidden");
  document.getElementById("desk").classList.add("hidden");
  document.getElementById("onboarding").classList.remove("hidden");
  renderOnboarding();
  window.scrollTo({top:0});
}

function showDesk(){
  document.getElementById("landing").classList.add("hidden");
  document.getElementById("onboarding").classList.add("hidden");
  document.getElementById("desk").classList.remove("hidden");
  renderDesk();
  window.scrollTo({top:0});
}

function renderOnboarding(){
  const root = document.getElementById("onboarding");
  const d = onboardingDraft;
  const steps = [
    {
      title:"Who are you?",
      copy:"Start with circumstances. The important financial choices happen inside the simulation.",
      body:
        '<div class="field-grid">'+
        field("Name","name",d.name,"text")+field("Age","age",d.age,"number")+
        field("City","city",d.city,"text")+
        '<div class="field-group"><label>Employment</label><select class="select" data-onboard="employment"><option>Full-time</option><option>Part-time</option><option>Student</option><option>Other</option></select></div>'+
        field("Annual salary","salary",d.salary,"number")+
        '<div class="field-group"><label>Pay cadence</label><select class="select" data-onboard="payFrequency"><option>Weekly</option><option selected>Biweekly</option><option>Semi-monthly</option><option>Monthly</option></select></div>'+
        '</div>'
    },
    {
      title:"What already leaves your account?",
      copy:"These are baseline assumptions, not choices we will ask you to micromanage.",
      body:'<div class="field-grid">'+field("Monthly rent","rent",d.rent,"number")+field("Baseline personal spending","baseline",d.baseline,"number")+field("Debt balance","debt",d.debt,"number")+field("Required monthly debt payment","debtPayment",d.debtPayment,"number")+'</div>'
    },
    {
      title:"What do you already have?",
      copy:"We use this to determine which first mission makes sense.",
      body:'<div class="field-grid">'+field("Checking balance","checking",d.checking,"number")+field("Savings balance","savings",d.savings,"number")+'</div>'+
        '<div class="switch-row"><div><b>Already have a credit card?</b><div class="subcopy">If yes, your first mission starts with your paycheck instead.</div></div><input type="checkbox" data-onboard-check="hasCard" '+(d.hasCard?"checked":"")+'></div>'
    },
    {
      title:"Employer benefits",
      copy:"We will make the contribution decision later, inside your Universe.",
      body:'<div class="switch-row"><div><b>Employer offers a 401(k)?</b></div><input type="checkbox" data-onboard-check="has401k" '+(d.has401k?"checked":"")+'></div>'+
        (d.has401k ? field("Employer match up to (%)","match",d.match,"number") : "")
    }
  ];
  const s = steps[onboardingStep];
  root.innerHTML =
    '<div class="onboard-shell">'+
      '<div class="onboard-top"><button class="brand ghost" data-action="landing">◉ Financial Universe</button><span class="eyebrow">Setup '+(onboardingStep+1)+' of 4</span></div>'+
      '<div class="progress"><span style="width:'+((onboardingStep+1)/4*100)+'%"></span></div>'+
      '<section class="panel" style="margin-top:18px"><span class="eyebrow">Build My Universe</span><h1 class="screen-title">'+s.title+'</h1><p class="subcopy">'+s.copy+'</p><div style="margin-top:22px">'+s.body+'</div>'+
      '<div class="onboard-actions"><button class="btn btn-outline" data-action="'+(onboardingStep===0?"landing":"onboard-back")+'">'+(onboardingStep===0?"Cancel":"Back")+'</button><button class="btn btn-primary" data-action="'+(onboardingStep===3?"onboard-finish":"onboard-next")+'">'+(onboardingStep===3?"Enter my Universe":"Continue →")+'</button></div></section>'+
    '</div>';
}

function field(label,key,value,type){
  return '<div class="field-group"><label>'+label+'</label><input class="field" data-onboard="'+key+'" type="'+type+'" value="'+esc(value)+'"></div>';
}

function renderDesk(){
  if(!state.profile){ showLanding(); return; }
  const root = document.getElementById("desk");
  const mission = currentMission();
  const meta = MISSION_META[mission] || ["Year complete",""];
  const apps = [
    ["missions","🎯","Missions"],["universe","◎","Universe"],["accounts","💰","Accounts"],
    ["market","📈","Market"],["wallet","💳","Wallet"],["lab","🧪","Lab"],["toolkit","◌","Toolkit"]
  ];
  if(mission === "wrap") apps.push(["wrap","✦","Wrap"]);
  root.innerHTML =
    '<div class="desk-scene"><div class="monitor"><div class="screen">'+
      '<div class="screen-menubar"><div class="screen-brand"><span>◉</span><span>Financial Universe</span><span class="pill">Year 1 · Mission '+(state.missionIdx+1)+'</span>'+(state.isDemo?'<span class="pill">Demo</span>':'')+'</div><div class="screen-stats"><span class="pill">Net worth '+money(netWorth())+'</span><button class="btn btn-outline" data-action="landing">Leave</button></div></div>'+
      '<div class="screen-content">'+renderApp(state.app)+'</div>'+
      '<div class="dock">'+apps.map(function(a){var unlocked=appUnlocked(a[0]);return '<button '+(unlocked?'data-app="'+a[0]+'"':'disabled')+' class="'+(state.app===a[0]?"active ":"")+(unlocked?"":"locked")+'"><span style="font-size:18px">'+a[1]+'</span><br>'+a[2]+'</button>';}).join("")+'</div>'+
    '</div></div><div class="desk-neck"></div><div class="desk-foot"></div></div>';
}

function renderApp(app){
  if(app === "missions") return renderMission();
  if(app === "universe") return renderUniverse();
  if(app === "accounts") return renderAccounts();
  if(app === "market") return renderMarket();
  if(app === "wallet") return renderWallet();
  if(app === "lab") return renderLab();
  if(app === "toolkit") return renderToolkit();
  if(app === "wrap") return renderWrap();
  return renderMission();
}

function renderUniverse(){
  const m = currentMission();
  const meta = MISSION_META[m];
  return '<div style="max-width:940px;margin:auto"><span class="eyebrow">Your financial system</span><h1 class="screen-title">'+esc(state.profile.name)+"'s Universe"+'</h1><p class="subcopy">Your balances and choices persist through the year. Lab experiments never change this view.</p>'+
    '<div class="dashboard-grid">'+
      metric("Checking",money(state.accounts.checking),"Available cash")+
      metric("Emergency savings",money(state.accounts.savings),"Liquid reserve")+
      metric("401(k)",money(state.accounts.k401),"Employee + employer contributions")+
      metric("Roth IRA",money(accountValue("roth")),positionSummary("roth"))+
      metric("Brokerage",money(accountValue("brokerage")),positionSummary("brokerage"))+
      metric("Student debt","−"+money(state.accounts.debt),"Required payment "+money(state.profile.debtPayment)+"/mo")+
      (state.cardId ? metric("Credit card balance","−"+money(state.accounts.card),currentCard()?currentCard().name:"Existing card") : "")+
    '</div>'+
    '<div class="mission-banner"><div><small>CURRENT MISSION</small><h3>'+meta[0]+'</h3><div>'+meta[1]+'</div></div><button class="btn btn-light" data-app="missions">Continue mission →</button></div>'+
    '<div style="margin-top:24px"><span class="eyebrow">Your decisions</span><div class="mission-list">'+
      state.history.slice().reverse().map(function(h){return '<div class="mission-row"><div><b>'+esc(h.title)+'</b><div class="subcopy">'+esc(h.detail)+'</div></div><span>'+esc(h.tag)+'</span></div>';}).join("")+
    '</div></div></div>';
}

function metric(label,value,detail){
  return '<div class="metric"><small>'+label+'</small><strong>'+value+'</strong><div class="detail">'+detail+'</div></div>';
}
function positionSummary(account){
  const ps = state.positions.filter(function(p){return p.account===account;});
  if(!ps.length) return account === "roth" ? money(state.accounts.rothCash)+" cash" : money(state.accounts.brokerageCash)+" cash";
  return ps.map(function(p){return p.ticker+" "+money(positionValue(p));}).join(" · ");
}

function renderAccounts(){
  return '<div style="max-width:900px;margin:auto"><span class="eyebrow">Containers</span><h1 class="screen-title">Where your money lives</h1><p class="subcopy"><b>An account is a container. An investment is what sits inside it.</b> Cash moved into a Roth IRA or brokerage account is not invested until you place an order.</p>'+
    '<div class="dashboard-grid">'+
    accountBox("Checking",state.accounts.checking,"Spendable cash")+
    accountBox("Emergency savings",state.accounts.savings,"Accessible reserve")+
    accountBox("401(k)",state.accounts.k401,"Retirement account")+
    investmentBox("Roth IRA","roth",state.accounts.rothCash)+
    investmentBox("Brokerage","brokerage",state.accounts.brokerageCash)+
    accountBox("Student debt",-state.accounts.debt,"Liability")+
    (state.cardId?accountBox("Credit card",-state.accounts.card,currentCard()?currentCard().name:"Existing card"):"")+
    '</div></div>';
}

function accountBox(name,value,detail){
  return '<div class="metric"><small>'+name+'</small><strong>'+money(value)+'</strong><div class="detail">'+detail+'</div></div>';
}
function investmentBox(name,account,cash){
  const ps = state.positions.filter(function(p){return p.account===account;});
  return '<div class="metric"><small>'+name+'</small><strong>'+money(accountValue(account))+'</strong><div class="detail">Cash: '+money(cash)+(ps.length?'<br>'+ps.map(function(p){return p.ticker+": "+money(positionValue(p));}).join("<br>"):"<br>Nothing invested yet")+'</div></div>';
}

function renderWallet(){
  if(!state.cardId) return '<div style="max-width:650px;margin:auto"><span class="eyebrow">Wallet</span><h1 class="screen-title">No credit card yet</h1><p class="subcopy">Your wallet will update after you make a card decision.</p></div>';
  if(state.cardId === "existing") return '<div style="max-width:650px;margin:auto"><span class="eyebrow">Wallet</span><h1 class="screen-title">Existing credit card</h1><div class="panel"><strong>Balance '+money(state.accounts.card)+'</strong><p class="subcopy">For custom universes with an existing card, the V1 prototype treats the card as available without modeling issuer-specific rewards.</p></div></div>';
  const c=currentCard();
  return '<div style="max-width:700px;margin:auto"><span class="eyebrow">Wallet</span><h1 class="screen-title">'+c.name+'</h1><div class="card-art '+c.tone+'"><div class="chipline"><span>'+c.name+'</span><span>•••• 2048</span></div><strong>'+c.rewards+'</strong><div class="chipline"><span>'+c.fx+'% foreign transaction fee</span><span>'+money(c.annualFee)+' annual fee</span></div></div><div class="dashboard-grid">'+metric("APR",c.apr.toFixed(2)+"%","Applies if a balance is carried")+metric("Credit limit",money(c.limit),"Maximum revolving balance")+metric("Current balance",money(state.accounts.card),"Changes with your decisions")+'</div></div>';
}

function renderMission(){
  const m=currentMission();
  if(m==="wallet") return missionWallet();
  if(m==="paycheck") return missionPaycheck();
  if(m==="allocate") return missionAllocate();
  if(m==="invest") return missionInvest();
  if(m==="expense") return missionExpense();
  if(m==="travel") return missionTravel();
  if(m==="volatility") return missionVolatility();
  if(m==="bonus") return missionBonus();
  if(m==="wrap") return '<div style="max-width:800px;margin:auto;text-align:center;padding:70px 0"><span class="eyebrow">Year 1 complete</span><h1 class="screen-title">Your Money Wrap is ready.</h1><button class="btn btn-primary btn-lg" data-app="wrap">Open Wrap</button></div>';
  return "";
}

function missionHeader(id){
  const meta=MISSION_META[id];
  return '<span class="eyebrow">Mission '+(state.missionIdx+1)+'</span><h1 class="mission-title">'+meta[0]+'</h1><p class="subcopy">'+meta[1]+'</p>';
}

function missionWallet(){
  const selected = state.cardId;
  return '<div style="max-width:980px;margin:auto">'+missionHeader("wallet")+
    '<div class="cards-grid">'+CARDS.map(function(c){return '<button class="choice '+(selected===c.id?"selected":"")+'" data-card="'+c.id+'"><div class="card-art '+c.tone+'"><div class="chipline"><span>'+c.name+'</span><span>••••</span></div><strong>'+c.rewards+'</strong><div class="chipline"><span>'+money(c.annualFee)+'/yr</span><span>'+c.fx+'% FX fee</span></div></div><div class="term-table"><div><small>APR</small><b>'+c.apr.toFixed(2)+'%</b></div><div><small>Limit</small><b>'+money(c.limit)+'</b></div><div><small>Fee</small><b>'+money(c.annualFee)+'</b></div><div><small>FX</small><b>'+c.fx+'%</b></div></div><p style="margin-top:10px">'+c.blurb+'</p></button>';}).join("")+'</div>'+
    '<div class="inline-note"><b>Why might someone choose differently?</b> A no-fee card can be attractive if you rarely travel. A travel-focused card can become more useful when foreign transaction fees or travel rewards matter. The product does not label one “best.”</div>'+
    '<div style="display:flex;justify-content:flex-end;margin-top:18px"><button class="btn btn-primary" data-action="finish-wallet" '+(!selected?"disabled":"")+'>Add to Wallet →</button></div></div>';
}

function missionPaycheck(){
  const pct = state.k401Pct == null ? 4 : state.k401Pct;
  const pc=paycheckCalc(pct);
  return '<div style="max-width:900px;margin:auto">'+missionHeader("paycheck")+
    '<div class="panel" style="margin-top:20px"><div class="dashboard-grid">'+
      metric("Gross monthly pay",money(pc.gross),"Before taxes and deductions")+
      metric("Estimated taxes",money(pc.taxes),"Prototype estimate for learning")+
      metric("Baseline living costs",money(state.profile.rent+state.profile.baseline+state.profile.debtPayment),"Rent + spending + required debt payment")+
    '</div>'+
    (state.profile.has401k?'<div style="margin-top:24px"><div style="display:flex;justify-content:space-between"><b>401(k) contribution</b><b>'+pct+'%</b></div><input id="k401Slider" type="range" min="0" max="15" step="1" value="'+pct+'" style="width:100%;margin:16px 0"><div class="dashboard-grid">'+metric("You contribute",money(pc.employee),"This month")+metric("Employer adds",money(pc.employer),"Match up to "+state.profile.match+"%")+metric("Decision money",money(pc.remaining),"Available after this month's baseline costs")+'</div><div class="inline-note">'+(pct<state.profile.match?"At "+pct+"%, you are not capturing the full employer match available in this Universe.":pct===state.profile.match?"At "+pct+"%, you capture the full employer match.":"The full employer match is captured. Contributions above "+state.profile.match+"% increase your own retirement savings, but not the employer match.")+'</div></div>':'<div class="inline-note">Your employer does not offer a 401(k) in this Universe. Decision money this month: <b>'+money(pc.remaining)+'</b>.</div>')+
    '<div style="display:flex;justify-content:flex-end;margin-top:18px"><button class="btn btn-primary" data-action="finish-paycheck">Lock this paycheck →</button></div></div></div>';
}

function missionAllocate(){
  const total=state.decisionMoney;
  const a=state.allocation || {emergency:0,extraDebt:0,roth:0,brokerage:0,checking:0};
  const used=a.emergency+a.extraDebt+a.roth+a.brokerage+a.checking;
  const remaining=Math.max(0,total-used);
  const goals=[["unknown","I don't know yet"],["liquid","I might need it soon"],["wealth","Build long-term wealth"],["medium","Save for something before retirement"],["debt","Reduce debt"]];
  return '<div style="max-width:940px;margin:auto">'+missionHeader("allocate")+
    '<div class="panel" style="margin-top:18px"><b>What are you hoping this money can do for you?</b><div class="context-question">'+goals.map(function(g){return '<button class="'+(allocationGoal===g[0]?"selected":"")+'" data-goal="'+g[0]+'">'+g[1]+'</button>';}).join("")+'</div><p class="subcopy">This does not choose for you. It changes the context around the tradeoffs you see.</p></div>'+
    '<div class="alloc-grid" style="margin-top:14px">'+
      allocCard("Emergency savings","emergency",a.emergency,"Easy access for unexpected needs.","Liquidity and stability","Lower growth potential")+
      allocCard("Extra debt payment","extraDebt",a.extraDebt,"Reduce money you already owe.","Lower future interest","Cash is no longer available elsewhere")+
      allocCard("Roth IRA","roth",a.roth,"Retirement account with special tax treatment.","Long-term tax advantages","Contribution and withdrawal rules")+
      allocCard("Brokerage","brokerage",a.brokerage,"Flexible taxable investing account.","Access before retirement","Different tax treatment than a Roth")+
      allocCard("Leave in checking","checking",a.checking,"Keep it immediately spendable.","Maximum flexibility","Usually little growth")+
    '</div>'+
    '<div class="summary-bar"><div><small>Still unallocated · anything left stays in checking</small><br><b>'+money(remaining)+'</b> of '+money(total)+'</div><button class="btn btn-primary" data-action="finish-allocation">Lock allocation →</button></div></div>';
}

function allocCard(title,key,value,desc,why,trade){
  return '<div class="alloc-card"><div class="alloc-head"><div><b>'+title+'</b><p>'+desc+'</p></div></div><div class="term-table"><div><small>Why use it</small><b>'+why+'</b></div><div><small>Tradeoff</small><b>'+trade+'</b></div></div><div class="stepper"><button data-alloc="'+key+'" data-delta="-100">−</button><b>'+money(value)+'</b><button data-alloc="'+key+'" data-delta="100">+</button></div></div>';
}

function missionInvest(){
  const cash=state.accounts.rothCash+state.accounts.brokerageCash;
  return '<div style="max-width:980px;margin:auto">'+missionHeader("invest")+
    '<div class="inline-note"><b>Account = container. Investment = what sits inside.</b> You moved '+money(cash)+' into investment accounts. That cash is still not invested until you place an order.</div>'+
    '<div style="margin-top:16px">'+renderMarketPanel(true)+'</div>'+
    '<div style="display:flex;justify-content:flex-end;margin-top:16px"><button class="btn btn-primary" data-action="finish-invest" '+(state.positions.length===0?"disabled":"")+'>Continue with these positions →</button></div></div>';
}

function renderMarketPanel(inMission){
  const results=SECURITIES.filter(function(s){const q=marketQuery.toLowerCase().trim();return !q||s.ticker.toLowerCase().includes(q)||s.name.toLowerCase().includes(q);});
  const sel=security(selectedTicker)||SECURITIES[0];
  const cash=marketAccount==="roth"?state.accounts.rothCash:state.accounts.brokerageCash;
  if(orderAmount>cash) orderAmount=Math.floor(cash);
  return '<div class="market-layout"><div><div class="account-tabs"><button class="btn '+(marketAccount==="roth"?"btn-primary":"btn-outline")+'" data-market-account="roth">Roth IRA · '+money(state.accounts.rothCash)+' cash</button><button class="btn '+(marketAccount==="brokerage"?"btn-primary":"btn-outline")+'" data-market-account="brokerage">Brokerage · '+money(state.accounts.brokerageCash)+' cash</button></div>'+
    '<input class="searchbar" id="marketSearch" placeholder="Search ticker, company or fund" value="'+esc(marketQuery)+'">'+
    '<div class="search-results">'+results.map(function(s){return '<div class="security-row '+(s.ticker===selectedTicker?"selected":"")+'" data-security="'+s.ticker+'"><b>'+s.ticker+'</b><div>'+s.name+'<br><small>'+s.type+'</small></div><span>'+((s.move>=0?"+":"")+(s.move*100).toFixed(1))+'%*</span></div>';}).join("")+'</div><p class="subcopy" style="font-size:11px">*Prototype move used later in the year. Not live market data.</p></div>'+
    '<div class="security-detail"><span class="eyebrow">'+sel.type+'</span><h2 style="margin:5px 0">'+sel.ticker+'</h2><p class="subcopy">'+sel.blurb+'</p><div class="inline-note"><b>Why might someone choose this?</b> '+(sel.type==="Stock"?"They may have a specific view on this company and accept that one company drives the entire position.":"They may want exposure to a basket of securities rather than relying on one company.")+'</div><div class="field-group" style="margin-top:16px"><label>Amount to invest from '+(marketAccount==="roth"?"Roth IRA":"Brokerage")+' cash</label><input id="orderAmount" class="field" type="number" min="0" max="'+cash+'" step="25" value="'+orderAmount+'"></div><button class="btn btn-primary" style="width:100%;margin-top:12px" data-action="review-order">Review Order</button></div></div>';
}

function renderMarketApp(){
  return '<div style="max-width:980px;margin:auto"><span class="eyebrow">Market</span><h1 class="screen-title">Search, choose, place an order.</h1><p class="subcopy">Orders here change your Universe. The Lab is where alternate realities live.</p><div style="margin-top:18px">'+renderMarket(false)+'</div></div>';
}

function renderMarket(){
  return renderMarketApp();
}

function brokerageInvestedValue(){
  return state.positions.filter(function(p){return p.account==="brokerage";}).reduce(function(a,p){return a+positionValue(p);},0);
}

function sellBrokerage(amount){
  const ps=state.positions.filter(function(p){return p.account==="brokerage";});
  const total=ps.reduce(function(a,p){return a+positionValue(p);},0);
  if(total<=0||amount<=0) return 0;
  const frac=Math.min(1,amount/total);
  const actual=total*frac;
  state.positions=state.positions.map(function(p){
    if(p.account!=="brokerage") return p;
    return Object.assign({},p,{invested:p.invested*(1-frac)});
  }).filter(function(p){return p.invested>0.01;});
  return actual;
}

function missionExpense(){
  const e=state.expense || {savings:1800,card:0,sell:0};
  const total=e.savings+e.card+e.sell;
  return '<div style="max-width:900px;margin:auto">'+missionHeader("expense")+
    '<div class="dashboard-grid" style="margin-top:18px">'+metric("Emergency savings",money(state.accounts.savings),"Available now")+metric("Credit available",state.cardId?(currentCard()?money(currentCard().limit-state.accounts.card):"Available"):"No card","Borrowing may carry interest")+metric("Brokerage investments",money(brokerageInvestedValue()),"Selling reduces market exposure")+'</div>'+
    '<div class="panel" style="margin-top:14px"><b>Build the $1,800 payment</b><div class="field-grid" style="margin-top:14px">'+expenseField("Emergency savings","savings",e.savings,state.accounts.savings)+expenseField("Credit card","card",e.card,state.cardId?1800:0)+expenseField("Sell brokerage investments","sell",e.sell,brokerageInvestedValue())+'</div><div class="inline-note">Total funded: <b>'+money(total)+'</b>. '+(Math.abs(total-1800)<.01?"This mix is ready.":"Your sources must total exactly $1,800.")+'</div><div style="display:flex;justify-content:flex-end;margin-top:16px"><button class="btn btn-primary" data-action="finish-expense" '+(Math.abs(total-1800)>.01?"disabled":"")+'>Use this mix →</button></div></div></div>';
}
function expenseField(label,key,value,max){ return '<div class="field-group"><label>'+label+'</label><input class="field expense-input" data-expense="'+key+'" type="number" min="0" max="'+Math.floor(max)+'" step="50" value="'+value+'"></div>'; }

function travelOutcome(method){
  const spend=1500;
  if(method==="credit"){
    const c=currentCard();
    if(!c) return {fees:0,rewards:0,cost:spend,copy:"No credit card is available in this Universe."};
    const fees=spend*c.fx/100, rewards=spend*c.travelRate;
    return {fees:fees,rewards:rewards,cost:spend+fees-rewards,copy:c.name+" charges "+c.fx+"% foreign transaction fee and earns approximately "+(c.travelRate*100).toFixed(1)+"% in this prototype."};
  }
  if(method==="debit") return {fees:0,rewards:0,cost:spend,copy:"This prototype assumes your debit card has no foreign transaction fee and earns no rewards."};
  return {fees:12,rewards:0,cost:spend+12,copy:"This prototype assumes $12 total exchange cost for obtaining and using cash."};
}

function missionTravel(){
  const method=(state.travel&&state.travel.method)||"debit";
  const o=travelOutcome(method);
  return '<div style="max-width:900px;margin:auto">'+missionHeader("travel")+
    '<div class="choice-grid">'+
      '<button class="choice '+(method==="credit"?"selected":"")+'" data-travel="credit" '+(!state.cardId?"disabled":"")+'><h4>'+(currentCard()?currentCard().name:"Credit card")+'</h4><p>'+(currentCard()?currentCard().fx+"% FX fee · "+currentCard().rewards:"No card available")+'</p></button>'+
      '<button class="choice '+(method==="debit"?"selected":"")+'" data-travel="debit"><h4>Debit card</h4><p>No rewards · no FX fee in this prototype</p></button>'+
      '<button class="choice '+(method==="cash"?"selected":"")+'" data-travel="cash"><h4>Cash</h4><p>No rewards · assume $12 exchange cost</p></button>'+
    '</div><div class="panel" style="margin-top:14px"><div class="dashboard-grid">'+metric("Purchases","$1,500","Trip spend")+metric("Fees",money(o.fees,true),"Payment friction")+metric("Rewards",money(o.rewards,true),"Earned back")+'</div><div class="inline-note">'+o.copy+' Net effective cost: <b>'+money(o.cost,true)+'</b>.</div><div style="display:flex;justify-content:flex-end;margin-top:16px"><button class="btn btn-primary" data-action="finish-travel">Use this payment method →</button></div></div></div>';
}

function missionVolatility(){
  const ps=state.positions;
  return '<div style="max-width:900px;margin:auto">'+missionHeader("volatility")+
    '<div class="dashboard-grid" style="margin-top:18px">'+(ps.length?ps.slice(0,6).map(function(p){const s=security(p.ticker);return metric(p.ticker,money(positionValue(p)),(s.move>=0?"+":"")+(s.move*100).toFixed(1)+"% prototype move");}).join(""):metric("No positions","$0","Your Universe stayed in cash"))+'</div>'+
    '<div class="panel" style="margin-top:14px"><b>What do you want to do?</b><div class="reaction-grid" style="margin-top:12px">'+
      reaction("hold","Hold","Leave your positions unchanged.")+reaction("sell","Sell brokerage","Move taxable investments to brokerage cash.")+reaction("add","Add $200","Increase your brokerage exposure using checking.")+
      '<button class="choice" data-app="lab"><h4>Open Lab</h4><p>Compare another path without changing your Universe.</p></button></div>'+
      '<div class="inline-note">Selected: <b>'+volatilityAction+'</b>. The simulation does not label the reaction right or wrong.</div><div style="display:flex;justify-content:flex-end;margin-top:16px"><button class="btn btn-primary" data-action="finish-volatility">Continue →</button></div></div></div>';
}
function reaction(id,title,copy){ return '<button class="choice '+(volatilityAction===id?"selected":"")+'" data-volatility="'+id+'"><h4>'+title+'</h4><p>'+copy+'</p></button>'; }

function missionBonus(){
  const b=state.bonus || {emergency:1000,extraDebt:1000,roth:1000,brokerage:1000,checking:1000,card:0};
  const sum=b.emergency+b.extraDebt+b.roth+b.brokerage+b.checking+b.card;
  return '<div style="max-width:940px;margin:auto">'+missionHeader("bonus")+
    '<div class="panel" style="margin-top:18px"><div class="dashboard-grid">'+metric("Bonus","$5,000","After tax")+metric("Emergency savings",money(state.accounts.savings),"Current")+metric("Debt + card",money(state.accounts.debt+state.accounts.card),"Current obligations")+'</div><div class="field-grid" style="margin-top:18px">'+
      bonusField("Emergency savings","emergency",b.emergency)+bonusField("Extra debt payment","extraDebt",b.extraDebt)+bonusField("Roth IRA","roth",b.roth)+bonusField("Brokerage","brokerage",b.brokerage)+bonusField("Leave in checking","checking",b.checking)+(state.accounts.card>0?bonusField("Pay credit card","card",b.card):"")+
      '</div><div class="inline-note">Allocated: <b>'+money(sum)+'</b>. '+(Math.abs(sum-5000)<.01?"Your full bonus is allocated.":"Allocations must total exactly $5,000.")+'</div><div style="display:flex;justify-content:flex-end;margin-top:16px"><button class="btn btn-primary" data-action="finish-bonus" '+(Math.abs(sum-5000)>.01?"disabled":"")+'>Finish my year →</button></div></div></div>';
}
function bonusField(label,key,value){ return '<div class="field-group"><label>'+label+'</label><input class="field bonus-input" data-bonus="'+key+'" type="number" min="0" step="250" value="'+value+'"></div>'; }

function renderLab(){
  const first=state.positions[0];
  if(!first) return '<div style="max-width:800px;margin:auto"><span class="eyebrow">Lab</span><h1 class="screen-title">Alternate realities only.</h1><p class="subcopy">Place an investment order first. Nothing you do here will change your Universe.</p></div>';
  const alt=(state.labDraft&&state.labDraft.alt)||"VTI";
  const s1=security(first.ticker), s2=security(alt);
  const universe=first.invested*(1+(state.marketStage?s1.move:0));
  const alternate=first.invested*(1+(state.marketStage?s2.move:0));
  return '<div style="max-width:900px;margin:auto"><span class="eyebrow">Lab</span><h1 class="screen-title">What if you chose differently?</h1><p class="subcopy">The Lab clones a decision. It never edits your Universe.</p>'+
    '<div class="panel" style="margin-top:18px"><div class="field-group"><label>Replace '+first.ticker+' with...</label><select class="select" id="labAlt">'+SECURITIES.map(function(s){return '<option value="'+s.ticker+'" '+(s.ticker===alt?"selected":"")+'>'+s.ticker+' · '+s.name+'</option>';}).join("")+'</select></div><div class="lab-compare" style="margin-top:14px"><div class="lab-box"><span class="eyebrow">Universe</span><h2>'+first.ticker+'</h2><strong>'+money(universe)+'</strong></div><div class="lab-box"><span class="eyebrow">Experiment</span><h2>'+alt+'</h2><strong>'+money(alternate)+'</strong></div></div><div class="inline-note">Difference over this prototype period: <b>'+money(alternate-universe)+'</b>. That does not prove one investment is universally better. It only shows what happened over this particular period.</div></div>'+
    (state.allocation?'<div class="panel" style="margin-top:14px"><b>Another question</b><p class="subcopy">What if the '+money(state.allocation.brokerage)+' you sent to brokerage had instead reduced debt? The Lab is designed to expand into these cross-account comparisons without touching the Universe.</p></div>':"")+'</div>';
}

function renderToolkit(){
  return '<div style="max-width:850px;margin:auto"><span class="eyebrow">Toolkit</span><h1 class="screen-title">What you have experienced</h1><p class="subcopy">No universal score. Concepts unlock because you encountered them in context.</p><div class="choice-grid">'+TOOLKIT.map(function(t){const unlocked=state.completed.indexOf(t[1])>=0||currentMission()===t[1]||t[1]==="wallet"&&state.profile.hasCard;return '<div class="choice" style="opacity:'+(unlocked?1:.38)+'"><h4>'+t[0]+'</h4><p>'+(unlocked?"Experienced in your year":"Not encountered yet")+'</p></div>';}).join("")+'</div></div>';
}

function renderWrap(){
  const start=state.startingProfile.checking+state.startingProfile.savings-state.startingProfile.debt;
  const end=netWorth();
  const bold=state.positions.slice().sort(function(a,b){return b.invested-a.invested;})[0];
  const matchPct=state.profile.has401k&&state.profile.match>0&&state.k401Pct!=null?Math.min(100,state.k401Pct/state.profile.match*100):0;
  const travel=state.travel?travelOutcome(state.travel.method):{fees:0,rewards:0};
  return '<div style="max-width:900px;margin:auto"><div class="wrap-hero"><span class="eyebrow eyebrow-light">'+esc(state.profile.name)+"'s Year 1 Money Wrap"+'</span><h2>'+money(end)+'</h2><p>ending simulated net worth · '+money(end-start)+' change from your starting circumstances</p></div>'+
    '<div class="wrap-grid">'+
      wrapCard("Starting → ending",money(start)+" → "+money(end),"Your year in one number")+
      wrapCard("Employer match captured",Math.round(matchPct)+"%","Based on the contribution level you chose")+
      wrapCard("Boldest position",bold?bold.ticker:"None",bold?money(bold.invested)+" originally invested":"You stayed in cash")+
      wrapCard("Emergency liquidity",money(state.accounts.savings),state.expense?"Your laptop decision changed this cushion":"No emergency allocation used")+
      wrapCard("Travel friction",money(travel.fees-travel.rewards,true),"Net prototype fee/reward effect")+
      wrapCard("Lab experiments",String(state.lab.length),"Alternate realities never changed your Universe")+
    '</div><div class="panel" style="margin-top:14px;text-align:center"><span class="eyebrow">Your year, not a grade</span><h2 class="screen-title">Same circumstances. Different decisions.</h2><p class="subcopy" style="margin:auto">Replay starts with the exact same salary, rent, debt, employer benefits and starting balances. Every decision resets.</p><button class="btn btn-primary btn-lg" style="margin-top:18px" data-action="replay">Replay Year 1</button></div></div>';
}
function wrapCard(label,value,copy){ return '<div class="wrap-card"><small>'+label+'</small><strong>'+value+'</strong><div class="subcopy">'+copy+'</div></div>'; }

function showModal(html){
  const m=document.getElementById("modal");
  m.innerHTML='<div class="modal-card">'+html+'</div>';
  m.classList.remove("hidden");
}
function closeModal(){ document.getElementById("modal").classList.add("hidden"); }
function toast(msg){
  const t=document.getElementById("toast"); t.textContent=msg; t.classList.remove("hidden");
  setTimeout(function(){t.classList.add("hidden");},2200);
}

document.addEventListener("click", function(e){
  const el=e.target.closest("[data-action],[data-app],[data-card],[data-goal],[data-alloc],[data-market-account],[data-security],[data-travel],[data-volatility]");
  if(!el) return;

  if(el.dataset.app){
    state.app=el.dataset.app; saveState(); renderDesk(); return;
  }
  if(el.dataset.card){
    state.cardId=el.dataset.card; saveState(); renderDesk(); return;
  }
  if(el.dataset.goal){
    allocationGoal=el.dataset.goal; renderDesk(); return;
  }
  if(el.dataset.alloc){
    if(!state.allocation) state.allocation={emergency:0,extraDebt:0,roth:0,brokerage:0,checking:0};
    const key=el.dataset.alloc, delta=Number(el.dataset.delta||0);
    const used=Object.keys(state.allocation).reduce(function(a,k){return a+state.allocation[k];},0);
    if(delta>0 && used+delta>state.decisionMoney) return;
    state.allocation[key]=Math.max(0,state.allocation[key]+delta); saveState(); renderDesk(); return;
  }
  if(el.dataset.marketAccount){ marketAccount=el.dataset.marketAccount; orderAmount=0; renderDesk(); return; }
  if(el.dataset.security){ selectedTicker=el.dataset.security; orderAmount=0; renderDesk(); return; }
  if(el.dataset.travel){
    state.travel={method:el.dataset.travel}; saveState(); renderDesk(); return;
  }
  if(el.dataset.volatility){ volatilityAction=el.dataset.volatility; renderDesk(); return; }

  const a=el.dataset.action;
  if(a==="landing"){ showLanding(); return; }
  if(a==="demo"){ startUniverse(DEMO_PROFILE,true); return; }
  if(a==="onboarding"){ showOnboarding(); return; }
  if(a==="onboard-back"){ onboardingStep=Math.max(0,onboardingStep-1); renderOnboarding(); return; }
  if(a==="onboard-next"){ onboardingStep=Math.min(3,onboardingStep+1); renderOnboarding(); return; }
  if(a==="onboard-finish"){
    if(!onboardingDraft.name || !onboardingDraft.city){ toast("Add your name and city first."); onboardingStep=0; renderOnboarding(); return; }
    startUniverse(onboardingDraft,false); return;
  }
  if(a==="finish-wallet"){
    const c=currentCard(); if(!c) return;
    state.accounts.checking=Math.max(0,state.accounts.checking-c.annualFee);
    logDecision("Credit","Opened "+c.name,c.rewards+" · "+c.apr.toFixed(2)+"% APR · "+money(c.annualFee)+" annual fee");
    advance(); return;
  }
  if(a==="finish-paycheck"){
    const pct=state.k401Pct==null?(state.profile.has401k?4:0):state.k401Pct;
    const pc=paycheckCalc(pct);
    state.k401Pct=pct; state.accounts.k401+=pc.employee+pc.employer; state.decisionMoney=pc.remaining;
    logDecision("Income",state.profile.has401k?"401(k) set to "+pct+"%":"Paycheck mapped",money(pc.remaining)+" available for this month's financial decisions");
    advance(); return;
  }
  if(a==="finish-allocation"){
    const al=state.allocation || {emergency:0,extraDebt:0,roth:0,brokerage:0,checking:0};
    const used=al.emergency+al.extraDebt+al.roth+al.brokerage+al.checking;
    al.checking += Math.max(0,state.decisionMoney-used);
    state.allocation=al;
    state.goal=allocationGoal;
    state.accounts.savings+=al.emergency;
    state.accounts.debt=Math.max(0,state.accounts.debt-al.extraDebt);
    state.accounts.rothCash+=al.roth;
    state.accounts.brokerageCash+=al.brokerage;
    state.accounts.checking+=al.checking;
    logDecision("Accounts","Allocation locked",money(al.emergency)+" savings · "+money(al.extraDebt)+" debt · "+money(al.roth)+" Roth · "+money(al.brokerage)+" brokerage · "+money(al.checking)+" checking");
    advance(); return;
  }
  if(a==="review-order"){
    const cash=marketAccount==="roth"?state.accounts.rothCash:state.accounts.brokerageCash;
    const amt=Math.min(cash,Number(orderAmount)||0); if(amt<=0) return;
    showModal('<span class="eyebrow">Review Order</span><h2>'+money(amt)+' of '+selectedTicker+'</h2><p class="subcopy">This order changes your actual Universe inside your '+(marketAccount==="roth"?"Roth IRA":"brokerage account")+'. The Lab is where you test alternate choices without changing it.</p><div class="modal-actions"><button class="btn btn-outline" data-action="close-modal">Go back</button><button class="btn btn-primary" data-action="place-order">Place Order</button></div>');
    return;
  }
  if(a==="close-modal"){ closeModal(); return; }
  if(a==="place-order"){
    const cashKey=marketAccount==="roth"?"rothCash":"brokerageCash";
    const amt=Math.min(state.accounts[cashKey],Number(orderAmount)||0); if(amt<=0) return;
    state.accounts[cashKey]-=amt;
    state.positions.push({account:marketAccount,ticker:selectedTicker,invested:amt});
    logDecision("Market","Bought "+money(amt)+" of "+selectedTicker,"Held inside "+(marketAccount==="roth"?"Roth IRA":"Brokerage"));
    orderAmount=0; closeModal(); saveState(); renderDesk(); toast("Order placed in your Universe."); return;
  }
  if(a==="finish-invest"){ advance(); return; }
  if(a==="finish-expense"){
    const x=state.expense || {savings:1800,card:0,sell:0}; state.expense=x;
    state.accounts.savings=Math.max(0,state.accounts.savings-x.savings);
    if(x.card>0) state.accounts.card+=x.card;
    if(x.sell>0) sellBrokerage(x.sell);
    logDecision("Liquidity","Replaced the laptop","$1,800 funded with "+money(x.savings)+" savings · "+money(x.card)+" card · "+money(x.sell)+" investments");
    advance(); return;
  }
  if(a==="finish-travel"){
    const method=state.travel?state.travel.method:"debit"; const o=travelOutcome(method);
    if(method==="credit") state.accounts.card+=o.cost; else state.accounts.checking-=o.cost;
    state.travel={method:method,fees:o.fees,rewards:o.rewards,cost:o.cost};
    logDecision("Travel","Paid for the trip with "+method,money(o.fees,true)+" fees · "+money(o.rewards,true)+" rewards");
    advance(); return;
  }
  if(a==="finish-volatility"){
    if(volatilityAction==="sell"){
      const amt=brokerageInvestedValue(); const proceeds=sellBrokerage(amt); state.accounts.brokerageCash+=proceeds;
    }else if(volatilityAction==="add" && state.accounts.checking>=200){
      state.accounts.checking-=200; state.positions.push({account:"brokerage",ticker:"VTI",invested:200/(1+security("VTI").move)});
    }
    state.volatility={choice:volatilityAction};
    logDecision("Volatility","Market reaction: "+volatilityAction,"The choice changed your Universe only where applicable.");
    advance(); return;
  }
  if(a==="finish-bonus"){
    const b=state.bonus || {emergency:1000,extraDebt:1000,roth:1000,brokerage:1000,checking:1000,card:0}; state.bonus=b;
    state.accounts.savings+=b.emergency; state.accounts.debt=Math.max(0,state.accounts.debt-b.extraDebt);
    state.accounts.rothCash+=b.roth; state.accounts.brokerageCash+=b.brokerage; state.accounts.checking+=b.checking;
    state.accounts.card=Math.max(0,state.accounts.card-b.card);
    logDecision("Bonus","Allocated $5,000 year-end bonus","You chose the mix.");
    advance(); return;
  }
  if(a==="replay"){ startUniverse(state.startingProfile,state.isDemo); toast("Same circumstances. Fresh decisions."); return; }
});

document.addEventListener("input",function(e){
  if(e.target.dataset.onboard){
    const k=e.target.dataset.onboard, type=e.target.type;
    onboardingDraft[k]=type==="number"?Number(e.target.value):e.target.value;
  }
  if(e.target.dataset.onboardCheck){
    onboardingDraft[e.target.dataset.onboardCheck]=e.target.checked;
    if(e.target.dataset.onboardCheck==="has401k") renderOnboarding();
  }
  if(e.target.id==="k401Slider"){ state.k401Pct=Number(e.target.value); saveState(); renderDesk(); }
  if(e.target.id==="marketSearch"){ marketQuery=e.target.value; renderDesk(); requestAnimationFrame(function(){const x=document.getElementById("marketSearch");if(x){x.focus();x.setSelectionRange(marketQuery.length,marketQuery.length);}}); }
  if(e.target.id==="orderAmount"){ orderAmount=Number(e.target.value)||0; }
  if(e.target.classList.contains("expense-input")){
    if(!state.expense) state.expense={savings:1800,card:0,sell:0};
    state.expense[e.target.dataset.expense]=Math.max(0,Number(e.target.value)||0); saveState(); renderDesk();
  }
  if(e.target.classList.contains("bonus-input")){
    if(!state.bonus) state.bonus={emergency:1000,extraDebt:1000,roth:1000,brokerage:1000,checking:1000,card:0};
    state.bonus[e.target.dataset.bonus]=Math.max(0,Number(e.target.value)||0); saveState(); renderDesk();
  }
});

document.addEventListener("change",function(e){
  if(e.target.id==="labAlt"){
    state.labDraft={alt:e.target.value};
    const first=state.positions[0], s1=security(first.ticker), s2=security(e.target.value);
    const uv=first.invested*(1+(state.marketStage?s1.move:0)), av=first.invested*(1+(state.marketStage?s2.move:0));
    state.lab.unshift({title:first.ticker+" → "+e.target.value,universe:uv,alternate:av});
    saveState(); renderDesk();
  }
});

if(state.profile){
  showDesk();
}else{
  showLanding();
}
