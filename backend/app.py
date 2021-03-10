from flask import Flask, request, jsonify
from flask_mysqldb import MySQL

import datetime; 

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
    blog_status = insert_blog("Title", "PSP", "Details", "SCi", "wow", 1337.0001)
    return jsonify({"data": "Test API", "status": [search_status, tag_status, blog_status]})

@app.route('/get-blogs', methods=['GET'])
def retrieve_blog():
    cursor = mysql.connection.cursor()
    query_string = "SELECT * FROM blogs"
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

def insert_blog(title, author, details, tags, comments, time_taken):
    cur = mysql.connection.cursor()
    cur.execute("INSERT INTO blogs(title, author, details, tags, comments, time_taken) VALUES (%s,%s,%s,%s,%s,%s)", (title, author, details, tags, comments, time_taken,))
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