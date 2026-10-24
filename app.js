const KEY = 'timeline-notes:v1';
const $ = (s) => document.querySelector(s);
const els = {
  form: $('#form'), text: $('#text'), list: $('#timeline'), count: $('#count'),
  year: $('#f-year'), month: $('#f-month'), day: $('#f-day'), clear: $('#f-clear'),
};
const desktop = matchMedia('(min-width: 900px)');
const dateFmt = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const monthName = (m) => new Date(2000, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });

let notes = load();
let freshId = null; // nota recém-criada, para a animação de entrada

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch { /* armazenamento indisponível */ }
}
function parts(n) {
  const d = new Date(n.at);
  return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() };
}

/* Filtros em cascata: só mostram períodos que têm anotações */
function setOptions(sel, values, fmt = (v) => v) {
  const keep = sel.value;
  sel.replaceChildren(new Option('Todos', ''));
  values.forEach((v) => sel.add(new Option(fmt(v), v)));
  sel.value = values.map(String).includes(keep) ? keep : '';
}
function refreshFilters() {
  const uniq = (a) => [...new Set(a)].sort((x, y) => x - y);
  const all = notes.map(parts);
  setOptions(els.year, uniq(all.map((p) => p.y)).reverse());
  const inYear = all.filter((p) => !els.year.value || p.y == els.year.value);
  setOptions(els.month, uniq(inYear.map((p) => p.m)), monthName);
  const inMonth = inYear.filter((p) => !els.month.value || p.m == els.month.value);
  setOptions(els.day, uniq(inMonth.map((p) => p.d)));
}
function filtered() {
  const { value: y } = els.year, { value: m } = els.month, { value: d } = els.day;
  return notes.filter((n) => {
    const p = parts(n);
    return (!y || p.y == y) && (!m || p.m == m) && (!d || p.d == d);
  });
}

function render() {
  const list = filtered().sort((a, b) =>
    desktop.matches ? a.at.localeCompare(b.at) : b.at.localeCompare(a.at));
  els.list.replaceChildren();
  els.count.textContent = `${list.length} ${list.length === 1 ? 'anotação' : 'anotações'}`;

  if (!list.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = notes.length
      ? 'Nenhuma anotação nesse período.'
      : 'Nenhuma anotação ainda. Escreva a primeira acima.';
    els.list.append(li);
    return;
  }

  for (const n of list) {
    const when = new Date(n.at);
    const li = document.createElement('li');
    li.className = n.id === freshId ? 'note fresh' : 'note';
    li.innerHTML = '<span class="dot" aria-hidden="true"></span><article class="card"><header><time><strong></strong> <span></span></time></header><p></p><button type="button" class="del">Excluir</button></article>';
    li.querySelector('time').dateTime = n.at;
    li.querySelector('strong').textContent = dateFmt.format(when);
    li.querySelector('time span').textContent = timeFmt.format(when);
    li.querySelector('p').textContent = n.text;
    li.querySelector('.del').dataset.id = n.id;
    els.list.append(li);
  }
  freshId = null;
  if (desktop.matches) els.list.scrollLeft = els.list.scrollWidth;
}

function addNote(e) {
  e.preventDefault();
  const text = els.text.value.trim();
  if (!text) return;
  freshId = crypto.randomUUID?.() ?? String(Date.now());
  notes.push({ id: freshId, at: new Date().toISOString(), text });
  save();
  els.text.value = '';
  [els.year, els.month, els.day].forEach((s) => (s.value = ''));
  refreshFilters();
  render();
}

els.form.addEventListener('submit', addNote);
els.text.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) els.form.requestSubmit();
});
[els.year, els.month, els.day].forEach((s) =>
  s.addEventListener('change', () => { refreshFilters(); render(); }));
els.clear.addEventListener('click', () => {
  [els.year, els.month, els.day].forEach((s) => (s.value = ''));
  refreshFilters();
  render();
});
els.list.addEventListener('click', (e) => {
  const btn = e.target.closest('.del');
  if (!btn || !confirm('Excluir esta anotação?')) return;
  notes = notes.filter((n) => n.id !== btn.dataset.id);
  save();
  refreshFilters();
  render();
});
desktop.addEventListener('change', render);

refreshFilters();
render();
