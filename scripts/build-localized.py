from pathlib import Path
import subprocess,json,html,re
root=Path(__file__).resolve().parent.parent
extract=r"""const fs=require('fs'),vm=require('vm'),c={};vm.runInNewContext(['content.js','locales.js','content-el.js','content-ru.js','content-ro.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+';this.data={TOPICS,CARDS,QUIZZES,UI_TRANSLATIONS,TOPIC_LOCALES,LANGUAGE_NAMES,content:{el:CONTENT_EL,ru:CONTENT_RU,ro:CONTENT_RO}}',c);console.log(JSON.stringify(c.data))"""
d=json.loads(subprocess.check_output(['node','-e',extract],cwd=root,text=True));esc=lambda value:html.escape(str(value),quote=True)
origin='https://onecardwiser.com'
paths=['cards/'+c['id'] for c in d['CARDS']]+['topics/'+id for id in d['TOPICS']]+['topics','learn-something-new-every-day','stop-doomscrolling','privacy']
def urlpath(lang,path):return '/'+(lang+'/' if lang!='en' else '')+path.strip('/')+'/'
def alternatives(path):return ''.join(f'<link rel="alternate" hreflang="{lang}" href="{origin}{urlpath(lang,path)}">' for lang in d['LANGUAGE_NAMES'])
def language_links(lang,path):return '<nav class="public-languages" aria-label="Language">'+''.join(f'<a lang="{code}" href="{urlpath(code,path)}"'+(' aria-current="page"' if lang==code else '')+f'>{name}</a>' for code,name in d['LANGUAGE_NAMES'].items())+'</nav>'
guides={
'el':{
'learn-something-new-every-day':('Μάθε κάτι νέο κάθε ημέρα',[
('Μια μικρή καθημερινή συνήθεια','Διάλεξε θέματα, άνοιξε μια κάρτα, διάβασε την εξήγηση και το παράδειγμα. Απάντησε στην ερώτηση και σημείωσε την ολοκλήρωση. Η πρόοδος παραμένει στη συσκευή σου.'),
('Κατανόηση και επανάληψη','Κλείσε την κάρτα και εξήγησε την ιδέα με δικά σου λόγια. Όταν αλλάξει η τοπική ημερομηνία, εμφανίζεται η επόμενη κάρτα. Μετά την ολοκλήρωση της πεπερασμένης συλλογής, προηγούμενες ιδέες επιστρέφουν για επανάληψη. Οι προαιρετικές πηγές Wikipedia δίνουν επιπλέον υλικό στα αγγλικά.')]),
'stop-doomscrolling':('Αντικατάστησε λίγο σκρολάρισμα με μάθηση',[
('Ένα διάλειμμα με σαφές τέλος','Μάθε μία ιδέα, έλεγξε αν την κατάλαβες και συνέχισε την ημέρα σου. Διάλεξε έναν μικρό στόχο για τα επόμενα δύο λεπτά.'),
('Κράτησε όσα αξίζουν','Βάλε το One Card Wiser στην αρχική οθόνη ή στους σελιδοδείκτες. Αποθήκευσε μια ιδέα, εξήγησέ την σε φίλο ή χρησιμοποίησέ την σε μια απόφαση. Είναι μια πρακτική δοκιμή, όχι υπόσχεση ότι θα λυθεί κάθε συνήθεια σκρολαρίσματος.')]),
'privacy':('Απόρρητο και επιλογές',[
('Δεδομένα σε αυτή τη συσκευή','Χωρίς λογαριασμό. Η γλώσσα, τα θέματα, οι ολοκληρωμένες κάρτες και ημερομηνίες, οι απαντήσεις, οι αποθηκευμένες ιδέες και οι προεπισκοπήσεις πηγών αποθηκεύονται στο localStorage του προγράμματος περιήγησης. Η εκκαθάριση δεδομένων ιστοτόπου διαγράφει την πρόοδο. Δεν υπάρχει συγχρονισμός μεταξύ συσκευών.'),
('Εκτός σύνδεσης και εξωτερικές υπηρεσίες','Ένας service worker αποθηκεύει δημόσια αρχεία, κάρτες και μεταφράσεις για χρήση εκτός σύνδεσης μετά την πρώτη επιτυχημένη επίσκεψη. Δεν ανεβάζει το ιστορικό μάθησης. Το GitHub Pages φιλοξενεί τον ιστότοπο και λαμβάνει τα συνηθισμένα αιτήματα ιστού. Η εξερεύνηση πηγής Wikipedia στέλνει αίτημα στη Wikimedia, η οποία λαμβάνει στοιχεία σύνδεσης όπως τη διεύθυνση IP. Οι εξωτερικές πηγές έχουν δικές τους πολιτικές απορρήτου.'),
('Προαιρετικά αναλυτικά στοιχεία','Το Google Analytics ενεργοποιείται στην εφαρμογή μόνο με αποδοχή σου. Μετρά επισκέψεις και ενέργειες όπως ολοκλήρωση, απάντηση, αποθήκευση και κοινοποίηση κάρτας, μαζί με το θέμα. Η Google μπορεί να λάβει στοιχεία συσκευής και χρήσης. Η λίστα αποθηκευμένων καρτών και το τοπικό ιστορικό δεν ανεβαίνουν από αυτή τη λειτουργία. Οι δημόσιες σελίδες καρτών, θεμάτων και οδηγών δεν φορτώνουν Analytics.'),
('Ανάκληση και κοινοποίηση','Στις επιλογές αναλυτικών στοιχείων μπορείς να αρνηθείς ή να ανακαλέσεις την άδεια. Η ανάκληση σταματά μελλοντικά συμβάντα και αφαιρεί τα προσβάσιμα cookies Analytics, αλλά δεν διαγράφει αυτόματα προηγούμενα δεδομένα. Η κοινοποίηση στέλνει μόνο την επιλεγμένη ιδέα και τον δημόσιο σύνδεσμο στον προορισμό που επιλέγεις. Οι εικόνες δημιουργούνται στη συσκευή σου.')])},
'ru':{
'learn-something-new-every-day':('Узнавайте новое каждый день',[
('Небольшая ежедневная привычка','Выберите темы, откройте карточку, прочитайте объяснение и пример. Ответьте на вопрос и отметьте завершение. Прогресс остаётся на устройстве.'),
('Понимание и повторение','Закройте карточку и объясните идею своими словами. Следующая карточка появляется при смене местной даты. После завершения конечной коллекции прежние идеи возвращаются для повторения. Необязательные материалы Википедии доступны на английском.')]),
'stop-doomscrolling':('Замените немного прокрутки обучением',[
('Перерыв с понятным завершением','Узнайте одну идею, проверьте понимание и продолжите день. Выберите небольшую цель на следующие две минуты.'),
('Сохраните то, что важно','Добавьте One Card Wiser на главный экран или в закладки. Сохраните идею, объясните другу или примените в решении. Это практический эксперимент, а не обещание исправить любую привычку бесконечной прокрутки.')]),
'privacy':('Конфиденциальность и выбор',[
('Данные на устройстве','Регистрация не нужна. Язык, темы, завершённые карточки и даты, ответы, сохранённые идеи и материалы источников хранятся в localStorage браузера. Очистка данных сайта удалит прогресс. Синхронизации между устройствами нет.'),
('Офлайн и внешние сервисы','Service worker сохраняет публичные файлы, карточки и переводы для работы без интернета после первого успешного посещения. История обучения не загружается на сервер. GitHub Pages размещает сайт и получает обычные веб-запросы. Просмотр материала Википедии отправляет запрос Wikimedia, получающей сведения о соединении, включая IP-адрес. Внешние сайты имеют свои политики конфиденциальности.'),
('Необязательная аналитика','Google Analytics включается в приложении только с вашего согласия. Измеряются посещения и действия: завершение, ответы, сохранение и отправка карточки, вместе с темой. Google может получать сведения об устройстве и использовании. Список сохранённых карточек и локальная история этим инструментом не загружаются. Публичные страницы карточек, тем и руководств не подключают Analytics.'),
('Отзыв согласия и отправка','В настройках аналитики можно отказаться или отозвать согласие. Это остановит будущие события и удалит доступные сайту cookies Analytics, но не удалит автоматически ранее собранные данные. При отправке передаются только выбранная идея и публичная ссылка в выбранное приложение. Изображения создаются на устройстве.')])},
'ro':{
'learn-something-new-every-day':('Învață ceva nou în fiecare zi',[
('Un obicei zilnic mic','Alege temele, deschide un card și citește explicația și exemplul. Răspunde la întrebare, apoi marchează finalizarea. Progresul rămâne pe dispozitiv.'),
('Înțelegere și recapitulare','Închide cardul și explică ideea cu propriile cuvinte. Următorul card apare când se schimbă data locală. După terminarea colecției finite, ideile anterioare revin pentru recapitulare. Sursele opționale Wikipedia oferă material suplimentar în engleză.')]),
'stop-doomscrolling':('Înlocuiește puțină derulare cu învățare',[
('O pauză cu final clar','Învață o idee, verifică înțelegerea și continuă-ți ziua. Alege un obiectiv mic pentru următoarele două minute.'),
('Păstrează ce contează','Adaugă One Card Wiser pe ecranul principal sau la marcaje. Salvează o idee, explic-o unui prieten sau aplic-o într-o decizie. Este un experiment practic, nu o promisiune de a rezolva orice obicei de derulare.')]),
'privacy':('Confidențialitate și opțiuni',[
('Date pe dispozitiv','Nu ai nevoie de cont. Limba, temele, cardurile finalizate și datele, răspunsurile, ideile salvate și previzualizările surselor sunt stocate în localStorage al browserului. Ștergerea datelor site-ului elimină progresul. Nu există sincronizare între dispozitive.'),
('Offline și servicii externe','Un service worker păstrează fișierele publice, cardurile și traducerile pentru utilizare offline după prima vizită reușită. Nu încarcă istoricul învățării. GitHub Pages găzduiește site-ul și primește cereri web obișnuite. Explorarea unei surse Wikipedia trimite o cerere către Wikimedia, care primește informații de conexiune, inclusiv IP-ul. Site-urile externe au propriile politici de confidențialitate.'),
('Analiză opțională','Google Analytics pornește în aplicație numai cu acordul tău. Măsoară vizitele și acțiunile: finalizare, răspuns, salvare și distribuire, împreună cu tema. Google poate primi informații despre dispozitiv și utilizare. Lista cardurilor salvate și istoricul local nu sunt încărcate prin această funcție. Paginile publice de carduri, teme și ghiduri nu încarcă Analytics.'),
('Retragerea acordului și distribuirea','Poți refuza sau retrage acordul din opțiunile de analiză. Retragerea oprește evenimentele viitoare și elimină cookie-urile Analytics accesibile site-ului, dar nu șterge automat datele colectate anterior. Distribuirea trimite numai ideea și linkul public alese către destinația selectată. Imaginile sunt create pe dispozitiv.')])}}
for lang in ['el','ru','ro']:
 def t(key,**values):
  text=d['UI_TRANSLATIONS'].get(key,{}).get(lang,key)
  for k,v in values.items():text=text.replace('{'+k+'}',str(v))
  return esc(text)
 def path(value):return urlpath(lang,value)
 def page(p,title,description,body):
  url=origin+path(p);target=root/path(p).strip('/')/'index.html';target.parent.mkdir(parents=True,exist_ok=True)
  target.write_text(f'<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(title)} | One Card Wiser</title><meta name="description" content="{esc(description)}"><link rel="canonical" href="{url}">{alternatives(p)}<link rel="stylesheet" href="/styles.css?v=20261012-1"><link rel="icon" href="/logo-mark.svg"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(description)}"><meta property="og:url" content="{url}"><meta property="og:image" content="{origin}/social-preview.png"><meta name="twitter:card" content="summary_large_image"></head><body><main class="public-page"><a class="public-brand" href="/?lang={lang}">1W · One Card Wiser</a>{language_links(lang,p)}<p class="eyebrow">{t("Build a mind you’re proud of.")}</p><h1>{esc(title)}</h1>{body}<footer><a href="/?lang={lang}">{t("Open today’s cards")}</a><a href="{path("topics")}">{t("Explore topics")}</a><a href="{path("privacy")}">{t("Privacy")}</a></footer></main></body></html>')
 for c in d['CARDS']:
  row=d['content'][lang][c['id']];q=d['QUIZZES'][c['id']]
  body=f'<p class="public-lead">{esc(row[1])}</p>'+''.join(f'<h2>{t(label)}</h2><p>{esc(value)}</p>' for label,value in [('The idea',row[2]),('An example',row[3]),('Put it into practice',row[4])])
  body+=f'<p><a href="{esc(c["sourceUrl"])}" target="_blank" rel="noopener noreferrer">{t("Further reading:")} {esc(c["sourceName"])} ↗</a></p><p class="source-attribution">{t("External sources may be in their original language.")}</p><details><summary>{t("Test yourself:")} {esc(row[5])}</summary><p>{esc(row[6][q["answer"]])}</p><p>{esc(row[7])}</p></details><p class="source-attribution">{t("Explanation and illustrative examples by One Card Wiser. Source linked for further reading.")}</p><a class="primary-button public-cta" href="/?lang={lang}&amp;card={c["id"]}">{t("Open this card in the app →")}</a>'
  page('cards/'+c['id'],row[0],row[1],body)
 for i,(id,topic) in enumerate(d['TOPICS'].items()):
  label,subtitle=d['TOPIC_LOCALES'][lang][i];selection=[c for c in d['CARDS'] if c['topic']==id]
  body=f'<p class="public-lead">{esc(subtitle)}</p><p>{t("Written cards: {n}. Earlier ideas return for review after you finish the collection.",n=len(selection))}</p><div class="public-card-grid">'+''.join(f'<article><h2><a href="{path("cards/"+c["id"])}">{esc(d["content"][lang][c["id"]][0])}</a></h2><p>{esc(d["content"][lang][c["id"]][1])}</p></article>' for c in selection)+'</div><a class="primary-button public-cta" href="/?lang='+lang+'">'+t('Choose your topics and start learning →')+'</a>'
  page('topics/'+id,label,subtitle,body)
 body='<p class="public-lead">'+t('Short explanations, practical examples and quick quizzes.')+'</p><div class="public-card-grid">'+''.join(f'<article><h2><a href="{path("topics/"+id)}">{esc(d["TOPIC_LOCALES"][lang][i][0])}</a></h2><p>{esc(d["TOPIC_LOCALES"][lang][i][1])}</p></article>' for i,id in enumerate(d['TOPICS']))+'</div>'
 page('topics',html.unescape(t('Explore topics')),html.unescape(t('Short explanations, practical examples and quick quizzes.')),body)
 for p,(title,sections) in guides[lang].items():
  body=''.join(f'<h2>{esc(heading)}</h2><p>{esc(text)}</p>' for heading,text in sections)
  if p=='privacy':body+='<p><a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">GitHub</a> · <a href="https://foundation.wikimedia.org/wiki/Policy:Privacy_policy">Wikimedia</a> · <a href="https://policies.google.com/privacy">Google</a></p>'
  body+=f'<a class="primary-button public-cta" href="/?lang={lang}">{t("Open today’s cards")}</a>';page(p,title,sections[0][1],body)
for p in paths:
 target=root/p/'index.html';text=target.read_text();text=re.sub(r'<link rel="alternate"[^>]*>','',text);text=re.sub(r'<nav class="public-languages".*?</nav>','',text)
 text=text.replace('</head>',alternatives(p)+'</head>');text=re.sub(r'(<a class="public-brand"[^>]*>.*?</a>)',lambda m:m[0]+language_links('en',p),text)
 if p=='privacy':text=text.replace('Your topic choices, completed cards','Your language preference, topic choices, completed cards')
 target.write_text(text)
urls=[origin+'/']+[origin+urlpath(lang,p) for lang in d['LANGUAGE_NAMES'] for p in paths]
(root/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+url+'</loc></url>' for url in urls)+'</urlset>\n')
print(f'Generated {len(urls)} sitemap URLs across four languages')
