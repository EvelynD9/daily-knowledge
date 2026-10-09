from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont
import json, html, textwrap

root=Path(__file__).resolve().parent.parent
extract="const fs=require('fs'),vm=require('vm');const c=vm.createContext({});vm.runInContext(fs.readFileSync('content.js','utf8')+';this.data={TOPICS,CARDS,QUIZZES}',c);process.stdout.write(JSON.stringify(c.data));"
data=json.loads(subprocess.check_output(['node','-e',extract],cwd=root,text=True))
topics,cards=data['TOPICS'],data['CARDS']
esc=lambda s: html.escape(str(s),quote=True)
urls=['https://onecardwiser.com/']

def page(path,title,description,body):
    url='https://onecardwiser.com/'+path.strip('/')+'/'
    target=root/path/'index.html';target.parent.mkdir(parents=True,exist_ok=True)
    prefix='../'*(len(Path(path).parts))
    target.write_text(f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(title)} | One Card Wiser</title><meta name="description" content="{esc(description)}"><link rel="canonical" href="{url}"><link rel="icon" href="{prefix}logo-mark.svg"><link rel="stylesheet" href="{prefix}styles.css"><meta property="og:type" content="article"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(description)}"><meta property="og:url" content="{url}"><meta property="og:image" content="https://onecardwiser.com/social-preview.png"><meta name="twitter:card" content="summary_large_image"></head><body><main class="public-page"><a class="public-brand" href="{prefix}">1W · One Card Wiser</a><p class="eyebrow">Build a mind you’re proud of.</p><h1>{esc(title)}</h1>{body}<footer><a href="{prefix}">Open today’s cards</a><a href="{prefix}topics/">Explore topics</a><a href="{prefix}privacy/">Privacy</a></footer></main></body></html>''')
    urls.append(url)

for card in cards:
    body=f'<p class="public-lead">{esc(card["hook"])}</p><h2>The idea</h2><p>{esc(card["concept"])}</p><h2>An example</h2><p>{esc(card["example"])}</p><h2>Put it into practice</h2><p>{esc(card["takeaway"])}</p><p><a href="{esc(card["sourceUrl"])}" target="_blank" rel="noopener noreferrer">Further reading: {esc(card["sourceName"])} ↗</a></p>'
    quiz=data['QUIZZES'][card['id']]
    body+=f'<details><summary>Test yourself: {esc(quiz["question"])}</summary><p>{esc(quiz["options"][quiz["answer"]])}</p><p>{esc(quiz["feedback"])}</p></details>'
    body+=f'<p class="source-attribution">Explanation and illustrative examples by One Card Wiser. Source linked for further reading.</p><a class="primary-button public-cta" href="../../?card={esc(card["id"])}">Open this card in the app →</a><p><a href="../../topics/{card["topic"]}/">More {esc(topics[card["topic"]]["label"])} ideas</a></p>'
    page('cards/'+card['id'],card['title'],card['hook'],body)

for id,topic in topics.items():
    selection=[c for c in cards if c['topic']==id]
    body=f'<p class="public-lead">{esc(topic["subtitle"])}. Explore a short explanation, an everyday example and a question you can answer from memory.</p><p>The {esc(topic["label"])} collection currently has {len(selection)} written {"card" if len(selection)==1 else "cards"}. The daily app introduces written ideas and revisits earlier cards once the collection is complete. Source previews offer additional reading.</p><div class="public-card-grid">'
    for card in selection:
        body+=f'<article><h2><a href="../../cards/{card["id"]}/">{esc(card["title"])}</a></h2><p>{esc(card["hook"])}</p></article>'
    body+='</div><a class="primary-button public-cta" href="../../">Choose your topics and start learning →</a>'
    page('topics/'+id,'Daily '+topic['label']+' learning cards', 'Short '+topic['label'].lower()+' cards with clear explanations, real-world examples, sources and quick quizzes.',body)

