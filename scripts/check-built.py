"""Validate generated HTML and XML using Python's standard parsers."""
from html.parser import HTMLParser
from pathlib import Path
import xml.etree.ElementTree as ET
class Parser(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.stack=[]
 def error(self,message):raise ValueError(message)
root=Path(__file__).resolve().parent.parent/'dist'
for p in root.rglob('*.html'):
 parser=Parser();parser.feed(p.read_text());parser.close()
for p in ['sitemap.xml','feed.xml']:ET.parse(root/p)
print('HTML parsed and sitemap/RSS XML validated.')
