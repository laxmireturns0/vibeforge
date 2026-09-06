const STORAGE_KEY = 'communityConnectReports_v1';

const seedReports = [
  {id:'CC-1001',title:'Broken streetlight near central park',category:'Streetlight',location:'Central Park Gate',description:'The light has not been working for the last few days.',status:'In Progress',date:'2026-09-05',photo:''},
  {id:'CC-1002',title:'Garbage piling up near market',category:'Garbage',location:'Main Market Road',description:'Waste has collected beside the public bin and needs pickup.',status:'Reported',date:'2026-09-04',photo:''},
  {id:'CC-1003',title:'Water leakage on lane 4',category:'Water',location:'Lane 4, Shanti Nagar',description:'A water line appears to be leaking onto the road.',status:'Resolved',date:'2026-09-01',photo:''}
];

function getReports(){return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || seedReports;}
function saveReports(reports){localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));}
function uid(){return 'CC-' + Math.floor(1000 + Math.random()*8999);}
function escapeHTML(str=''){return str.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function formatDate(d){return new Date(d).toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'});}

function updateStats(){
  const r=getReports();
  document.getElementById('statTotal').textContent=r.length;
  document.getElementById('statPending').textContent=r.filter(x=>x.status==='Reported').length;
  document.getElementById('statProgress').textContent=r.filter(x=>x.status==='In Progress').length;
  document.getElementById('statResolved').textContent=r.filter(x=>x.status==='Resolved').length;
}

function renderIssues(){
  const list=document.getElementById('issuesList');
  const search=(document.getElementById('searchInput').value||'').toLowerCase().trim();
  const status=document.getElementById('filterStatus').value;
  const category=document.getElementById('filterCategory').value;
  const reports=getReports().filter(r=>{
    const hay=(r.title+' '+r.location+' '+r.description+' '+r.category).toLowerCase();
    return (!search||hay.includes(search)) && (status==='All'||r.status===status) && (category==='All'||r.category===category);
  });
  list.innerHTML=reports.map(r=>`<article class="issue-card">
    <div class="issue-top"><span class="category">${escapeHTML(r.category)}</span><span class="status ${r.status.toLowerCase().replace(' ','-')}">${escapeHTML(r.status)}</span></div>
    <h3>${escapeHTML(r.title)}</h3><p>${escapeHTML(r.description)}</p>
    <div class="meta"><span>📍 ${escapeHTML(r.location)}</span><span>🗓️ ${formatDate(r.date)}</span><span>🆔 ${escapeHTML(r.id)}</span></div>
    <div class="card-actions"><button class="btn btn-secondary tiny" onclick="viewReport('${r.id}')">View</button><button class="btn btn-primary tiny" onclick="nextStatus('${r.id}')">Update Status</button></div>
  </article>`).join('');
  document.getElementById('emptyState').classList.toggle('hidden',reports.length!==0);
  updateStats();
}

function openReport(){document.getElementById('reportCard').scrollIntoView({behavior:'smooth',block:'center'});document.getElementById('title').focus();}

function viewReport(id){
  const r=getReports().find(x=>x.id===id); if(!r)return;
  document.getElementById('modalContent').innerHTML=`<span class="category">${escapeHTML(r.category)}</span><h2>${escapeHTML(r.title)}</h2><p class="muted">${escapeHTML(r.description)}</p><div class="meta"><span>📍 ${escapeHTML(r.location)}</span><span>🗓️ ${formatDate(r.date)}</span><span>🆔 ${escapeHTML(r.id)}</span></div><p><b>Status:</b> ${escapeHTML(r.status)}</p>${r.photo?`<img src="${r.photo}" alt="Issue photo" style="width:100%;border-radius:14px;margin-top:10px;max-height:280px;object-fit:cover">`:''}`;
  document.getElementById('modal').classList.remove('hidden');
}
function closeModal(){document.getElementById('modal').classList.add('hidden');}
function nextStatus(id){
  const reports=getReports(); const r=reports.find(x=>x.id===id); if(!r)return;
  r.status = r.status==='Reported'?'In Progress':r.status==='In Progress'?'Resolved':'Reported';
  saveReports(reports); renderIssues(); toast(`Status changed to ${r.status}`);
}
function showMapIssue(n){
  const samples=[
    'Streetlight: reported near the park entrance.',
    'Garbage: collection requested near the market.',
    'Water: leakage reported on a residential lane.'
  ];
  toast(samples[n-1]||'Community issue');
}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),2200);}
function resetDemo(){localStorage.removeItem(STORAGE_KEY);renderIssues();toast('Demo data restored.');}

function handleSubmit(e){
  e.preventDefault();
  const file=document.getElementById('photo').files[0];
  const base={id:uid(),title:document.getElementById('title').value.trim(),category:document.getElementById('category').value,location:document.getElementById('location').value.trim(),description:document.getElementById('description').value.trim(),status:'Reported',date:new Date().toISOString(),photo:''};
  const save=(photo='')=>{base.photo=photo;const reports=getReports();reports.unshift(base);saveReports(reports);e.target.reset();renderIssues();toast('Report submitted successfully!');document.getElementById('issues').scrollIntoView({behavior:'smooth'});};
  if(file){const reader=new FileReader();reader.onload=()=>save(reader.result);reader.readAsDataURL(file);}else save();
}

document.getElementById('reportForm').addEventListener('submit',handleSubmit);
renderIssues();
const map = L.map("realMap").setView([20.5937, 78.9629], 5);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

// Example Indian locations
L.marker([28.6139, 77.2090])
  .addTo(map)
  .bindPopup("<b>Delhi</b><br>Community issue");

L.marker([19.0760, 72.8777])
  .addTo(map)
  .bindPopup("<b>Mumbai</b><br>Community issue");

L.marker([12.9716, 77.5946])
  .addTo(map)
  .bindPopup("<b>Bengaluru</b><br>Community issue");