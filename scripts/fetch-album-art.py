"""Refresh the curated collection's artwork from Apple's public album catalog."""
import json, urllib.request, urllib.parse, concurrent.futures
from pathlib import Path
root = Path(__file__).resolve().parents[1]
rows = [
('The Dark Side of the Moon','Pink Floyd',1973,'Rock','#8c7bba','A prism, a spectrum, and one of music’s most recognizable visual identities.'),
('Abbey Road','The Beatles',1969,'Rock','#9ca57b','A crosswalk turned into a cultural landmark. Four figures, one perfectly ordinary street.'),
('Rumours','Fleetwood Mac',1977,'Rock','#b6a28d','The theatrical pairing of Stevie Nicks and Mick Fleetwood, photographed by Herbert Worthington.'),
('Unknown Pleasures','Joy Division',1979,'Alternative','#91929b','Peter Saville’s pulsar waves give scientific data an unexpectedly emotional presence.'),
('OK Computer','Radiohead',1997,'Alternative','#a7cbd0','Stanley Donwood and Thom Yorke’s fractured landscape of technology and unease.'),
('Nevermind','Nirvana',1991,'Rock','#509bc0','An underwater photograph that became the defining image of a generation of guitar music.'),
('Aladdin Sane','David Bowie',1973,'Rock','#da8578','Brian Duffy’s portrait turns a lightning bolt into a lasting symbol of reinvention.'),
('Purple Rain','Prince',1984,'Pop','#9c73b6','Purple light, a motorcycle, and a world built around Prince’s unmistakable presence.'),
('Thriller','Michael Jackson',1982,'Pop','#b4aa97','A white suit and a relaxed portrait by Dick Zimmerman: spare, confident, instantly familiar.'),
('Hounds of Love','Kate Bush',1985,'Pop','#b397b8','A dreamlike portrait with two hounds, photographed by John Carder Bush.'),
('Blue','Joni Mitchell',1971,'Folk','#587bc0','A close-cropped blue portrait that feels as intimate as the songs inside.'),
('Kind of Blue','Miles Davis',1959,'Jazz','#5d82a0','A performance portrait by Jay Maisel captures the quiet intensity of Miles Davis.'),
('A Love Supreme','John Coltrane',1965,'Jazz','#b39a7b','Chuck Stewart’s contemplative portrait gives this spiritual landmark a human center.'),
('What’s Going On','Marvin Gaye',1971,'Soul','#8b957a','Rain, a raised collar, and a gaze that looks beyond the frame.'),
('Songs in the Key of Life','Stevie Wonder',1976,'Soul','#c1844e','A warm, concentric portal into Stevie Wonder’s expansive musical world.'),
('Discovery','Daft Punk',2001,'Electronic','#a598c0','A liquid-metal wordmark with a rainbow edge, as playful and futuristic as the record.'),
('Selected Ambient Works 85-92','Aphex Twin',1992,'Electronic','#929c99','A stark emblem suspended in negative space. Electronic music reduced to a symbol.'),
('Illmatic','Nas',1994,'Rap','#b98c68','A childhood portrait layered over Queensbridge connects memory, place, and storytelling.'),
('The Low End Theory','A Tribe Called Quest',1991,'Rap','#a07b77','Red and green contours turn a painted figure into an unmistakable graphic rhythm.'),
('To Pimp a Butterfly','Kendrick Lamar',2015,'Rap','#96958c','A dense black-and-white group portrait that invites a closer reading of every face.')]
def fetch(pair):
 i,r=pair
 title,artist,year,genre,color,note=r
 known={0:1065973699,5:1440783617,18:278911460}
 query=urllib.parse.urlencode({'term':artist+' '+title,'entity':'album','limit':8})
 with urllib.request.urlopen('https://itunes.apple.com/search?'+query,timeout=40) as response: results=json.load(response)['results']
 def score(x):
  name=x.get('collectionName','').lower(); who=x.get('artistName','').lower()
  return (artist.lower()==who)*5 + (title.lower().replace('’',"'") in name.replace('’',"'"))*10 - ('tribute' in name)*20
 item=max(results,key=score)
 if i in known:
  with urllib.request.urlopen('https://itunes.apple.com/lookup?id='+str(known[i]),timeout=40) as response: item=json.load(response)['results'][0]
 if artist.lower() not in item['artistName'].lower(): raise ValueError('Artist mismatch for '+title)
 url=item['artworkUrl100'].replace('100x100bb','600x600bb')
 with urllib.request.urlopen(url,timeout=40) as response: (root/f'src/assets/albums/{i+1:02}.jpg').write_bytes(response.read())
 print(title,'=>',item['artistName'],item['collectionName'],flush=True)
 return dict(id=f'{i+1:02}',title=title,artist=artist,year=year,genre=genre,color=color,note=note,source=item['collectionViewUrl'])
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool: albums=list(pool.map(fetch,enumerate(rows)))
(root/'content/albums.json').write_text(json.dumps(albums,ensure_ascii=False,indent=2)+'\n')