page('topics','Explore learning topics','Browse short learning cards across economics, science, art, psychology, history, technology and more.', '<p class="public-lead">Choose what you want to understand better. Every written card pairs an idea with an example and a quick check.</p><div class="public-card-grid">'+''.join(f'<article><h2><a href="{id}/">{esc(t["label"])}</a></h2><p>{esc(t["subtitle"])}</p></article>' for id,t in topics.items())+'</div>')

page('learn-something-new-every-day','Learn something new every day','Build a daily learning habit with short, sourced cards and quick quizzes. No account needed.', '''<p class="public-lead">You don’t need an hour of free time to become more curious. Start with one idea you can understand, explain and use.</p><h2>A small routine you can repeat</h2><p>Choose your topics, open one card and read the explanation. Connect it to the example, answer the question, then mark it complete. Your progress and saved ideas stay on your device.</p><h2>Understanding beats collecting facts</h2><p>Try closing a card before the quiz and explaining it in your own words. A short question helps you notice what you understood and what deserves a second look.</p><h2>What you can learn here</h2><p>Start with <a href="../topics/economics/">economics</a>, <a href="../topics/science/">science</a> or <a href="../topics/art/">art</a>, or browse all twelve topics. Written cards include source links for further reading. Optional Wikipedia previews are labelled separately.</p><h2>What happens tomorrow?</h2><p>Your next written card appears when the local date changes. Once you have worked through a topic’s collection, earlier cards return as review. The collection is finite; the source explorer offers additional material when you want it.</p><a class="primary-button public-cta" href="../">Start with today’s cards →</a>''')

page('stop-doomscrolling','Replace a little scrolling with learning','Try a short daily learning routine instead of an endless feed: one idea, one example and one question.', '''<p class="public-lead">Give your next spare moment a clear ending: learn one idea, check your understanding, then move on.</p><h2>Choose a smaller goal</h2><p>Instead of promising to stop using your phone, decide what you want to do with the next two minutes. Open a card in a topic you care about and finish the question.</p><h2>Make the useful action easy to find</h2><p>Save One Card Wiser to your home screen or bookmark it beside the apps you open automatically. When you catch yourself scrolling without a purpose, use that moment as a cue to try one card.</p><h2>Keep what you want to remember</h2><p>Save an idea to revisit later. Explain it to a friend, use its example in a real decision, or download the card as a story image. Knowing why an idea matters gives you a reason to remember it.</p><h2>Start with something concrete</h2><p>Try <a href="../cards/econ-opportunity-cost/">opportunity cost</a> to think about trade-offs or <a href="../cards/art-negative-space/">negative space</a> to notice images differently. This routine is a practical experiment you can try; it is not a promise to solve every scrolling habit.</p><a class="primary-button public-cta" href="../">Make your next break a learning break →</a>''')

page('privacy','Privacy and your choices','How One Card Wiser stores learning progress and handles optional analytics and external source requests.', '''<p class="public-lead">One Card Wiser works without an account. This version keeps your learning data in your browser.</p><h2>Progress on this device</h2><p>Your topic choices, completed cards, dates, quiz answers, saved ideas and source previews are stored in localStorage. Clearing this site’s browser data removes that progress. There is no cross-device synchronisation in this version.</p><h2>Offline installation</h2><p>A service worker caches the app’s public files so written cards can open offline after a successful first visit. It does not upload your saved learning history.</p><h2>External services</h2><p>GitHub Pages hosts this website and receives normal web requests. Exploring a Wikipedia source preview sends a request from your device to Wikimedia, which receives connection information such as your IP address. Source links open the named third-party website. Those services have their own privacy policies.</p><h2>Analytics</h2><p>Google Analytics is not configured in this release. If a measurement ID is added later, the app will ask before loading Google Analytics. If you allow it, visits and actions such as card completion, quiz answers, saves and shares may be measured with their topic. Your saved-card list and local learning history are not uploaded by this feature. Google may receive usage and device information.</p><p>You can open Analytics choices in the app, decline optional analytics or withdraw permission there. Withdrawal disables future analytics events and removes Google Analytics cookies accessible to this website. Previously collected data is not automatically deleted by that choice.</p><h2>Sharing</h2><p>Sharing sends only the idea and public link you choose to the destination you select. Story downloads are created on your device.</p><p><a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">GitHub privacy</a> · <a href="https://foundation.wikimedia.org/wiki/Policy:Privacy_policy">Wikimedia privacy</a> · <a href="https://policies.google.com/privacy">Google privacy</a></p>''')

