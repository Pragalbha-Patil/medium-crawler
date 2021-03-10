import urllib3
from bs4 import BeautifulSoup
import requests
import os
import csv
import unicodedata
import pandas as pd

def fetch_links(tag, suffix):
    url = 'https://medium.com/tag/' + tag
    urls = [url + '/' + s for s in suffix]
    links = []
    for url in urls:
        data = requests.get(url)
        soup = BeautifulSoup(data.content, 'html.parser')
        articles = soup.findAll('div', {"class": "postArticle-readMore"})
        for i in articles:
            links.append(i.a.get('href'))
    return links

def fetch_article(links):
    count = 0
    print("--- Links ---")
    print(links)
    articles = []
    for link in links:
        if(count == 10): # only fetch 10 articles
            break
        else:
            print("Count: " + str(count))
            count += 1
            article = {}
            data = requests.get(link)
            soup = BeautifulSoup(data.content, 'html.parser')
            # print(soup)
            # title = soup.findAll('title')[0]
            title = soup.findAll('meta', {"property": "og:title"})[0]
            title = title.get('content')
            author = soup.findAll('meta', {"name": "author"})[0]
            author = author.get('content')
            read = soup.findAll('meta', {"name": "twitter:data1"})[0]
            read = read.get('value')
            publish_timestamp = soup.findAll('meta', {"property": "article:published_time"})[0]
            publish_timestamp = publish_timestamp.get('content')
            # claps  = soup.findAll('button', {"data-action":"show-recommends"})[0].get_text()
            # article['claps'] = unicodedata.normalize('NFKD', claps)
            article['author'] = unicodedata.normalize('NFKD', author)
            article['link'] = link
            article['title'] = unicodedata.normalize('NFKD', title)
            article['read'] = unicodedata.normalize('NFKD', read)
            article['publish_time'] = unicodedata.normalize('NFKD', publish_timestamp)
            print("--- Title ---")
            print(title)
            paras = soup.findAll('p')
            text = ''
            nxt_line = '\n'
            for para in paras:
                text += unicodedata.normalize('NFKD',para.get_text()) + nxt_line
            article['blog'] = text
            print("--- Blog content ---")
            print(article['blog'])
            articles.append(article)
    print(articles)
    return articles

def save_to_csv(articles, csv_file,  should_write = True):
    csv_columns = ['author', 'link', 'title', 'read', 'publish_time', 'blog']
    print(csv_file)
    if should_write:
        with open(csv_file, 'w', encoding="utf-8") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=csv_columns, delimiter=',')
            writer.writeheader()
            for data in articles:
                writer.writerow(data)
            csvfile.close()
            print("file write successful")
    else:
        with open(csv_file, 'a+', encoding="utf-8") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=csv_columns,  delimiter=',')
            for data in articles:
                writer.writerow(data)
            csvfile.close()
            print("file append successful")


def main():
    should_write = True
    tag = input('\n Input tag: ')
    file_name = input('\n Input filename: ')
    if len(file_name.split('.')) == 1:
        file_name += '.csv'
    suffixes = ['', 'latest', 'archive/2000', 'archive/2001', 'archive/2002', 'archive/2003', 'archive/2004', 'archive/2005', 'archive/2006', 'archive/2007', 'archive/2008', 'archive/2009',
            'archive/2010', 'archive/2011', 'archive/2012', 'archive/2013', 'archive/2014', 'archive/2015', 'archive/2016', 'archive/2017', 'archive/2018']
    links = fetch_links(tag, suffixes)
    articles = fetch_article(links)
    save_to_csv(articles, file_name, should_write)
    should_write = False
if __name__ == '__main__':
    main()