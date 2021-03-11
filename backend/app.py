from flask import Flask, request, jsonify
from flask_mysqldb import MySQL

import datetime
import time

from scrape import fetch_links, fetch_articles, save_to_csv

app = Flask(__name__)

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'crawler'

mysql = MySQL(app)

@app.route('/test', methods=['GET'])
def test_db():
    ct = datetime.datetime.now() 
    search_status = insert_search_history("Sci", ct, "1")
    tag_status = insert_tags("Painting")
    blog_status = insert_blog("Coding is great", "PSP", "5mins", "Lorem ipsum dor", "coding", "wow what a blog", None, "google.com", 1)
    return jsonify({"data": "Test API", "status": [search_status, tag_status, blog_status]})

@app.route('/search', methods=['POST'])
def search():
    tag_to_search = request.json
    tag_to_search = tag_to_search['tag']
    print(tag_to_search)
    
    suffixes = ['', 'latest', 'archive/2000', 'archive/2001', 'archive/2002', 'archive/2003', 'archive/2004', 'archive/2005', 'archive/2006', 'archive/2007', 'archive/2008', 'archive/2009',
        'archive/2010', 'archive/2011', 'archive/2012', 'archive/2013', 'archive/2014', 'archive/2015', 'archive/2016', 'archive/2017', 'archive/2018'
    ]
    
    # return jsonify({"data": tag_to_search})
    
    links = fetch_links(tag_to_search, suffixes)
    articles = fetch_articles(links)
    
    insert_tags(tag_to_search)
    ct = datetime.datetime.now()
    insert_search_history(tag_to_search, ct, 1)
    try:
        for article in articles:
            title = str(article['title'])
            author = str(article['author'])
            blog = str(article['blog'])
            read = str(article['read'])
            publish_time = str(article['publish_time'])
            link = str(article['link'])
            time_taken = int(article['time_taken'])
            insert_blog(title, author, read, blog, tag_to_search, None, publish_time, link, time_taken)
    except:
        print("An exception occurred")
    finally:
        return jsonify({"search_tag":tag_to_search, "links":links, "articles": articles})

@app.route('/get-blogs', methods=['GET'])
def retrieve_blog():
    cursor = mysql.connection.cursor()
    query_string = "SELECT * FROM blogs"
    cursor.execute(query_string)
    data = cursor.fetchall()
    cursor.close()
    return jsonify({"data":data})

@app.route('/get-search-results', methods=['GET'])
def get_search_history():
    cursor = mysql.connection.cursor()
    query_string = "SELECT * FROM search_history"
    cursor.execute(query_string)
    data = cursor.fetchall()
    cursor.close()
    return jsonify({"data":data})


def insert_tags(tag):
    cur = mysql.connection.cursor()
    cur.execute("INSERT INTO tags(tag) VALUES (%s)", (tag,))
    row_count = cur.rowcount;
    mysql.connection.commit()
    cur.close()
    if(row_count): return 'Success'
    else: return 'Fail'

def insert_blog(title, author, details, blog, tags, comments, publish_time, link, time_taken):
    cur = mysql.connection.cursor()
    cur.execute("INSERT INTO blogs(title, author, details, blog, tags, comments, publish_time, link, time_taken) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)", (title, author, details, blog, tags, comments, publish_time, link, time_taken,))
    row_count = cur.rowcount;
    mysql.connection.commit()
    cur.close()
    if(row_count): return 'Success'
    else: return 'Fail'

def insert_search_history(search_tag, created_at, result_found):
    cur = mysql.connection.cursor()
    cur.execute("INSERT INTO search_history(search_tag, created_at, result_found) VALUES (%s,%s,%s)", (search_tag, created_at, result_found,))
    row_count = cur.rowcount;
    mysql.connection.commit()
    cur.close()
    if(row_count): return 'Success'
    else: return 'Fail'
    
if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)