(root/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: https://onecardwiser.com/sitemap.xml\n')
(root/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+url+'</loc></url>' for url in urls)+'</urlset>\n')
(root/'.nojekyll').write_text('')
if '.public-page {' not in (root/'styles.css').read_text():
 with (root/'styles.css').open('a') as f:
    f.write('''
.weekly-progress { color: var(--muted); font-size: 13px; margin: -8px 0 20px; }
.site-tools { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; margin: 36px 0 18px; font-size: 13px; }
.site-tools a, .public-page a { color: var(--sage); }
.site-tools p { flex-basis: 100%; line-height: 1.6; }
.text-button { border: 0; padding: 0; color: var(--sage); background: none; cursor: pointer; text-decoration: underline; }
.source-attribution { color: var(--muted); font-size: 12px; line-height: 1.6; overflow-wrap: anywhere; }
.card-actions { flex-wrap: wrap; }
dialog:not(.sheet-dialog):not(.card-dialog) { max-width: min(520px, 92vw); border: 1px solid var(--line); border-radius: 22px; padding: 28px; background: var(--card); }
dialog textarea { width: 100%; }
.public-page { width: min(820px, 100%); margin: 0 auto; padding: 40px 24px 70px; line-height: 1.8; }
.public-brand { display: inline-block; margin-bottom: 45px; text-decoration: none; font-weight: 700; }
.public-page h1 { margin-bottom: 26px; line-height: 1.14; }
.public-page h2 { font-size: 26px; margin: 36px 0 12px; }
.public-lead { font-size: 21px; color: var(--muted); }
.public-card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%,280px),1fr)); gap: 20px; margin: 30px 0; }
.public-card-grid article { background: var(--card); padding: 24px; border: 1px solid var(--line); border-radius: 20px; }
.public-card-grid h2 { margin-top: 0; font-size: 24px; }
.public-cta { display: inline-block; color: white !important; text-decoration: none; margin: 24px 0; }
.public-page footer { display: flex; flex-wrap: wrap; gap: 20px; border-top: 1px solid var(--line); padding-top: 24px; margin-top: 50px; font-size: 14px; }
.public-page details { background: var(--card); padding: 22px; border-radius: 18px; margin: 28px 0; }
.public-page summary { cursor: pointer; font-weight: 600; }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; } }
''')

fontdir='/usr/share/fonts/truetype/dejavu/'
def font(name,size): return ImageFont.truetype(fontdir+name+'.ttf',size)
(root/'icons').mkdir(exist_ok=True)
for size in (192,512):
    im=Image.new('RGB',(size,size),'#20231f');d=ImageDraw.Draw(im)
    d.text((size/2,size/2),'1W',font=font('DejaVuSerif',int(size*.38)),fill='#f3efe7',anchor='mm')
    im.save(root/f'icons/icon-{size}.png')
im=Image.new('RGB',(1200,630),'#f3efe7');d=ImageDraw.Draw(im)
d.rounded_rectangle((66,65,180,179),radius=57,fill='#20231f')
d.text((123,122),'1W',font=font('DejaVuSerif',40),fill='#f3efe7',anchor='mm')
d.text((218,94),'ONE CARD WISER',font=font('DejaVuSans-Bold',35),fill='#52624e')
d.text((65,245),'Build a mind',font=font('DejaVuSerif',69),fill='#171816')
d.text((65,340),'you’re proud of.',font=font('DejaVuSerif',69),fill='#171816')
d.text((68,525),'Daily ideas. Real examples. A little wiser.',font=font('DejaVuSans',29),fill='#6d6a62')
im.save(root/'social-preview.png')
print(f'Generated {len(urls)} sitemap URLs, social preview and installation icons')
