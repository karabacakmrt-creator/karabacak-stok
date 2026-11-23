/* Karabacak Stok — ekranlar. Stok hesabı ve kurallar veritabanındadır; burada yalnızca gösterim ve çağrılar var. */
const AYAR={url:'https://hftnnrbonjkdwachrzbw.supabase.co',anahtar:'sb_publishable_vplklqs61viozIeqBOSoDg_HxCQQOxt',alan:'stok.karabacakmetal.com',esik:.85};
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>(n==null||isNaN(n))?'0':(Math.round(n*1000)/1000).toLocaleString('tr-TR',{maximumFractionDigits:3});
const yaz=n=>(n==null||n===''||isNaN(n))?'':String(Math.round(n*1000)/1000).replace('.',',');
const num=s=>{if(typeof s==='number')return s;const t=String(s??'').replace(/\s/g,'');if(!t)return NaN;return t.includes(',')?parseFloat(t.replace(/\./g,'').replace(',','.')):parseFloat(t)};
const sade=s=>String(s||'').toLocaleLowerCase('tr').replace(/ı/g,'i').replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u');
const norm=s=>sade(s).replace(/,/g,'.').replace(/[×*]/g,'x').replace(/[^a-z0-9.\/]+/g,' ').replace(/\s+/g,' ').trim();
const kimlik=()=>crypto.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&3|8)).toString(16)});
const bl=u=>u?u.birim_kod.toLocaleLowerCase('tr'):'';
const tarihS=t=>t?new Date(t).toLocaleString('tr-TR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'';
const IC={ana:'M3 11l9-8 9 8M5 10v10h14V10',kutu:'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',kamyon:'M1 6h13v10H1zM14 9h4l3 3v4h-7M5.5 19a2 2 0 100-4 2 2 0 000 4zM17.5 19a2 2 0 100-4 2 2 0 000 4z',
  ekip:'M16 20v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 10a4 4 0 100-8 4 4 0 000 8zM22 20v-2a4 4 0 00-3-3.9M16 2.1a4 4 0 010 7.8',kisi:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  kamera:'M3 8h4l2-3h6l2 3h4v11H3zM12 17a4 4 0 100-8 4 4 0 000 8z',belge:'M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h8',ara:'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
  tik:'M4 12l5 5L20 6',uyari:'M12 3l10 18H2zM12 10v5M12 18v.5',kutubos:'M3 7l9-4 9 4v10l-9 4-9-4zM9 12h6'};
const ic=k=>`<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="${IC[k]}"/></svg>`;
const ROL={yonetici:'Yönetici',satis:'Satış',depo:'Depo'};
const HATA={YETKI_YOK:'Bu işlem için yetkiniz yok.',SAYIM_NEGATIF:'Sayım miktarı eksi olamaz.',SAYIM_REZERVEDEN_AZ:'Sayılan miktar, satılmış ama henüz teslim edilmemiş miktardan az olamaz.',
  KULLANICI_ADI_KULLANIMDA:'Bu kullanıcı adı kullanılıyor.',BILGI_EKSIK:'Bilgiler eksik ya da şifre çok kısa.',KURULUM_YAPILMIS:'İlk kurulum zaten yapılmış. Giriş yapın.',GIRIS_GEREKLI:'Oturum süresi dolmuş. Yeniden giriş yapın.',
  MIKTAR_GECERSIZ:'Miktar geçersiz. Kalan miktardan fazla olamaz.',FIZIKSEL_STOK_YETERSIZ:'Depoda bu kadar mal görünmüyor. Önce sayımı kontrol edin.',REZERVASYON_KAPALI:'Bu satış zaten teslim edilmiş ya da iptal edilmiş.',
  BEKLENENDEN_FAZLA:'İrsaliyede yazandan fazla mal girilemez. Fazla geldiyse yönetici girebilir.',MUKERRER_BELGE:'Bu belge daha önce kaydedilmiş.',SATIR_ZATEN_ISLENDI:'Bu satır zaten işlenmiş.',BELGE_ISLENEMEZ:'Bu belge şu an işlenemiyor.',
  SATIR_KABUL_BEKLEMIYOR:'Bu satırın malı zaten teslim alınmış.',IPTAL_STOKU_EKSIYE_DUSURUR:'İptal edilirse stok eksiye düşer; bu mal satılmış görünüyor.',OKUMA_YOGUN:'Okuma servisi şu an yoğun. Bir dakika sonra yeniden deneyin.',
  OKUMA_ANAHTARI_GECERSIZ:'Okuma servisi anahtarı geçersiz. Yöneticiye bildirin.',URUN_GECERSIZ:'Seçilen ürün kullanılamıyor.'};
const hataMetni=e=>{const m=String((e&&(e.message||e.hata))||e||'');const k=Object.keys(HATA).find(x=>m.includes(x));return k?HATA[k]:(m?'İşlem yapılamadı: '+m:'İşlem yapılamadı. Bağlantıyı kontrol edip yeniden deneyin.')};

const sb=window.supabase.createClient(AYAR.url,AYAR.anahtar);
const S={ekran:'yukleniyor',tab:'ana',ben:null,oturum:null,urunler:[],U:new Map(),yuklendi:false,q:'',kat:'',more:100,sayim:null,
  personel:[],kisiler:{},belgeler:[],dikkat:[],rez:[],cevrim:{},anaYuklendi:false,taslak:null,sheet:null,sec:null,mesgul:false,not:'',sq:'',sevkOnay:null,yoneticiOnay:false};
const yon=()=>S.ben&&S.ben.rol==='yonetici';

/* ---------- sunucu ---------- */
async function fn(ad,govde){
  const jeton=(S.oturum&&S.oturum.access_token)||AYAR.anahtar;
  const r=await fetch(AYAR.url+'/functions/v1/'+ad,{method:'POST',headers:{'Content-Type':'application/json',apikey:AYAR.anahtar,Authorization:'Bearer '+jeton},body:JSON.stringify(govde)});
  const j=await r.json().catch(()=>({hata:'SUNUCU_YANITI_OKUNAMADI'}));
  if(!r.ok||j.hata)throw new Error((j.hata||('HTTP '+r.status))+(j.ayrinti?' ('+j.ayrinti+')':''));
  return j;
}
const hesap=g=>fn('hesap',g);
async function rpc(ad,args){const{data,error}=await sb.rpc(ad,args);if(error)throw error;return data}
async function profilYukle(){
  const{data:{session}}=await sb.auth.getSession();S.oturum=session;
  if(!session){S.ben=null;return false}
  const{data,error}=await sb.from('kullanici').select('id,ad,rol,aktif,kullanici_adi').eq('id',session.user.id).maybeSingle();
  if(error||!data||!data.aktif){await sb.auth.signOut();S.ben=null;S.oturum=null;S.not='Hesabınız etkin değil. Yöneticiye başvurun.';return false}
  S.ben=data;return true;
}
async function stokYukle(){
  const hepsi=[];
  for(let i=0;i<5;i++){
    const{data,error}=await sb.from('stok_gorunum').select('*').order('urun_id').range(i*1000,i*1000+999);
    if(error){if(!S.yuklendi)S.not='Stok listesi alınamadı. Bağlantıyı kontrol edin.';yumusak();return}
    hepsi.push(...data);if(data.length<1000)break;
  }
  hepsi.forEach(u=>{u.n=norm(u.ad);u.fiziksel=+u.fiziksel;u.rezerve=+u.rezerve;u.kullanilabilir=+u.kullanilabilir});
  S.urunler=hepsi;S.U=new Map(hepsi.map(u=>[u.urun_id,u]));S.yuklendi=true;S.not='';yumusak();
}
async function anaYukle(){
  const[b,d,r,c,k]=await Promise.all([
    sb.from('belge').select('id,tur,belge_no,tarih,cari_ad,durum,toplam,olusturma,yukleyen').order('olusturma',{ascending:false}).limit(40),
    sb.from('belge_satir').select('id,belge_id,urun_id,miktar,durum').in('durum',['bekliyor','stok_yetersiz','kabul_bekliyor']).limit(500),
    sb.from('rezervasyon').select('*').in('durum',['aktif','kismi']).order('olusturma').limit(1000),
    sb.from('urun_cevrim').select('urun_id,kaynak_birim,oran').eq('dogrulandi',true).limit(2000),
    sb.from('kullanici').select('id,ad').limit(200)]);
  if(b.error){S.anaNot='Kayıtlar alınamadı. Bağlantıyı kontrol edin.';yumusak();return}
  S.belgeler=b.data||[];S.dikkat=d.data||[];S.rez=(r.data||[]).map(x=>Object.assign(x,{miktar:+x.miktar,kalan:+x.kalan,sevk_edilen:+x.sevk_edilen}));
  S.cevrim={};(c.data||[]).forEach(x=>S.cevrim[x.urun_id+'|'+x.kaynak_birim]=+x.oran);
  S.kisiler={};(k.data||[]).forEach(x=>S.kisiler[x.id]=x.ad);
  S.anaYuklendi=true;S.anaNot='';yumusak();
}
async function personelYukle(){const{data}=await sb.from('kullanici').select('id,ad,rol,aktif,kullanici_adi').order('ad');S.personel=data||[];yumusak()}
const tazele=()=>Promise.all([stokYukle(),anaYukle()]);

async function basla(){
  try{
    if(await profilYukle()){S.ekran='ana';ciz();tazele();return}
    const d=await hesap({islem:'durum'}).catch(()=>({kurulum_gerekli:false}));
    S.ekran=d.kurulum_gerekli?'kurulum':'giris';
  }catch(e){S.ekran='giris';S.not='Sunucuya ulaşılamadı. Bağlantıyı kontrol edin.'}
  ciz();
}

/* ---------- birim çevrimi ve taslak ---------- */
function cevir(urunId,q,birim){
  const u=S.U.get(urunId);if(!u||q==null||isNaN(q))return{m:null};
  const b=birim?String(birim).toLocaleUpperCase('tr'):null;
  if(!b||b===u.birim_kod)return{m:q};
  const oran=S.cevrim[urunId+'|'+b];
  if(!oran)return{m:null,not:'Belgede '+fmt(q)+' '+b.toLocaleLowerCase('tr')+' yazıyor. Bu ürün için onaylı çevrim oranı yok; kaç '+bl(u)+' ettiğini siz yazın.'};
  const m=Math.round(q/oran*1000)/1000;
  return{m,not:fmt(q)+' '+b.toLocaleLowerCase('tr')+' ÷ '+fmt(oran)+' = '+fmt(m)+' '+bl(u)};
}
function urunAta(l,urunId){l.urun_id=urunId;l.dis=false;if(l.hq!=null&&!isNaN(l.hq)){const c=cevir(urunId,l.hq,l.hu);l.m=yaz(c.m);l.not=c.not||''}}
function satirDurum(l){if(l.dis)return'dis';if(!l.urun_id||!(num(l.m)>0))return'eksik';return(l.guven>=AYAR.esik||l.onay)?'hazir':'kontrol'}
const bosSatir=()=>({ham:'',hq:null,hu:null,tutar:null,teslim:false,urun_id:null,adaylar:[],guven:1,onay:true,dis:false,m:'',not:''});
async function kucult(file){
  let src,w,h;
  try{const bmp=await createImageBitmap(file);src=bmp;w=bmp.width;h=bmp.height}
  catch(e){const url=URL.createObjectURL(file);const im=new Image();im.src=url;try{await im.decode()}catch(e2){throw new Error('FOTOGRAF_ACILAMADI')}src=im;w=im.naturalWidth;h=im.naturalHeight}
  const k=Math.min(1,1700/Math.max(w,h)),c=document.createElement('canvas');c.width=Math.round(w*k);c.height=Math.round(h*k);
  const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(src,0,0,c.width,c.height);
  return new Promise(r=>c.toBlob(r,'image/jpeg',.8));
}
const b64=blob=>new Promise((ok,no)=>{const f=new FileReader();f.onload=()=>ok(String(f.result).split(',')[1]);f.onerror=no;f.readAsDataURL(blob)});
async function parmakIzi(file){try{const h=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());return[...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('')}catch(e){return null}}
async function fisBaslat(tur,file){
  const t={tur,durum:'okunuyor',mesaj:'',satirlar:[],cari:'',belgeNo:'',tarih:null,toplam:null,img:null,yol:null,iz:null,islem:kimlik(),kaydediyor:false};
  S.taslak=t;S.tab='ana';ciz();
  try{
    const[blob,iz]=await Promise.all([kucult(file),parmakIzi(file)]);t.iz=iz;t.img=URL.createObjectURL(blob);if(S.taslak===t)ciz();
    const yol=S.ben.id+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.jpg';
    const yukle=sb.storage.from('belgeler').upload(yol,blob,{contentType:'image/jpeg'}).then(r=>{if(!r.error)t.yol=yol});
    let o=null;
    try{o=await fn('belge-oku',{tur,gorsel:await b64(blob),tip:'image/jpeg'})}
    catch(e){const m=String(e.message||'');
      t.mesaj=m.includes('OKUMA_KAPALI')?'Otomatik okuma henüz açılmadı. Satırları elle ekleyin; fotoğraf kayda eklenir.':hataMetni(e)+' Satırları elle ekleyebilirsiniz.'}
    await yukle.catch(()=>{});
    if(S.taslak!==t)return;
    if(o){t.cari=o.cari||'';t.belgeNo=o.belge_no||'';t.tarih=o.tarih;t.toplam=o.toplam;
      t.satirlar=(o.satirlar||[]).map(s=>{const l={ham:s.ham,hq:s.miktar,hu:s.birim,tutar:s.tutar,teslim:tur==='satis'&&!!s.isaretli,urun_id:null,adaylar:s.adaylar||[],guven:s.guven||0,onay:false,dis:false,m:yaz(s.miktar),not:''};
        if(s.urun_id&&S.U.has(s.urun_id))urunAta(l,s.urun_id);return l});
      if(o.kesildi)t.mesaj='Belge uzun olduğu için okuma yarıda kesilmiş olabilir. Son satırları fotoğrafla karşılaştırın.';
      else if(!t.satirlar.length)t.mesaj='Belgede satır bulunamadı. Daha net bir fotoğraf deneyin ya da satırları elle ekleyin.'}
    if(!t.satirlar.length)t.satirlar.push(bosSatir());
  }catch(e){if(S.taslak!==t)return;t.mesaj=String(e.message).includes('FOTOGRAF_ACILAMADI')?'Bu fotoğraf açılamadı. Fotoğraf çek seçeneğiyle yeniden deneyin.':hataMetni(e);if(!t.satirlar.length)t.satirlar.push(bosSatir())}
  t.durum='onay';if(S.taslak===t)ciz();
}
async function taslakKaydet(){
  const t=S.taslak;if(!t||t.kaydediyor)return;
  const dolu=t.satirlar.filter(l=>l.dis||l.urun_id||l.ham);if(!dolu.length){toast('En az bir satır ekleyin.',1);return}
  t.kaydediyor=true;ciz();
  try{
    const satirlar=dolu.map(l=>{const d=satirDurum(l);return{ham:l.ham||(l.urun_id&&S.U.get(l.urun_id)?S.U.get(l.urun_id).ad:''),okunan_miktar:(l.hq==null||isNaN(l.hq))?null:l.hq,okunan_birim:l.hu||null,
      urun_id:(d==='hazir'||d==='kontrol')?l.urun_id:null,miktar:(d==='hazir'||d==='kontrol')?num(l.m):null,guven:d==='hazir'?(l.onay?1:l.guven):(d==='kontrol'?l.guven:0),teslim:!!l.teslim,tutar:l.tutar??null}});
    const r=await rpc('belge_olustur',{p_tur:t.tur,p_belge_no:t.belgeNo||null,p_tarih:t.tarih||null,p_cari:t.cari||null,p_parmak_izi:t.iz,p_dosya:t.yol,p_toplam:t.toplam,p_satirlar:satirlar,p_islem:t.islem});
    if(r.mukerrer){S.taslak=null;toast('Bu belge daha önce kaydedilmiş. Yeni kayıt açılmadı.',1);await anaYukle();belgeAc(r.belge_id);return}
    if(!r.olasi_mukerrer)for(let i=0;i<dolu.length;i++)if(dolu[i].dis){const s=(r.satirlar||[]).find(x=>x.sira===i+1);if(s)await rpc('satir_tamamla',{p_satir:s.id,p_urun:null,p_miktar:null,p_teslim:null,p_stok_disi:true,p_islem:kimlik()}).catch(()=>{})}
    for(const l of dolu)if(l.onay&&l.urun_id&&l.ham&&norm(l.ham).length>1)sb.from('urun_takma_ad').insert({urun_id:l.urun_id,metin_norm:norm(l.ham)}).then(()=>{},()=>{});
    const say=d=>(r.satirlar||[]).filter(x=>x.durum===d).length;
    S.taslak=null;await tazele();
    if(r.olasi_mukerrer){toast('Bu fiş daha önce girilmiş olabilir. Kontrol edin.',1);belgeAc(r.belge_id)}
    else if(t.tur==='alis'){toast('İrsaliye kaydedildi. Mal gelince teslim aldığınızı onaylayın.');belgeAc(r.belge_id)}
    else{const y=say('stok_yetersiz'),b=say('bekliyor');toast((say('rezerve')+say('teslim'))+' satır kaydedildi'+(y?', '+y+' satırda stok yetersiz':'')+(b?', '+b+' satır tamamlanacak':'')+'.',y||b?1:0);if(y||b)belgeAc(r.belge_id)}
  }catch(e){t.kaydediyor=false;toast(hataMetni(e),1);ciz()}
}

/* ---------- görünümler ---------- */
function vKurulum(){return`<div class="center card form"><h2>İlk kurulum</h2><p class="small muted" style="margin:0">Yönetici hesabını bir kez oluşturun. Personel hesaplarını sonra Yönetim bölümünden açarsınız.</p>
  ${S.not?`<div class="note bad">${esc(S.not)}</div>`:''}
  <label class="field">Adınız<input id="k-ad" autocomplete="name"></label>
  <label class="field">E-posta<input id="k-eposta" type="email" autocomplete="email" value="murat@karabacakmetal.com"></label>
  <label class="field">Şifre (en az 8 karakter)<input id="k-sifre" type="password" autocomplete="new-password"></label>
  <label class="field">Şifre (tekrar)<input id="k-sifre2" type="password" autocomplete="new-password"></label>
  <button type="button" class="btn pri block" data-act="kurulum" ${S.mesgul?'disabled':''}>${S.mesgul?'Oluşturuluyor…':'Yönetici hesabını oluştur'}</button></div>`}
function vGiris(){return`<div class="center card form"><h2>Giriş</h2>
  ${S.not?`<div class="note bad">${esc(S.not)}</div>`:''}
  <label class="field">Kullanıcı adı ya da e-posta<input id="g-kim" autocomplete="username" autocapitalize="none" spellcheck="false"></label>
  <label class="field">Şifre<input id="g-sifre" type="password" autocomplete="current-password"></label>
  <button type="button" class="btn pri block" data-act="giris" ${S.mesgul?'disabled':''}>${S.mesgul?'Giriş yapılıyor…':'Giriş yap'}</button></div>`}
const DURUM={okunuyor:['İşleniyor',''],olasi_mukerrer:['Aynı fiş olabilir','warn'],eksik_satir:['Eksik satır var','warn'],tamamlandi:['Tamamlandı','ok'],iptal:['İptal','bad']};
function belgeSatiri(b){
  const d=DURUM[b.durum]||[b.durum,''],n=S.dikkat.filter(x=>x.belge_id===b.id);
  const kb=n.filter(x=>x.durum==='kabul_bekliyor').length,ys=n.filter(x=>x.durum==='stok_yetersiz').length;
  return`<button type="button" class="item" data-act="belge" data-id="${b.id}"><div class="grow"><div class="nm">${b.tur==='satis'?'Satış':'İrsaliye'} · ${esc(b.cari_ad||(b.tur==='satis'?'Müşteri yazılmamış':'Tedarikçi yazılmamış'))}</div>
    <div class="small muted">${tarihS(b.olusturma)}${yon()&&S.kisiler[b.yukleyen]?' · '+esc(S.kisiler[b.yukleyen]):''}${b.toplam!=null?' · '+fmt(b.toplam)+' TL':''}</div></div>
    <div style="text-align:right"><span class="chip ${d[1]}">${d[0]}</span>${kb?`<div><span class="chip acc">${kb} satır mal bekliyor</span></div>`:''}${ys?`<div><span class="chip bad">${ys} satır stok yetersiz</span></div>`:''}</div></button>`}
function vAna(){
  const bekleyen=S.belgeler.filter(b=>b.durum==='eksik_satir'||b.durum==='olasi_mukerrer'||S.dikkat.some(x=>x.belge_id===b.id&&x.durum==='kabul_bekliyor'));
  const son=S.belgeler.filter(b=>!bekleyen.includes(b)).slice(0,12);
  if(S.ben.rol==='depo')return`<div class="card"><div class="empty">${ic('kamyon')}<div>Teslim edilecek malları Teslimat sekmesinde görürsünüz.</div><button type="button" class="link" data-act="tab" data-tab="sevk">Teslimata git</button></div></div>`;
  return`${S.anaNot?`<div class="note warn">${esc(S.anaNot)}</div>`:''}
  <div class="acts">
    <label class="act pri" for="f-satis-k" tabindex="0" data-for="f-satis-k">${ic('kamera')}<b>Satış fişi çek</b><span>Fotoğrafı çekin, satırlar okunur.</span></label>
    <label class="act" for="f-alis-k" tabindex="0" data-for="f-alis-k">${ic('belge')}<b>İrsaliye çek</b><span>Gelen malın irsaliyesi.</span></label>
  </div>
  <div class="row small"><span class="muted">Fotoğraf çekmeden:</span>
    <label class="link" for="f-satis-d" tabindex="0" data-for="f-satis-d">Galeriden satış fişi</label><label class="link" for="f-alis-d" tabindex="0" data-for="f-alis-d">Galeriden irsaliye</label>
    <button type="button" class="link" data-act="elle" data-tur="satis">Elle satış gir</button></div>
  ${bekleyen.length?`<div class="card"><h3>Sizi bekleyenler</h3><div class="list" style="margin-top:4px">${bekleyen.map(belgeSatiri).join('')}</div></div>`:''}
  <div class="card"><h3>${yon()?'Son işlemler':'Son işlemlerim'}</h3><div class="list" style="margin-top:4px">${!S.anaYuklendi?iskelet(3):son.map(belgeSatiri).join('')||`<div class="empty">${ic('belge')}<div>Henüz işlem yok. İlk fişi yukarıdan çekin.</div></div>`}</div></div>`;
}
const iskelet=n=>Array.from({length:n},(_,i)=>`<div class="skel"><div class="grow"><i style="width:${55+i*7%30}%"></i><i style="width:35%;margin-top:8px"></i></div><i style="width:46px"></i></div>`).join('');
function taslakSatir(l,i,tur){
  const d=satirDurum(l),u=l.urun_id&&S.U.get(l.urun_id);
  const chip=d==='dis'?'<span class="chip">Stok dışı</span>':d==='eksik'?`<span class="chip acc">${l.urun_id?'Miktar yazın':'Ürün seçin'}</span>`:d==='kontrol'?'<span class="chip warn">Kontrol edin</span>':'<span class="chip ok">Hazır</span>';
  const kaynak=[l.ham,(l.hq==null||isNaN(l.hq))?'':fmt(l.hq)+(l.hu?' '+String(l.hu).toLocaleLowerCase('tr'):''),l.tutar!=null?fmt(l.tutar)+' TL':''].filter(Boolean).join(' · ');
  const m=num(l.m),kusur=u&&u.birim_kod!=='METRE'&&u.birim_kod!=='KG'&&m>0&&Math.abs(m-Math.round(m))>1e-6;
  return`<div class="ln ${d}"><div class="row"><div class="grow small muted" style="overflow-wrap:anywhere">${esc(kaynak)||'Elle eklenen satır'}</div>${chip}<button type="button" class="x" data-act="tsil" data-i="${i}" aria-label="Satırı sil">×</button></div>
    <button type="button" class="prod ${l.urun_id||l.dis?'':'bos'}" data-act="tsec" data-i="${i}"><span>${l.dis?'Stok dışı (nakliye, işçilik vb.)':u?esc(u.ad)+' <span class="muted small">'+esc(u.kategori)+'</span>':'Ürün seçmek için dokunun'}</span><span class="small">Değiştir</span></button>
    ${l.dis?'':`<div class="row"><label class="small muted grow" for="tm${i}">${tur==='satis'?'Satılan miktar':'Gelen miktar'}</label><input class="inp num" id="tm${i}" inputmode="decimal" data-in="tm" data-i="${i}" value="${esc(l.m)}"><span class="small" style="min-width:42px">${u?bl(u):''}</span></div>
    ${u&&tur==='satis'?`<div class="small muted">Satılabilir stok: ${fmt(u.kullanilabilir)} ${bl(u)}${m>u.kullanilabilir?' <span style="color:var(--bad);font-weight:600">· yetmiyor, yöneticiye düşer</span>':''}</div>`:''}
    ${l.not?`<div class="small muted">${esc(l.not)}</div>`:''}${kusur?'<div class="small" style="color:var(--warn)">Küsuratlı miktar. Doğruysa devam edin.</div>':''}
    <div class="row">${tur==='satis'?`<label class="tog grow"><input type="checkbox" data-in="tteslim" data-i="${i}" ${l.teslim?'checked':''}> Tezgâhtan verildi</label>`:'<span class="grow"></span>'}${d==='kontrol'?`<button type="button" class="btn sm ok" data-act="tonay" data-i="${i}">${ic('tik')} Doğru</button>`:''}</div>`}</div>`;
}
function taslakBar(t){const e=t.satirlar.filter(l=>satirDurum(l)==='eksik').length,k=t.satirlar.filter(l=>satirDurum(l)==='kontrol').length;
  return`<div class="grow small muted">${e||k?[e?e+' satır eksik':'',k?k+' satır kontrol bekliyor':''].filter(Boolean).join(', ')+'. Bunlar kayda girer ama tamamlanana kadar stoku etkilemez.':'Bütün satırlar hazır.'}</div>
    <button type="button" class="btn pri" data-act="tkaydet" ${t.kaydediyor?'disabled':''}>${t.kaydediyor?'Kaydediliyor…':'Kaydet'}</button>`}
function vTaslak(){
  const t=S.taslak,sat=t.tur==='satis';
  const bas=`<div class="row"><h2 class="grow">${sat?'Satış fişi':'İrsaliye'}</h2><button type="button" class="btn sm" data-act="tvazgec">Vazgeç</button></div>`;
  const foto=t.img?`<details class="photo card" ${t.durum==='okunuyor'?'open':''}><summary>Fotoğraf</summary><img src="${t.img}" alt="Çekilen belge"></details>`:'';
  if(t.durum==='okunuyor')return bas+`<div class="card row"><div class="spin"></div><div class="grow">Belge okunuyor, birkaç saniye sürer…</div></div>`+foto;
  return bas+(t.mesaj?`<div class="note warn">${esc(t.mesaj)}</div>`:'')+foto+
  `<div class="card" style="display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">
    <label class="field">${sat?'Müşteri':'Tedarikçi'}<input data-in="tcari" value="${esc(t.cari)}"></label>
    ${sat?'':`<label class="field">İrsaliye no<input data-in="tno" value="${esc(t.belgeNo)}"></label>`}</div>
  ${t.satirlar.map((l,i)=>taslakSatir(l,i,t.tur)).join('')}
  <button type="button" class="btn block" data-act="tekle">Satır ekle</button>
  <div class="bar" id="tbar">${taslakBar(t)}</div>`;
}
function ara(){
  const ts=norm(S.q).split(' ').filter(Boolean),g=S.sayim&&S.kat==='__girilen';
  let ps=S.urunler.filter(u=>u.aktif&&(g?(S.sayim[u.urun_id]||'')!=='':S.kat==='__kritik'?u.kritik:S.kat==='__eksi'?u.kullanilabilir<0:(!S.kat||u.kategori===S.kat))&&ts.every(t=>u.n.includes(t)));
  if(ts.length)ps.sort((a,b)=>(b.n.startsWith(ts[0])-a.n.startsWith(ts[0]))||a.n.length-b.n.length);
  return ps;
}
function farkHtml(u,v){const c=num(v);if(isNaN(c))return'';const f=Math.round((c-u.fiziksel)*1000)/1000;return f===0?'<span class="diff zero">Fark yok</span>':`<span class="diff ${f<0?'neg':'pos'}">${f>0?'+':''}${fmt(f)}</span>`}
function satirlar(){
  if(!S.yuklendi)return iskelet(6);
  const ps=ara(),tot=ps.length;
  return ps.slice(0,S.more).map(u=>{
    if(S.sayim)return`<div class="item"><div class="grow"><div class="nm">${esc(u.ad)}</div><div class="small muted">${esc(u.kategori)} · kayıtlı ${fmt(u.fiziksel)} ${bl(u)}${u.rezerve?' · satıldı, bekliyor '+fmt(u.rezerve):''}</div></div>
      <div><input class="inp num" inputmode="decimal" aria-label="${esc(u.ad)} sayım miktarı" data-in="say" data-id="${u.urun_id}" value="${esc(S.sayim[u.urun_id]||'')}" placeholder="${bl(u)}"><div class="diff" id="fark${u.urun_id}">${farkHtml(u,S.sayim[u.urun_id])}</div></div></div>`;
    return`<button type="button" class="item" data-act="urun" data-id="${u.urun_id}"><div class="grow"><div class="nm">${esc(u.ad)}</div>
      <div class="small muted">${esc(u.kategori)} · depoda ${fmt(u.fiziksel)}${u.rezerve?` <span class="chip acc">satıldı, bekliyor ${fmt(u.rezerve)}</span>`:''}${u.kritik?' <span class="chip warn">kritik</span>':''}</div></div>
      <div class="qty ${u.kullanilabilir<0?'neg':''}">${fmt(u.kullanilabilir)}<small>${bl(u)}</small></div></button>`}).join('')
    +(tot>S.more?`<button type="button" class="btn block" style="margin-top:10px" data-act="more">${tot-S.more} ürün daha göster</button>`:'')
    +(tot?'':`<div class="empty">${ic('kutubos')}<div>Aramaya uyan ürün yok.</div><button type="button" class="link" data-act="temizle">Filtreleri temizle</button></div>`);
}
function sayBar(){const n=Object.values(S.sayim||{}).filter(v=>!isNaN(num(v))).length;return`<div class="grow small muted">${n?n+' ürün için miktar girildi.':'Raftaki gerçek miktarları yazın.'}</div><button type="button" class="btn pri" data-act="sayincele" ${n?'':'disabled'}>İncele ve kaydet</button>`}
function vStok(){
  const akt=S.urunler.filter(u=>u.aktif),say={};akt.forEach(u=>say[u.kategori]=(say[u.kategori]||0)+1);
  const kr=akt.filter(u=>u.kritik).length,ek=akt.filter(u=>u.kullanilabilir<0).length,gir=S.sayim?Object.values(S.sayim).filter(v=>!isNaN(num(v))).length:0;
  const chips=[...(S.sayim?[['__girilen','Girilenler ('+gir+')']]:[]),['','Tümü ('+akt.length+')'],...Object.keys(say).map(k=>[k,k+' ('+say[k]+')']),['__kritik','Kritik stok ('+kr+')'],['__eksi','Eksiye düşen ('+ek+')']];
  return`${S.sayim?`<div class="banner">${ic('uyari')}<span class="grow">Sayım modu açık</span><button type="button" class="btn sm" data-act="saymod">Vazgeç</button></div>`
    :`<div class="row"><h2 class="grow">Stok</h2>${yon()?'<button type="button" class="btn sm" data-act="saymod">Sayım yap</button>':''}</div>`}
  ${S.not?`<div class="note warn">${esc(S.not)}</div>`:''}
  ${yon()&&!S.sayim&&S.yuklendi?`<div class="kpi"><button type="button" data-act="kat" data-kat=""><b>${akt.length}</b><span>Ürün çeşidi</span></button><button type="button" data-act="kat" data-kat="__kritik"><b style="color:${kr?'var(--warn)':'inherit'}">${kr}</b><span>Kritik stok</span></button><button type="button" data-act="kat" data-kat="__eksi"><b style="color:${ek?'var(--bad)':'inherit'}">${ek}</b><span>Eksiye düşen</span></button></div>`:''}
  <div class="search">${ic('ara')}<input class="inp" id="q" type="search" placeholder="Ürün ara: 20x40, menteşe, lama…" aria-label="Ürün ara" data-in="q" value="${esc(S.q)}"><button type="button" data-act="qsil" aria-label="Aramayı temizle" id="qsil" class="${S.q?'':'hidden'}">×</button></div>
  <div class="chips">${chips.map(([k,l])=>`<button type="button" data-act="kat" data-kat="${esc(k)}" aria-pressed="${S.kat===k}">${esc(l)}</button>`).join('')}</div>
  ${S.sayim?'':'<div class="small muted">Sağdaki büyük rakam satılabilir miktardır: depodaki maldan, satılmış ama henüz teslim edilmemiş olan düşülür.</div>'}
  <div class="card"><div class="list" id="rows">${satirlar()}</div></div>
  ${S.sayim?`<div class="bar" id="saybar">${sayBar()}</div>`:''}`;
}
function sevkListe(){
  const ts=norm(S.sq).split(' ').filter(Boolean);
  const rs=S.rez.filter(r=>{const u=S.U.get(r.urun_id);const n=norm((r.musteri||'')+' '+(u?u.ad:''));return ts.every(t=>n.includes(t))});
  if(!S.anaYuklendi)return`<div class="card"><div class="list">${iskelet(4)}</div></div>`;
  if(!rs.length)return`<div class="card"><div class="empty">${ic('kamyon')}<div>${S.rez.length?'Aramaya uyan bekleyen teslimat yok.':'Bekleyen teslimat yok. Satılan her şey teslim edilmiş.'}</div></div></div>`;
  const g=new Map();for(const r of rs){const k=r.musteri||'Müşteri yazılmamış';if(!g.has(k))g.set(k,[]);g.get(k).push(r)}
  return[...g].map(([m,l])=>`<div class="card"><div class="row"><div class="nm grow" style="font-size:17px">${esc(m)}</div><span class="chip">${l.length} kalem</span></div><div class="list" style="margin-top:4px">${l.map(r=>{const u=S.U.get(r.urun_id);
    return`<div class="item"><div class="grow"><div class="nm">${esc(u?u.ad:'Ürün #'+r.urun_id)}</div><div class="small muted">Kalan ${fmt(r.kalan)} ${bl(u)}${r.sevk_edilen?' · '+fmt(r.sevk_edilen)+' verildi':''} · ${esc(S.kisiler[r.personel]||'')} · ${new Date(r.satis_tarihi).toLocaleDateString('tr-TR')}</div></div>
      <div class="row" style="flex-wrap:nowrap">${S.sevkOnay===r.id?`<button type="button" class="btn sm ok" data-act="sevktam2" data-id="${r.id}">${fmt(r.kalan)} ${bl(u)} verildi, onayla</button>`:`<button type="button" class="btn sm" data-act="rezac" data-id="${r.id}">Bir kısmı</button><button type="button" class="btn sm dark" data-act="sevktam" data-id="${r.id}">Teslim et</button>`}</div></div>`}).join('')}</div></div>`).join('');
}
function vSevk(){return`<h2>Teslimat</h2><div class="small muted">Satılmış ama henüz müşteriye verilmemiş mallar. Malı verince işaretleyin; stok o an düşer.</div>
  <div class="search">${ic('ara')}<input class="inp" type="search" placeholder="Müşteri ya da ürün ara" aria-label="Teslimat ara" data-in="sq" value="${esc(S.sq)}"></div><div id="sevkl" style="display:flex;flex-direction:column;gap:14px">${sevkListe()}</div>`}
function vYonetim(){
  return`<h2>Personel</h2>
  <div class="card"><div class="list">${S.personel.map(p=>`<div class="item"><div class="av">${esc((p.ad||'?').trim().charAt(0).toLocaleUpperCase('tr'))}</div><div class="grow"><div class="nm">${esc(p.ad)} <span class="chip">${ROL[p.rol]||p.rol}</span> ${p.aktif?'':'<span class="chip bad">pasif</span>'}</div><div class="small muted">${p.kullanici_adi?'Kullanıcı adı: '+esc(p.kullanici_adi):'E-posta ile giriş'}</div></div>
    ${p.id===S.ben.id?'':`<button type="button" class="btn sm" data-act="pduz" data-id="${p.id}">Düzenle</button>`}</div>`).join('')||iskelet(3)}</div></div>
  <div class="card form"><h3>Yeni personel</h3>
    <label class="field">Ad<input id="p-ad" autocomplete="off"></label>
    <label class="field">Kullanıcı adı (küçük harf, boşluksuz)<input id="p-kadi" autocapitalize="none" autocomplete="off" spellcheck="false"></label>
    <label class="field">Geçici şifre (en az 6 karakter)<input id="p-sifre" autocomplete="off"></label>
    <label class="field">Rol<select id="p-rol" data-in="prol"><option value="satis">Satış: fiş yükler, teslim eder, stok görür</option><option value="depo">Depo: teslim eder, stok görür</option><option value="yonetici">Yönetici: her şeyi görür ve değiştirir</option></select></label>
    ${S.yoneticiOnay?'<div class="note warn">Yönetici rolündeki kişi fiyatları, bütün işlemleri ve personel hesaplarını görür ve değiştirir. Eminseniz butona yeniden basın.</div>':''}
    <button type="button" class="btn pri block" data-act="pekle" ${S.mesgul?'disabled':''}>${S.mesgul?'Açılıyor…':'Personel hesabı aç'}</button></div>`;
}
function vHesabim(){return`<h2>Hesabım</h2><div class="card row"><div class="av">${esc(S.ben.ad.trim().charAt(0).toLocaleUpperCase('tr'))}</div><div class="grow"><div class="nm">${esc(S.ben.ad)}</div><div class="small muted">${ROL[S.ben.rol]}${S.ben.kullanici_adi?' · kullanıcı adı: '+esc(S.ben.kullanici_adi):''}</div></div></div>
  <div class="card form"><h3>Şifre değiştir</h3><label class="field">Yeni şifre (en az 6 karakter)<input id="h-sifre" type="password" autocomplete="new-password"></label><button type="button" class="btn block" data-act="sifrem">Şifreyi değiştir</button></div>
  <button type="button" class="btn block" data-act="cikis">Çıkış yap</button>`}
function ciz(){
  const ana=S.ekran==='ana';
  $('#who').innerHTML=ana&&S.ben?`<span class="pill"><b>${esc(S.ben.ad)}</b><span>${ROL[S.ben.rol]}</span></span>`:'';
  $('#tabs').classList.toggle('hidden',!ana);
  if(ana){const bek=S.belgeler.filter(b=>b.durum==='eksik_satir'||b.durum==='olasi_mukerrer').length;
    const tl=[['ana','Ana',ic('ana'),bek],['stok','Stok',ic('kutu'),0],['sevk','Teslimat',ic('kamyon'),S.rez.length],...(yon()?[['yonetim','Yönetim',ic('ekip'),0]]:[]),['hesabim','Hesabım',ic('kisi'),0]];
    $('#tabbar').innerHTML=tl.map(([k,l,i,n])=>`<button type="button" data-act="tab" data-tab="${k}" ${S.tab===k?'aria-current="page"':''}>${i}<span>${l}</span>${n?`<span class="dot">${n>99?'99+':n}</span>`:''}</button>`).join('')}
  $('#app').innerHTML=S.ekran==='yukleniyor'?'<p class="muted">Yükleniyor…</p>':S.ekran==='kurulum'?vKurulum():S.ekran==='giris'?vGiris()
    :S.tab==='stok'?vStok():S.tab==='sevk'?vSevk():S.tab==='yonetim'?vYonetim():S.tab==='hesabim'?vHesabim():(S.taslak?vTaslak():vAna());
}
function yumusak(){const a=document.activeElement;if(a&&/^(INPUT|SELECT)$/.test(a.tagName))return;if(S.sheet||S.sec||(S.taslak&&S.tab==='ana'))return;ciz()}
let tt;function toast(m,kotu){$('#toast').innerHTML=`<div class="toast ${kotu?'bad':'ok'}" role="status">${ic(kotu?'uyari':'tik')}<span>${esc(m)}</span></div>`;clearTimeout(tt);tt=setTimeout(()=>$('#toast').innerHTML='',5000)}

/* ---------- alt paneller ---------- */
const SD={bekliyor:['Tamamlanacak','warn'],rezerve:['Satıldı, teslim bekliyor','acc'],teslim:['Teslim edildi','ok'],stok_yetersiz:['Stok yetersiz','bad'],kabul_bekliyor:['Mal bekleniyor','acc'],kabul_edildi:['Teslim alındı','ok'],stok_disi:['Stok dışı',''],iptal:['İptal','bad']};
async function belgeAc(id){
  S.sheet={tip:'belge',id,satirlar:null,kabul:{},url:null,iptalSor:false};sheet();
  const b=S.belgeler.find(x=>x.id===id);
  const{data}=await sb.from('belge_satir').select('*').eq('belge_id',id).order('sira');
  if(!S.sheet||S.sheet.id!==id)return;S.sheet.satirlar=data||[];
  if(b&&b.tur==='alis'&&data&&data.length){const{data:k}=await sb.from('mal_kabul').select('belge_satir_id,miktar').in('belge_satir_id',data.map(x=>x.id));(k||[]).forEach(x=>S.sheet.kabul[x.belge_satir_id]=(S.sheet.kabul[x.belge_satir_id]||0)+ +x.miktar)}
  const{data:bd}=await sb.from('belge').select('dosya_yolu').eq('id',id).maybeSingle();
  if(bd&&bd.dosya_yolu){const{data:u}=await sb.storage.from('belgeler').createSignedUrl(bd.dosya_yolu,3600);if(u&&S.sheet&&S.sheet.id===id)S.sheet.url=u.signedUrl}
  if(S.sheet&&S.sheet.id===id)sheet();
}
function sheet(){
  const s=S.sheet,el=$('#sheet');if(!s){el.innerHTML='';return}
  let h='';const kapat='<button type="button" class="x" data-act="skapat" aria-label="Kapat">×</button>';
  if(s.tip==='belge'){const b=S.belgeler.find(x=>x.id===s.id)||{tur:'satis',durum:'okunuyor'},d=DURUM[b.durum]||[b.durum,''],benim=b.yukleyen===S.ben.id||yon();
    h=`<div class="row"><div class="grow"><h2>${b.tur==='satis'?'Satış fişi':'İrsaliye'}</h2><div class="small muted">${esc(b.cari_ad||'')}${b.belge_no?' · '+esc(b.belge_no):''} · ${tarihS(b.olusturma)}${S.kisiler[b.yukleyen]?' · '+esc(S.kisiler[b.yukleyen]):''}</div></div><span class="chip ${d[1]}">${d[0]}</span>${kapat}</div>
    ${b.durum==='olasi_mukerrer'?`<div class="note warn">Aynı müşteri, aynı gün ve aynı satırlarla bir fiş daha önce girilmiş. Bu fişin satırları henüz işlenmedi.${benim?' <button type="button" class="link" data-act="farkli">Bu farklı bir fiş, işle</button>':''}${yon()?'':' Aynı fişse bir şey yapmayın; yönetici iptal eder.'}</div>`:''}
    ${!s.satirlar?`<div class="list">${iskelet(3)}</div>`:`<div class="list">${s.satirlar.map(l=>{const u=l.urun_id&&S.U.get(l.urun_id),sd=SD[l.durum]||[l.durum,''],kalan=l.durum==='kabul_bekliyor'?Math.round((+l.miktar-(s.kabul[l.id]||0))*1000)/1000:0;
      return`<div class="item" style="flex-wrap:wrap"><div class="grow"><div class="nm">${esc(u?u.ad:(l.ham_metin||'Satır '+l.sira))}</div><div class="small muted">${l.miktar!=null?fmt(l.miktar)+' '+bl(u):''}${l.ham_metin&&u?' · belgede: '+esc(l.ham_metin):''}</div></div><span class="chip ${sd[1]}">${sd[0]}</span>
        ${(l.durum==='bekliyor'||l.durum==='stok_yetersiz')&&benim&&b.durum!=='olasi_mukerrer'&&b.durum!=='iptal'?`<div class="row" style="width:100%"><button type="button" class="btn sm grow" data-act="sduz" data-id="${l.id}">${l.durum==='stok_yetersiz'?'Düzelt':'Tamamla'}</button>${l.durum==='stok_yetersiz'&&yon()?`<button type="button" class="btn sm dark" data-act="yetersiz" data-id="${l.id}">Yine de sat (stok eksiye düşer)</button>`:''}</div>`:''}
        ${l.durum==='kabul_bekliyor'&&b.durum!=='iptal'?`<div class="row" style="width:100%"><span class="small muted grow">Gelen miktar${s.kabul[l.id]?' (kalan '+fmt(kalan)+')':''}</span><input class="inp num" inputmode="decimal" id="kb${l.id}" value="${esc(yaz(kalan))}" aria-label="Gelen miktar"><button type="button" class="btn sm ok" data-act="kabul" data-id="${l.id}">Teslim aldım</button></div>`:''}</div>`}).join('')||'<p class="muted small">Satır yok.</p>'}</div>`}
    ${s.url?`<a class="btn block" href="${esc(s.url)}" target="_blank" rel="noopener">Fotoğrafı aç</a>`:''}
    ${yon()&&b.durum!=='iptal'?(s.iptalSor?`<div class="note bad">İptal edilince bu belgenin bütün stok etkisi geri alınır; teslim edilmiş mallar da stoka geri yazılır. <button type="button" class="link" data-act="biptal2">Evet, iptal et</button></div>`:`<button type="button" class="btn block" data-act="biptal">Belgeyi iptal et</button>`):''}`}
  else if(s.tip==='satir'){const u=s.urun_id&&S.U.get(s.urun_id);
    h=`<div class="row"><h2 class="grow">Satırı tamamla</h2>${kapat}</div>${s.ham?`<div class="small muted">Belgede yazan: ${esc(s.ham)}</div>`:''}
    <button type="button" class="prod ${u?'':'bos'}" data-act="ssec"><span>${u?esc(u.ad)+' <span class="muted small">'+esc(u.kategori)+'</span>':'Ürün seçmek için dokunun'}</span><span class="small">Değiştir</span></button>
    <div class="row"><label class="small muted grow" for="s-m">Miktar</label><input class="inp num" id="s-m" inputmode="decimal" data-in="sm" value="${esc(s.m)}"><span class="small" style="min-width:42px">${bl(u)}</span></div>
    ${s.tur==='satis'?`<label class="tog"><input type="checkbox" data-in="steslim" ${s.teslim?'checked':''}> Tezgâhtan verildi</label>${u?`<div class="small muted">Satılabilir stok: ${fmt(u.kullanilabilir)} ${bl(u)}</div>`:''}`:''}
    <button type="button" class="btn pri block" data-act="skaydet">Kaydet</button><button type="button" class="btn block" data-act="sdis">Bu satır stok dışı (nakliye, işçilik vb.)</button>`}
  else if(s.tip==='rez'){const r=S.rez.find(x=>x.id===s.id);if(!r){S.sheet=null;el.innerHTML='';return}const u=S.U.get(r.urun_id);
    h=`<div class="row"><div class="grow"><h2>${esc(u?u.ad:'Ürün')}</h2><div class="small muted">${esc(r.musteri||'Müşteri yazılmamış')} · satılan ${fmt(r.miktar)} ${bl(u)} · kalan ${fmt(r.kalan)}</div></div>${kapat}</div>
    <div class="row"><label class="small muted grow" for="r-m">Şimdi verilen miktar</label><input class="inp num" id="r-m" inputmode="decimal" placeholder="${bl(u)}"><span class="small" style="min-width:42px">${bl(u)}</span></div>
    <button type="button" class="btn pri block" data-act="sevkkismi">Teslim et</button>
    ${yon()?(s.iptalSor?`<div class="note bad">Kalan ${fmt(r.kalan)} ${bl(u)} satıştan düşer ve yeniden satılabilir olur. <button type="button" class="link" data-act="riptal2">Evet, kalanını iptal et</button></div>`:`<button type="button" class="btn block" data-act="riptal">Kalan satışı iptal et</button>`):''}`}
  else if(s.tip==='urun'){const u=S.U.get(s.id);if(!u){S.sheet=null;el.innerHTML='';return}const rz=S.rez.filter(r=>r.urun_id===u.urun_id);
    h=`<div class="row"><div class="grow"><h2>${esc(u.ad)}</h2><div class="small muted">${esc(u.kategori)} · birim: ${bl(u)}</div></div>${kapat}</div>
    <div class="three"><div><b>${fmt(u.fiziksel)}</b><span>Depoda</span></div><div><b>${fmt(u.rezerve)}</b><span>Satıldı, bekliyor</span></div><div class="main"><b style="color:${u.kullanilabilir<0?'#f87171':'inherit'}">${fmt(u.kullanilabilir)}</b><span>Satılabilir</span></div></div>
    ${u.kritik?`<div class="note warn">Satılabilir miktar kritik seviyenin (${fmt(u.min_stok)} ${bl(u)}) altında.</div>`:''}${u.kullanilabilir<0?'<div class="note bad">Satılabilir miktar eksi: depodakinden fazlası satılmış görünüyor. Sayımı kontrol edin.</div>':''}
    ${rz.length?`<div><h3>Teslim bekleyen satışlar</h3><div class="list">${rz.map(r=>`<div class="item"><div class="grow"><div class="nm">${esc(r.musteri||'Müşteri yazılmamış')}</div><div class="small muted">${esc(S.kisiler[r.personel]||'')} · ${new Date(r.satis_tarihi).toLocaleDateString('tr-TR')}</div></div><div class="qty" style="font-size:18px">${fmt(r.kalan)}<small>${bl(u)}</small></div></div>`).join('')}</div></div>`:''}
    ${yon()?`<div class="card form"><h3>Ürün ayarları</h3>
      <label class="field">Kritik stok seviyesi (${bl(u)})<input id="u-min" inputmode="decimal" value="${esc(yaz(+u.min_stok))}"></label>
      ${['METRE','KG','M2'].filter(k=>k!==u.birim_kod).map(k=>`<label class="field">İrsaliye ${k.toLocaleLowerCase('tr')} ile gelirse: 1 ${bl(u)} kaç ${k.toLocaleLowerCase('tr')}<input id="u-c-${k}" inputmode="decimal" value="${esc(yaz(S.cevrim[u.urun_id+'|'+k]))}" placeholder="boş: sorulur"></label>`).join('')}
      <button type="button" class="btn block" data-act="uayar">Ayarları kaydet</button></div>
      <div><h3>Son hareketler</h3>${!s.hareket?`<div class="list">${iskelet(2)}</div>`:`<div style="overflow-x:auto"><table><tr><th>Tarih</th><th>İşlem</th><th class="r">Depo</th><th class="r">Bekleyen</th></tr>${s.hareket.map(x=>`<tr><td>${tarihS(x.zaman)}</td><td>${({rezerve:'Satış',sevk:'Teslim',rezerve_iptal:'Satış iptali',giris:'Mal girişi',sayim:'Sayım',iptal_ters:'Belge iptali'})[x.tip]||x.tip} · ${esc(S.kisiler[x.kullanici]||'')}</td><td class="r">${+x.fiziksel_delta?(x.fiziksel_delta>0?'+':'')+fmt(+x.fiziksel_delta):''}</td><td class="r">${+x.rezerve_delta?(x.rezerve_delta>0?'+':'')+fmt(+x.rezerve_delta):''}</td></tr>`).join('')||'<tr><td colspan="4" class="muted">Hareket yok.</td></tr>'}</table></div>`}</div>`:''}`}
  else if(s.tip==='sayim'){const g=Object.entries(S.sayim||{}).map(([id,v])=>[S.U.get(+id),num(v)]).filter(([u,c])=>u&&!isNaN(c));
    h=`<div class="row"><div class="grow"><h2>Sayımı onayla</h2><div class="small muted">${g.length} ürünün depodaki miktarı değişecek. Rakamları son kez kontrol edin.</div></div>${kapat}</div>
    <div style="overflow-x:auto"><table><tr><th>Ürün</th><th class="r">Kayıtlı</th><th class="r">Sayılan</th><th class="r">Fark</th></tr>${g.map(([u,c])=>{const f=Math.round((c-u.fiziksel)*1000)/1000;return`<tr><td>${esc(u.ad)}</td><td class="r">${fmt(u.fiziksel)}</td><td class="r"><b>${fmt(c)}</b></td><td class="r" style="font-weight:700;color:${f<0?'var(--bad)':f>0?'var(--ok)':'var(--muted)'}">${f>0?'+':''}${fmt(f)}</td></tr>`}).join('')}</table></div>
    <button type="button" class="btn pri block" data-act="saykaydet" ${S.mesgul?'disabled':''}>${S.mesgul?'Kaydediliyor…':'Onayla ve kaydet'}</button>`}
  else if(s.tip==='personel'){const p=S.personel.find(x=>x.id===s.id);if(!p){S.sheet=null;el.innerHTML='';return}
    h=`<div class="row"><div class="av">${esc(p.ad.trim().charAt(0).toLocaleUpperCase('tr'))}</div><div class="grow"><h2>${esc(p.ad)}</h2><div class="small muted">${ROL[p.rol]}${p.kullanici_adi?' · '+esc(p.kullanici_adi):''}</div></div>${kapat}</div>
    <div class="card form"><h3>Şifre sıfırla</h3><label class="field">Yeni şifre (en az 6 karakter)<input id="s-sifre" autocomplete="off"></label><button type="button" class="btn block" data-act="psifre">Şifreyi değiştir</button></div>
    <button type="button" class="btn block" data-act="paktif">${p.aktif?'Hesabı pasife al (giriş yapamaz)':'Hesabı yeniden etkinleştir'}</button>`}
  el.innerHTML=`<div class="sheet-bg" data-act="sbg"><div class="sheet" role="dialog" aria-modal="true">${h}</div></div>`;
}
/* ürün seçici (taslak satırı ve satır tamamlama ortak kullanır) */
function secListe(){const s=S.sec,ts=norm(s.q).split(' ').filter(Boolean);
  let ps=ts.length?S.urunler.filter(u=>u.aktif&&ts.every(t=>u.n.includes(t))).sort((a,b)=>(b.n.startsWith(ts[0])-a.n.startsWith(ts[0]))||a.n.length-b.n.length).slice(0,40):(s.adaylar||[]).map(i=>S.U.get(i)).filter(Boolean);
  return ps.map(u=>`<button type="button" class="item" data-act="secu" data-id="${u.urun_id}"><div class="grow"><div class="nm">${esc(u.ad)}</div><div class="small muted">${esc(u.kategori)}</div></div><div class="qty" style="font-size:16px">${fmt(u.kullanilabilir)}<small>${bl(u)}</small></div></button>`).join('')||`<p class="muted small" style="margin:8px 0">${ts.length?'Uyan ürün yok.':'Ürün adını ya da ölçüsünü yazın.'}</p>`}
function secici(){const s=S.sec,el=$('#secici');if(!s){el.innerHTML='';return}
  el.innerHTML=`<div class="sheet-bg" data-act="secbg"><div class="sheet" role="dialog" aria-modal="true" style="min-height:70%"><div class="row"><h2 class="grow">Ürün seç</h2><button type="button" class="x" data-act="seckapat" aria-label="Kapat">×</button></div>
    ${s.ham?`<div class="small muted">Belgede yazan: ${esc(s.ham)}</div>`:''}<div class="search">${ic('ara')}<input class="inp" id="secq" type="search" placeholder="Ürün ara" aria-label="Ürün ara" data-in="secq" value="${esc(s.q)}"></div>
    <div class="list" id="secl">${secListe()}</div>${s.disOlur?'<button type="button" class="btn block" data-act="secdis">Stok dışı satır (nakliye, işçilik vb.)</button>':''}</div></div>`;
  const q=$('#secq');if(q&&!s.adaylar.length)q.focus();
}

/* ---------- olaylar ---------- */
async function is(f){if(S.mesgul)return;S.mesgul=true;if(!S.sheet&&!S.taslak)ciz();try{await f()}catch(e){toast(hataMetni(e),1)}finally{S.mesgul=false;if(!(S.taslak&&S.tab==='ana'))ciz();sheet()}}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,t=S.taslak,id=b.dataset.id&&(isNaN(+b.dataset.id)?b.dataset.id:+b.dataset.id);
  if(a==='sbg'){if(e.target===b){S.sheet=null;sheet()}return}
  if(a==='secbg'){if(e.target===b){S.sec=null;secici()}return}
  if(a==='tab'){S.tab=b.dataset.tab;S.more=100;S.sayim=null;S.sevkOnay=null;if(S.kat==='__girilen')S.kat='';ciz();window.scrollTo(0,0);if(S.tab==='yonetim')personelYukle();else tazele()}
  else if(a==='kurulum'){const ad=$('#k-ad').value.trim(),ep=$('#k-eposta').value.trim(),s1=$('#k-sifre').value,s2=$('#k-sifre2').value;
    if(!ad||!ep.includes('@')){toast('Adınızı ve e-posta adresinizi yazın.',1);return}if(s1.length<8){toast('Şifre en az 8 karakter olmalı.',1);return}if(s1!==s2){toast('İki şifre aynı değil.',1);return}
    is(async()=>{await hesap({islem:'ilk_kurulum',ad,eposta:ep,sifre:s1});const{error}=await sb.auth.signInWithPassword({email:ep.toLowerCase(),password:s1});if(error)throw error;S.not='';if(await profilYukle()){S.ekran='ana';tazele()}else S.ekran='giris'})}
  else if(a==='giris'){const kim=$('#g-kim').value.trim(),sifre=$('#g-sifre').value;if(!kim||!sifre){toast('Kullanıcı adı ve şifreyi yazın.',1);return}
    const email=kim.includes('@')?kim.toLowerCase():sade(kim).replace(/[^a-z0-9._-]/g,'')+'@'+AYAR.alan;
    is(async()=>{const{error}=await sb.auth.signInWithPassword({email,password:sifre});if(error){S.not='Kullanıcı adı ya da şifre hatalı.';return}S.not='';if(await profilYukle()){S.ekran='ana';S.tab='ana';tazele()}})}
  else if(a==='cikis'){is(async()=>{await sb.auth.signOut();Object.assign(S,{ben:null,oturum:null,urunler:[],U:new Map(),yuklendi:false,anaYuklendi:false,belgeler:[],rez:[],dikkat:[],taslak:null,ekran:'giris',tab:'ana'})})}
  else if(a==='sifrem'){const s=$('#h-sifre').value;if(s.length<6){toast('Şifre en az 6 karakter olmalı.',1);return}is(async()=>{const{error}=await sb.auth.updateUser({password:s});if(error)throw error;toast('Şifreniz değişti.')})}
  /* taslak */
  else if(a==='elle'){S.taslak={tur:b.dataset.tur,durum:'onay',mesaj:'',satirlar:[bosSatir()],cari:'',belgeNo:'',tarih:null,toplam:null,img:null,yol:null,iz:null,islem:kimlik(),kaydediyor:false};ciz()}
  else if(a==='tvazgec'){S.taslak=null;ciz()}
  else if(a==='tekle'){t.satirlar.push(bosSatir());ciz()}
  else if(a==='tsil'){t.satirlar.splice(+b.dataset.i,1);ciz()}
  else if(a==='tonay'){t.satirlar[+b.dataset.i].onay=true;ciz()}
  else if(a==='tsec'){const l=t.satirlar[+b.dataset.i];S.sec={q:'',ham:l.ham,adaylar:[...(l.urun_id?[l.urun_id]:[]),...(l.adaylar||[])],disOlur:true,sec:uid=>{urunAta(l,uid);l.onay=true;ciz()},dis:()=>{l.dis=true;l.urun_id=null;ciz()}};secici()}
  else if(a==='tkaydet'){taslakKaydet()}
  /* ürün seçici */
  else if(a==='seckapat'){S.sec=null;secici()}
  else if(a==='secu'){const f=S.sec.sec;S.sec=null;secici();f(id)}
  else if(a==='secdis'){const f=S.sec.dis;S.sec=null;secici();f()}
  /* belge ve satır */
  else if(a==='belge'){belgeAc(id)}
  else if(a==='skapat'){S.sheet=null;sheet();if(!(S.taslak&&S.tab==='ana'))ciz()}
  else if(a==='farkli'){const bid=S.sheet.id;is(async()=>{await rpc('belge_farkli_onayla',{p_belge:bid,p_islem:kimlik()});toast('Fiş işlendi.');await tazele();belgeAc(bid)})}
  else if(a==='sduz'){const l=S.sheet.satirlar.find(x=>x.id===id),bg=S.belgeler.find(x=>x.id===S.sheet.id);S.sheet={tip:'satir',id,belge:S.sheet.id,tur:bg?bg.tur:'satis',ham:l.ham_metin,urun_id:l.urun_id,m:yaz(l.miktar!=null?+l.miktar:(l.okunan_miktar!=null?+l.okunan_miktar:null)),teslim:l.teslim_edildi};sheet()}
  else if(a==='ssec'){const s=S.sheet;S.sec={q:'',ham:s.ham,adaylar:s.urun_id?[s.urun_id]:[],disOlur:false,sec:uid=>{s.urun_id=uid;sheet()}};secici()}
  else if(a==='skaydet'){const s=S.sheet,m=num(s.m);if(!s.urun_id){toast('Önce ürünü seçin.',1);return}if(!(m>0)){toast('Miktarı yazın.',1);return}
    is(async()=>{await rpc('satir_tamamla',{p_satir:s.id,p_urun:s.urun_id,p_miktar:m,p_teslim:s.tur==='satis'?!!s.teslim:null,p_stok_disi:false,p_islem:kimlik()});
      if(s.ham&&norm(s.ham).length>1)sb.from('urun_takma_ad').insert({urun_id:s.urun_id,metin_norm:norm(s.ham)}).then(()=>{},()=>{});toast('Satır tamamlandı.');await tazele();belgeAc(s.belge)})}
  else if(a==='sdis'){const s=S.sheet;is(async()=>{await rpc('satir_tamamla',{p_satir:s.id,p_urun:null,p_miktar:null,p_teslim:null,p_stok_disi:true,p_islem:kimlik()});toast('Satır stok dışı olarak işaretlendi.');await tazele();belgeAc(s.belge)})}
  else if(a==='yetersiz'){const bid=S.sheet.id;is(async()=>{await rpc('yetersiz_onayla',{p_satir:id,p_islem:kimlik()});toast('Satış kaydedildi; stok eksiye düştü.');await tazele();belgeAc(bid)})}
  else if(a==='kabul'){const bid=S.sheet.id,m=num($('#kb'+id).value);if(!(m>0)){toast('Gelen miktarı yazın.',1);return}is(async()=>{await rpc('mal_kabul_onayla',{p_satir:id,p_miktar:m,p_islem:kimlik()});toast(fmt(m)+' birim stoka eklendi.');await tazele();belgeAc(bid)})}
  else if(a==='biptal'){S.sheet.iptalSor=true;sheet()}
  else if(a==='biptal2'){const bid=S.sheet.id;is(async()=>{await rpc('belge_iptal',{p_belge:bid,p_aciklama:'Yönetici iptali',p_islem:kimlik()});S.sheet=null;toast('Belge iptal edildi, stok geri alındı.');await tazele()})}
  /* teslimat */
  else if(a==='sevktam'){S.sevkOnay=id;$('#sevkl').innerHTML=sevkListe()}
  else if(a==='sevktam2'){const r=S.rez.find(x=>x.id===id);S.sevkOnay=null;if(!r)return;is(async()=>{await rpc('sevk_et',{p_rezervasyon:id,p_miktar:r.kalan,p_islem:kimlik(),p_zorla:false});toast('Teslim kaydedildi, stoktan düşüldü.');await tazele()})}
  else if(a==='rezac'){S.sevkOnay=null;S.sheet={tip:'rez',id,iptalSor:false};sheet()}
  else if(a==='sevkkismi'){const rid=S.sheet.id,m=num($('#r-m').value);if(!(m>0)){toast('Verilen miktarı yazın.',1);return}is(async()=>{await rpc('sevk_et',{p_rezervasyon:rid,p_miktar:m,p_islem:kimlik(),p_zorla:false});S.sheet=null;toast('Teslim kaydedildi, stoktan düşüldü.');await tazele()})}
  else if(a==='riptal'){S.sheet.iptalSor=true;sheet()}
  else if(a==='riptal2'){const rid=S.sheet.id;is(async()=>{await rpc('rezervasyon_iptal',{p_rezervasyon:rid,p_aciklama:'Yönetici iptali',p_islem:kimlik()});S.sheet=null;toast('Kalan satış iptal edildi.');await tazele()})}
  /* stok */
  else if(a==='kat'){S.kat=b.dataset.kat;S.more=100;ciz()}
  else if(a==='temizle'){S.q='';S.kat='';ciz()}
  else if(a==='qsil'){S.q='';ciz();$('#q').focus()}
  else if(a==='more'){S.more+=300;$('#rows').innerHTML=satirlar()}
  else if(a==='saymod'){S.sayim=S.sayim?null:{};if(S.kat==='__girilen')S.kat='';ciz()}
  else if(a==='sayincele'){for(const v of Object.values(S.sayim)){const c=num(v);if(!isNaN(c)&&c<0){toast('Sayım miktarı eksi olamaz.',1);return}}S.sheet={tip:'sayim'};sheet()}
  else if(a==='saykaydet'){const st=Object.entries(S.sayim).map(([i,v])=>({urun_id:+i,sayilan:num(v)})).filter(x=>!isNaN(x.sayilan));if(!st.length)return;
    is(async()=>{await rpc('sayim_onayla',{p_satirlar:st,p_aciklama:'Sayım',p_islem:kimlik()});S.sayim=null;S.sheet=null;if(S.kat==='__girilen')S.kat='';toast(st.length+' ürünün sayımı kaydedildi.');await stokYukle()})}
  else if(a==='urun'){S.sheet={tip:'urun',id,hareket:null};sheet();if(yon())sb.from('stok_hareket').select('tip,fiziksel_delta,rezerve_delta,zaman,kullanici').eq('urun_id',id).order('zaman',{ascending:false}).limit(20).then(({data})=>{if(S.sheet&&S.sheet.tip==='urun'&&S.sheet.id===id){S.sheet.hareket=data||[];const ae=document.activeElement;if(!(ae&&ae.tagName==='INPUT'))sheet()}})}
  else if(a==='uayar'){const u=S.U.get(S.sheet.id),mn=num($('#u-min').value);if(isNaN(mn)||mn<0){toast('Kritik seviye eksi olamaz.',1);return}
    const or=['METRE','KG','M2'].filter(k=>k!==u.birim_kod).map(k=>[k,num(($('#u-c-'+k)||{}).value)]).filter(([,v])=>v>0);
    is(async()=>{const r1=await sb.from('urun').update({min_stok:mn}).eq('id',u.urun_id);if(r1.error)throw r1.error;
      for(const[k,v]of or){const r2=await sb.from('urun_cevrim').upsert({urun_id:u.urun_id,kaynak_birim:k,oran:v,dogrulandi:true,dogrulayan:S.ben.id},{onConflict:'urun_id,kaynak_birim'});if(r2.error)throw r2.error}
      toast('Ürün ayarları kaydedildi.');await tazele()})}
  /* personel */
  else if(a==='pekle'){const ad=$('#p-ad').value.trim(),kadi=sade($('#p-kadi').value.trim()),sifre=$('#p-sifre').value,rol=$('#p-rol').value;
    if(!ad||!/^[a-z0-9._-]{3,30}$/.test(kadi)){toast('Ad ve kullanıcı adı gerekli. Kullanıcı adı en az 3 harf, boşluksuz olmalı.',1);return}if(sifre.length<6){toast('Şifre en az 6 karakter olmalı.',1);return}
    if(rol==='yonetici'&&!S.yoneticiOnay){S.yoneticiOnay=true;const v={ad,kadi:$('#p-kadi').value,sifre,rol};ciz();$('#p-ad').value=v.ad;$('#p-kadi').value=v.kadi;$('#p-sifre').value=v.sifre;$('#p-rol').value=v.rol;return}
    is(async()=>{await hesap({islem:'personel_ekle',ad,kullanici_adi:kadi,sifre,rol});S.yoneticiOnay=false;toast(ad+' için hesap açıldı. Kullanıcı adı: '+kadi);await personelYukle()})}
  else if(a==='pduz'){S.sheet={tip:'personel',id};sheet()}
  else if(a==='psifre'){const s=$('#s-sifre').value;if(s.length<6){toast('Şifre en az 6 karakter olmalı.',1);return}const pid=S.sheet.id;is(async()=>{await hesap({islem:'sifre_degistir',id:pid,sifre:s});S.sheet=null;toast('Şifre değişti.')})}
  else if(a==='paktif'){const p=S.personel.find(x=>x.id===S.sheet.id);is(async()=>{const{error}=await sb.from('kullanici').update({aktif:!p.aktif}).eq('id',p.id);if(error)throw error;S.sheet=null;toast(p.aktif?'Hesap pasife alındı.':'Hesap etkinleştirildi.');await personelYukle()})}
});
document.addEventListener('input',e=>{const t=e.target,k=t.dataset.in;if(!k)return;const tk=S.taslak;
  if(k==='q'){S.q=t.value;S.more=100;$('#rows').innerHTML=satirlar();$('#qsil').classList.toggle('hidden',!S.q)}
  else if(k==='sq'){S.sq=t.value;S.sevkOnay=null;$('#sevkl').innerHTML=sevkListe()}
  else if(k==='secq'){S.sec.q=t.value;$('#secl').innerHTML=secListe()}
  else if(k==='say'){S.sayim[t.dataset.id]=t.value;const u=S.U.get(+t.dataset.id),f=$('#fark'+t.dataset.id);if(f&&u)f.innerHTML=farkHtml(u,t.value);const sb2=$('#saybar');if(sb2)sb2.innerHTML=sayBar()}
  else if(k==='tm'){tk.satirlar[+t.dataset.i].m=t.value;const tb=$('#tbar');if(tb)tb.innerHTML=taslakBar(tk)}
  else if(k==='tcari')tk.cari=t.value;else if(k==='tno')tk.belgeNo=t.value;
  else if(k==='sm')S.sheet.m=t.value;
  else if(k==='prol'&&S.yoneticiOnay&&t.value!=='yonetici')S.yoneticiOnay=false;
});
document.addEventListener('change',e=>{const t=e.target;
  if(/^f-(satis|alis)-[kd]$/.test(t.id)){const f=t.files&&t.files[0];t.value='';if(f)fisBaslat(t.id.split('-')[1],f)}
  else if(t.dataset.in==='tteslim'){S.taslak.satirlar[+t.dataset.i].teslim=t.checked}
  else if(t.dataset.in==='steslim'){S.sheet.teslim=t.checked}
  else if(t.dataset.in==='tm'&&S.taslak){setTimeout(()=>{const a=document.activeElement;if(!(a&&/^(INPUT|SELECT)$/.test(a.tagName))&&S.taslak&&!S.sec&&!S.sheet)ciz()},0)}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&e.target.matches('#g-sifre,#g-kim'))$('[data-act="giris"]').click();
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('label[data-for]')){e.preventDefault();$('#'+e.target.dataset.for).click()}
  if(e.key==='Escape'){if(S.sec){S.sec=null;secici()}else if(S.sheet){S.sheet=null;sheet()}}
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&S.ekran==='ana'&&!S.sayim&&!S.taslak)tazele()});
setInterval(()=>{if(!document.hidden&&S.ekran==='ana'&&!S.sayim&&!S.taslak&&!S.sheet&&!S.sec)tazele()},60000);
sb.auth.onAuthStateChange((olay,oturum)=>{S.oturum=oturum;if(olay==='SIGNED_OUT'&&S.ekran==='ana'){S.ben=null;S.ekran='giris';ciz()}});
basla();
