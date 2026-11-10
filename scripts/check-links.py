"""Check curated web links without crawling or changing their destinations."""
import concurrent.futures,json,ssl,urllib.request,urllib.error,sys,time
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
items=json.loads((ROOT/'content/resources.json').read_text())
def check(item):
 try:
  req=urllib.request.Request(item['url'],method='HEAD',headers={'User-Agent':'Mozilla/5.0 (compatible; PortfolioLinkCheck/1.0)'})
  with urllib.request.urlopen(req,timeout=8) as response:return item['id'],response.status
 except urllib.error.HTTPError as e:
  if e.code in (404,410):
   try:
    req=urllib.request.Request(item['url'],headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(req,timeout=6) as response:return item['id'],response.status
   except urllib.error.HTTPError as retry:return item['id'],retry.code
   except Exception:return item['id'],None
  return item['id'],e.code
 except Exception:return item['id'],None
results={}
with concurrent.futures.ThreadPoolExecutor(max_workers=18) as pool:
 for i,(key,status) in enumerate(pool.map(check,items)):
  results[key]=status
  if (i+1)%75==0:print(f'Checked {i+1}/{len(items)}',flush=True)
for item in items:
 code=results[item['id']]
 item['linkStatus']='available' if code and 200<=code<400 else 'broken' if code in (404,410) else 'unverified'
 item['checkedOn']='2026-11-10'
(ROOT/'content/resources.json').write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n')
(ROOT/'.local').mkdir(exist_ok=True)
(ROOT/'.local/link-check.json').write_text(json.dumps(results,indent=2))
from collections import Counter
print(dict(Counter(x['linkStatus'] for x in items)))
